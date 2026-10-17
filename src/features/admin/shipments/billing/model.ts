/**
 * Shipment bill model + pure calculation.
 * Everything the customer bill and the box sheets print comes from computeBill(), so the
 * numbers on paper and the numbers saved in Supabase can never disagree.
 */
import { getMeatRatePerKg, isMeatAllowedForCountry } from '../../../estimator/engine';

export const BOX_LIMIT_KG = 20;
export const DEFAULT_BOX_RATE_NPR = 1100;
export const DEFAULT_LIQUID_RATE_NPR = 600;
export const HONG_KONG_MEAT_RATE_NPR = 1050;
export const DEFAULT_VALUE_UP_TO_NPR = 10000;

export const GOODS_UNITS = ['pcs', 'set', 'pair', 'btl', 'pkt', 'box', 'kg', 'strips'] as const;
export const LIQUID_KINDS = ['Ghee', 'Oil', 'Honey', 'Other'] as const;
export type LiquidKind = (typeof LIQUID_KINDS)[number];

export interface GoodsItem { id: string; name: string; unit: string; qty: number }
export interface LiquidItem { id: string; kind: LiquidKind; otherName: string; unit: string; qty: number }
export interface MeatItem { id: string; name: string; kgPerUnit: number; qty: number }
export interface BoxDraft {
  id: string;
  /** Optional weight of this single box, printed on its sheet. */
  weightKg: number | null;
  goods: GoodsItem[];
  liquids: LiquidItem[];
  meats: MeatItem[];
}
export interface ExtraCharge { id: string; name: string; amount: number }
export interface Party { name: string; country: string; phone: string; address: string; email: string }

export interface BillDraft {
  billNo: string;
  /** yyyy-mm-dd */
  date: string;
  sender: Party;
  receiver: Party;
  totalWeightKg: number;
  boxCountMode: 'auto' | 'manual';
  boxCountManual: number;
  boxes: BoxDraft[];
  /** null = use the rate sheet */
  weightChargeOverride: number | null;
  liquidRate: number;
  liquidChargeOverride: number | null;
  /** null = automatic rate for the destination */
  meatRateOverride: number | null;
  meatChargeOverride: number | null;
  boxRate: number;
  boxChargeOverride: number | null;
  extras: ExtraCharge[];
  valueUpToNpr: number;
}

export interface BillLine {
  key: string;
  description: string;
  qty: string;
  weight: string;
  rate: string;
  amount: number;
}

export interface BillResult {
  boxCount: number;
  autoBoxCount: number;
  baseCharge: number;
  baseAuto: number | null;
  liquidUnits: number;
  liquidCharge: number;
  meatKg: number;
  meatRate: number;
  meatCharge: number;
  meatAllowed: boolean;
  boxCharge: number;
  extrasTotal: number;
  lines: BillLine[];
  total: number;
  warnings: string[];
}

export const uid = (): string => Math.random().toString(36).slice(2, 10);

/** Round to 2 decimals, avoiding float drift (0.1 + 0.2). */
export const money = (n: number): number => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

/** 19.5 kg -> 1 box, 20 -> 1, 20.01 -> 2. The admin can still override. */
export function autoBoxCount(totalWeightKg: number): number {
  const w = num(totalWeightKg);
  if (w <= 0) return 1;
  return Math.max(1, Math.ceil(w / BOX_LIMIT_KG - 1e-9));
}

export function effectiveBoxCount(d: Pick<BillDraft, 'totalWeightKg' | 'boxCountMode' | 'boxCountManual'>): number {
  if (d.boxCountMode === 'manual') return Math.max(1, Math.min(200, Math.floor(num(d.boxCountManual)) || 1));
  return autoBoxCount(d.totalWeightKg);
}

export const emptyBox = (): BoxDraft => ({ id: uid(), weightKg: null, goods: [], liquids: [], meats: [] });

/** Keep box sections in step with the box count, never dropping items the admin already typed. */
export function resizeBoxes(boxes: BoxDraft[], count: number): BoxDraft[] {
  if (boxes.length === count) return boxes;
  if (boxes.length > count) return boxes.slice(0, count);
  return [...boxes, ...Array.from({ length: count - boxes.length }, emptyBox)];
}

export const isHongKong = (country: string): boolean => country.trim().toLowerCase().includes('hong kong');

export function autoMeatRate(country: string): number {
  if (isHongKong(country)) return HONG_KONG_MEAT_RATE_NPR;
  return getMeatRatePerKg(country);
}

/** Ghee is declared as Butter: the courier does not allow the word "ghee" on a bill. */
export const liquidKindLabel = (k: LiquidKind): string => (k === 'Ghee' ? 'Butter' : k);
export const liquidName = (l: LiquidItem): string => (l.kind === 'Other' ? l.otherName.trim() || 'Other liquid' : liquidKindLabel(l.kind));

export function newBillDraft(today: string): BillDraft {
  return {
    billNo: '',
    date: today,
    sender: { name: '', country: 'Nepal', phone: '', address: '', email: '' },
    receiver: { name: '', country: '', phone: '', address: '', email: '' },
    totalWeightKg: 0,
    boxCountMode: 'auto',
    boxCountManual: 1,
    boxes: [emptyBox()],
    weightChargeOverride: null,
    liquidRate: DEFAULT_LIQUID_RATE_NPR,
    liquidChargeOverride: null,
    meatRateOverride: null,
    meatChargeOverride: null,
    boxRate: DEFAULT_BOX_RATE_NPR,
    boxChargeOverride: null,
    extras: [],
    valueUpToNpr: DEFAULT_VALUE_UP_TO_NPR,
  };
}

/**
 * @param baseAuto freight from the live rate sheet for (destination, weight), or null when no rate is known.
 */
export function computeBill(d: BillDraft, baseAuto: number | null): BillResult {
  const warnings: string[] = [];
  const boxCount = effectiveBoxCount(d);
  const autoCount = autoBoxCount(d.totalWeightKg);
  const dest = d.receiver.country;

  const baseCharge = d.weightChargeOverride !== null ? money(num(d.weightChargeOverride)) : money(baseAuto ?? 0);
  if (d.weightChargeOverride === null && baseAuto === null && num(d.totalWeightKg) > 0 && dest) {
    warnings.push('No rate found for this country and weight. Type the freight charge by hand.');
  }

  const liquidUnits = d.boxes.slice(0, boxCount).reduce((s, b) => s + b.liquids.reduce((x, l) => x + num(l.qty), 0), 0);
  const liquidCharge = d.liquidChargeOverride !== null ? money(num(d.liquidChargeOverride)) : money(liquidUnits * num(d.liquidRate));

  const meatAllowed = isMeatAllowedForCountry(dest);
  const meatKg = money(
    d.boxes.slice(0, boxCount).reduce((s, b) => s + b.meats.reduce((x, m) => x + num(m.kgPerUnit) * num(m.qty), 0), 0)
  );
  const meatRate = d.meatRateOverride !== null ? num(d.meatRateOverride) : autoMeatRate(dest);
  const meatCharge = d.meatChargeOverride !== null ? money(num(d.meatChargeOverride)) : money(meatKg * meatRate);
  if (meatKg > 0 && !meatAllowed) warnings.push('Meat is normally not allowed for this country. Check before you ship.');

  const boxCharge = d.boxChargeOverride !== null ? money(num(d.boxChargeOverride)) : money(boxCount * num(d.boxRate));
  const extras = d.extras.filter((e) => e.name.trim() || num(e.amount));
  const extrasTotal = money(extras.reduce((s, e) => s + num(e.amount), 0));

  const w = money(num(d.totalWeightKg));
  const lines: BillLine[] = [
    { key: 'freight', description: 'Weight Cargo Items', qty: String(boxCount), weight: w.toFixed(2), rate: '-', amount: baseCharge },
    {
      key: 'box',
      description: 'Custom Box Charge',
      qty: String(boxCount),
      weight: '0.00',
      rate: d.boxChargeOverride !== null ? '-' : nf0(num(d.boxRate)),
      amount: boxCharge,
    },
  ];
  if (liquidCharge > 0 || liquidUnits > 0) {
    lines.push({
      key: 'liquid',
      description: 'Liquid Charge',
      qty: String(liquidUnits),
      weight: '0.00',
      rate: d.liquidChargeOverride !== null ? '-' : nf0(num(d.liquidRate)),
      amount: liquidCharge,
    });
  }
  if (meatCharge > 0 || meatKg > 0) {
    lines.push({
      key: 'meat',
      description: 'Meat Charge',
      qty: String(meatKg),
      weight: '0.00',
      rate: d.meatChargeOverride !== null ? '-' : nf0(meatRate),
      amount: meatCharge,
    });
  }
  extras.forEach((e, i) =>
    lines.push({ key: `extra-${i}`, description: e.name.trim() || 'Additional charge', qty: '1', weight: '0.00', rate: '-', amount: money(num(e.amount)) })
  );

  const total = money(lines.reduce((s, l) => s + l.amount, 0));
  return { boxCount, autoBoxCount: autoCount, baseCharge, baseAuto, liquidUnits, liquidCharge, meatKg, meatRate, meatCharge, meatAllowed, boxCharge, extrasTotal, lines, total, warnings };
}

const nf0 = (n: number): string => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
export const fmtMoney = (n: number): string => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------------------------------------------------------------- amount in words (Indian grouping)
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function below1000(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
    if (n) parts.push('and');
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ''));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(' ');
}

function wholeInWords(n: number): string {
  if (n === 0) return 'Zero';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (crore) parts.push(`${wholeInWords(crore)} Crore`);
  if (lakh) parts.push(`${below1000(lakh)} Lakh`);
  if (thousand) parts.push(`${below1000(thousand)} Thousand`);
  if (rest) {
    // "One Thousand and Five" reads better than "One Thousand Five"
    parts.push(parts.length && rest < 100 ? `and ${below1000(rest)}` : below1000(rest));
  }
  return parts.join(' ');
}

export function amountInWords(amount: number): string {
  const total = Math.round(Math.max(0, num(amount)) * 100);
  const rupees = Math.floor(total / 100);
  const paisa = total % 100;
  let out = `${wholeInWords(rupees)} Rupees`;
  if (paisa) out += ` and ${below1000(paisa)} Paisa`;
  return `${out} Only`;
}

// ---------------------------------------------------------------- bill number
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
/** BC + day + month + 2 letters, e.g. BC1810KT. Editable in the form; the database enforces uniqueness. */
export function generateBillNo(now: Date = new Date()): string {
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const l = () => LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return `BC${dd}${mm}${l()}${l()}`;
}

export function validateBill(d: BillDraft): string[] {
  const errs: string[] = [];
  if (!d.billNo.trim()) errs.push('Bill number is required.');
  if (!d.receiver.name.trim()) errs.push('Receiver name is required.');
  if (!d.receiver.country.trim()) errs.push('Receiver country is required.');
  if (d.receiver.phone.replace(/\D/g, '').length < 7) errs.push('Receiver phone needs the full number, not only the country code.');
  if (!d.receiver.address.trim()) errs.push('Receiver address is required.');
  if (!d.sender.name.trim()) errs.push('Sender name is required.');
  if (!(num(d.totalWeightKg) > 0)) errs.push('Total weight must be more than 0.');
  if (d.receiver.email.trim() && !/^\S+@\S+\.\S+$/.test(d.receiver.email.trim())) errs.push('Receiver email looks wrong.');
  d.extras.forEach((e, i) => {
    if (e.name.trim() && !Number.isFinite(num(e.amount))) errs.push(`Additional charge ${i + 1} needs an amount.`);
  });
  return errs;
}
