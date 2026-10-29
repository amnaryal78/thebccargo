import { SheetQuoteResult, LIQUID_FEE_PER_BOTTLE_NPR } from './engine';
import { PICKUP_AREAS } from './pickup';
import { buildBillPdf, billCodeFor } from './billPdf';

/** Every choice a shared /rates link carries. dest and weight are the names RatesPage already reads. */
export interface ShareState {
  country: string;
  weightKg: number;
  liquidBottles: number;
  meatKg: number;
  medicine: boolean;
  pickupArea: string;
}

export const buildShareUrl = (origin: string, s: ShareState): string => {
  const p = new URLSearchParams({ dest: s.country, weight: String(s.weightKg) });
  if (s.liquidBottles > 0) p.set('liq', String(s.liquidBottles));
  if (s.meatKg > 0) p.set('meat', String(s.meatKg));
  if (s.medicine) p.set('med', '1');
  if (s.pickupArea) p.set('pickup', s.pickupArea);
  return `${origin}/rates?${p.toString()}`;
};

const count = (v: string | null, max: number) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : 0;
};

/** Reads the special-item choices from a shared link. Untrusted input: clamp numbers, allow only known pickup areas. */
export const readShareParams = (search: string = typeof window === 'undefined' ? '' : window.location.search) => {
  const p = new URLSearchParams(search);
  const pickup = p.get('pickup') || '';
  return {
    liquidBottles: count(p.get('liq'), 999),
    meatKg: count(p.get('meat'), 1000),
    medicine: p.get('med') === '1',
    pickupArea: (PICKUP_AREAS as readonly string[]).includes(pickup) ? pickup : '',
  };
};

const nf = (n: number) => n.toLocaleString('en-US');

/** Plain-text bill for chat apps. */
export const quoteText = (q: SheetQuoteResult, url: string): string =>
  [
    `BC Cargo price: Nepal to ${q.destinationName}`,
    `Weight: ${q.totalWeightKg} kg (${q.boxCount} ${q.boxCount === 1 ? 'box' : 'boxes'})`,
    `Shipping: Rs ${nf(q.baseShippingCharge)}`,
    `Box charge: Rs ${nf(q.boxCharge)}`,
    q.pickupFeeNpr ? `Home pickup (${q.pickupArea}): Rs ${nf(q.pickupFeeNpr)}` : '',
    q.liquidCharge ? `Liquid (${q.liquidBottles} btl x Rs ${nf(LIQUID_FEE_PER_BOTTLE_NPR)}): Rs ${nf(q.liquidCharge)}` : '',
    q.meatCharge ? `Meat: Rs ${nf(q.meatCharge)}` : '',
    q.medicineOnRequest ? 'Medicine: contact us for the price' : '',
    `TOTAL: Rs ${nf(q.totalNpr)}`,
  ]
    .filter(Boolean)
    .join('\n') + `\n\nSee this price: ${url}`;

/**
 * Opens the phone's share sheet with the bill PDF + text + link.
 * Falls back to text + link only, then to copying it to the clipboard.
 */
export const shareQuote = async (q: SheetQuoteResult, url: string): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> => {
  const text = quoteText(q, url);
  const title = `BC Cargo price to ${q.destinationName}`;
  if (navigator.share) {
    try {
      const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const file = new File([buildBillPdf(q, date)], `${billCodeFor(q)}.pdf`, { type: 'application/pdf' });
      const withFile = { title, text, files: [file] };
      // url is inside text already: some apps drop text when url is also set.
      await navigator.share(navigator.canShare?.(withFile) ? withFile : { title, text });
      return 'shared';
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
};
