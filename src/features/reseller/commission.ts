/** One order as returned by `get_my_reseller_orders()`. Commission is computed by the database. */
export interface ResellerOrder {
  id: string;
  tracking_number: string;
  created_at: string;
  destination: string;
  status: string;
  weight_kg: number;
  commission_npr: number;
}

export interface CommissionSummary {
  orders: number;
  weightKg: number;
  /** Delivered orders. */
  earnedNpr: number;
  /** Not yet delivered and not cancelled. */
  pendingNpr: number;
  cancelled: number;
}

export interface MonthBucket {
  key: string; // YYYY-MM in Nepal time
  label: string; // e.g. "Oct 2026"
  orders: number;
  weightKg: number;
  commissionNpr: number;
}

const isCancelled = (s: string) => s.toLowerCase() === 'cancelled';
const isDelivered = (s: string) => s.toLowerCase() === 'delivered';
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Calendar month of an order in Nepal time (the business runs on Asia/Kathmandu). */
export function monthKey(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kathmandu', year: 'numeric', month: '2-digit' }).formatToParts(new Date(iso));
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  return `${y}-${m}`;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Totals for a list of orders. Cancelled orders count as orders but add no weight or commission. */
export function summarize(orders: ResellerOrder[]): CommissionSummary {
  const out: CommissionSummary = { orders: orders.length, weightKg: 0, earnedNpr: 0, pendingNpr: 0, cancelled: 0 };
  for (const o of orders) {
    if (isCancelled(o.status)) {
      out.cancelled += 1;
      continue;
    }
    out.weightKg += o.weight_kg;
    if (isDelivered(o.status)) out.earnedNpr += o.commission_npr;
    else out.pendingNpr += o.commission_npr;
  }
  out.weightKg = round2(out.weightKg);
  out.earnedNpr = round2(out.earnedNpr);
  out.pendingNpr = round2(out.pendingNpr);
  return out;
}

/** Per-month totals, newest first. Cancelled orders are left out of weight and commission. */
export function byMonth(orders: ResellerOrder[]): MonthBucket[] {
  const map = new Map<string, MonthBucket>();
  for (const o of orders) {
    const key = monthKey(o.created_at);
    const b = map.get(key) ?? { key, label: monthLabel(key), orders: 0, weightKg: 0, commissionNpr: 0 };
    b.orders += 1;
    if (!isCancelled(o.status)) {
      b.weightKg = round2(b.weightKg + o.weight_kg);
      b.commissionNpr = round2(b.commissionNpr + o.commission_npr);
    }
    map.set(key, b);
  }
  return [...map.values()].sort((a, b) => b.key.localeCompare(a.key));
}

/** Whole rupees stay whole (Rs 925); anything with paisa shows two digits (Rs 2,887.50). */
export const formatNpr = (n: number) => {
  const digits = Number.isInteger(n) ? 0 : 2;
  return `Rs ${n.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};
export const formatKg = (n: number) => `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })} kg`;
