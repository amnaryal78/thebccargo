import React, { useEffect, useMemo, useState } from 'react';
import { Package, Scale, Wallet, Hourglass, AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton, SkeletonGroup } from '../../design/primitives/Skeleton';
import { fetchMyResellerOrders } from '../../services/accountService';
import { byMonth, formatKg, formatNpr, monthKey, summarize, type ResellerOrder } from './commission';

const STATUS_STYLE: Record<string, string> = {
  delivered: 'bg-emerald-50 text-emerald-800',
  cancelled: 'bg-slate-100 text-slate-600 line-through',
};
const statusText = (s: string) => (s ? s.replace(/_/g, ' ') : 'pending');

const Card: React.FC<{ icon: React.ElementType; label: string; value: string; hint?: string; accent?: boolean }> = ({ icon: Icon, label, value, hint, accent }) => (
  <div className={`p-3 sm:p-4 rounded-2xl min-w-0 ${accent ? 'bg-[var(--gd-50)]' : 'bg-[var(--surface-subtle)]'}`}>
    <p className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-600">
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {label}
    </p>
    <p className="font-heading font-extrabold text-lg sm:text-2xl text-[var(--ox-900)] mt-1 break-words">{value}</p>
    {hint && <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>}
  </div>
);

/** Reseller view: orders sent under their name, weight per order and commission (Rs 50 per kg, computed by the database). */
export const ResellerDashboard: React.FC = () => {
  const [orders, setOrders] = useState<ResellerOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<string>('all');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    fetchMyResellerOrders()
      .then((rows) => live && setOrders(rows))
      .catch(() => live && setError('We could not load your orders. Please try again.'));
    return () => {
      live = false;
    };
  }, [attempt]);

  const months = useMemo(() => byMonth(orders ?? []), [orders]);
  const visible = useMemo(
    () => (orders ?? []).filter((o) => month === 'all' || monthKey(o.created_at) === month),
    [orders, month]
  );
  const total = useMemo(() => summarize(visible), [visible]);
  const thisMonth = useMemo(() => {
    const key = monthKey(new Date().toISOString());
    return summarize((orders ?? []).filter((o) => monthKey(o.created_at) === key));
  }, [orders]);
  const chart = months.slice(0, 6).reverse();
  const maxCommission = Math.max(1, ...chart.map((m) => m.commissionNpr));

  if (error) {
    return (
      <section aria-labelledby="rs-h" className="p-5 rounded-3xl bg-white shadow-[var(--shadow-hard-sm)]">
        <h2 id="rs-h" className="font-heading font-extrabold text-lg text-[var(--ox-900)]">My orders and commission</h2>
        <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p>
        <button type="button" onClick={() => { setError(null); setOrders(null); setAttempt((n) => n + 1); }} className="mt-3 inline-flex items-center gap-1.5 min-h-11 px-4 rounded-xl bg-[var(--ox-900)] text-white text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gd-500)]">
          <RefreshCw className="w-4 h-4" aria-hidden="true" /> Try again
        </button>
      </section>
    );
  }

  if (orders === null) {
    return (
      <SkeletonGroup label="Loading your orders" className="p-5 rounded-3xl bg-white shadow-[var(--shadow-hard-sm)] space-y-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </SkeletonGroup>
    );
  }

  return (
    <section aria-labelledby="rs-h" className="p-5 sm:p-6 rounded-3xl bg-white shadow-[var(--shadow-hard-sm)] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="rs-h" className="font-heading font-extrabold text-lg sm:text-xl text-[var(--ox-900)]">My orders and commission</h2>
          <p className="text-xs text-slate-600 mt-0.5">You earn Rs 50 for every kg you send.</p>
        </div>
        {orders.length > 0 && (
          <label className="text-xs font-semibold text-slate-700 flex flex-col gap-1">
            Show
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="min-h-11 px-3 rounded-xl border border-slate-300 bg-white text-sm text-[var(--ox-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gd-500)]"
            >
              <option value="all">All time</option>
              {months.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card icon={Package} label="Orders" value={String(total.orders)} hint={total.cancelled ? `${total.cancelled} cancelled` : undefined} />
        <Card icon={Scale} label="Weight sent" value={formatKg(total.weightKg)} />
        <Card icon={Wallet} label="Commission earned" value={formatNpr(total.earnedNpr)} hint="Delivered orders" accent />
        <Card icon={Hourglass} label="Commission pending" value={formatNpr(total.pendingNpr)} hint="On the way" />
      </div>

      {month === 'all' && (
        <p className="text-sm text-slate-700 rounded-2xl bg-[var(--ox-50)] px-4 py-3">
          <span className="font-semibold">This month:</span> {thisMonth.orders} order{thisMonth.orders === 1 ? '' : 's'} · {formatKg(thisMonth.weightKg)} · {formatNpr(thisMonth.earnedNpr + thisMonth.pendingNpr)} commission
        </p>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-2xl bg-[var(--surface-subtle)]">
          <Package className="w-8 h-8 mx-auto text-slate-400" aria-hidden="true" />
          <p className="mt-2 font-semibold text-[var(--ox-900)]">No orders yet</p>
          <p className="text-sm text-slate-600 mt-1">When our team books a parcel under your name, it shows here with its weight and your commission.</p>
        </div>
      ) : (
        <>
          {chart.length > 1 && month === 'all' && (
            <figure>
              <figcaption className="text-sm font-semibold text-[var(--ox-900)] mb-2">Last {chart.length} months</figcaption>
              <ul className="space-y-2">
                {chart.map((m) => (
                  <li key={m.key} className="grid grid-cols-[4.5rem_1fr] sm:grid-cols-[5.5rem_1fr_9rem] items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">{m.label}</span>
                    <span className="h-3 rounded-full bg-[var(--ox-50)] overflow-hidden" aria-hidden="true">
                      <span className="block h-full rounded-full bg-[var(--gd-500)] motion-safe:transition-[width] motion-safe:duration-500" style={{ width: `${(m.commissionNpr / maxCommission) * 100}%` }} />
                    </span>
                    <span className="col-start-2 sm:col-start-auto text-slate-700">{formatKg(m.weightKg)} · {formatNpr(m.commissionNpr)}</span>
                  </li>
                ))}
              </ul>
            </figure>
          )}

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Your orders with weight and commission</caption>
              <thead>
                <tr className="text-left text-xs text-slate-600 border-b border-slate-200">
                  <th scope="col" className="py-2 pr-3 font-semibold">Date</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Tracking</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">To</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Status</th>
                  <th scope="col" className="py-2 pr-3 font-semibold text-right">Weight</th>
                  <th scope="col" className="py-2 font-semibold text-right">Commission</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 pr-3 whitespace-nowrap text-slate-700">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-[var(--ox-900)]">{o.tracking_number}</td>
                    <td className="py-2.5 pr-3 text-slate-700">{o.destination}</td>
                    <td className="py-2.5 pr-3"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[o.status.toLowerCase()] ?? 'bg-[var(--gd-50)] text-[var(--gd-800)]'}`}>{statusText(o.status)}</span></td>
                    <td className="py-2.5 pr-3 text-right whitespace-nowrap">{formatKg(o.weight_kg)}</td>
                    <td className="py-2.5 text-right whitespace-nowrap font-semibold text-[var(--ox-900)]">{formatNpr(o.commission_npr)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 font-semibold text-[var(--ox-900)]">
                  <td colSpan={4} className="py-2.5 pr-3">Total ({visible.length} order{visible.length === 1 ? '' : 's'})</td>
                  <td className="py-2.5 pr-3 text-right whitespace-nowrap">{formatKg(total.weightKg)}</td>
                  <td className="py-2.5 text-right whitespace-nowrap">{formatNpr(total.earnedNpr + total.pendingNpr)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="sm:hidden space-y-2" aria-label="Your orders">
            {visible.map((o) => (
              <li key={o.id} className="p-3 rounded-2xl bg-[var(--surface-subtle)]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[var(--ox-900)] break-all">{o.tracking_number}</span>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLE[o.status.toLowerCase()] ?? 'bg-[var(--gd-50)] text-[var(--gd-800)]'}`}>{statusText(o.status)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{new Date(o.created_at).toLocaleDateString()} · {o.destination}</p>
                <p className="flex justify-between text-sm mt-1.5">
                  <span>{formatKg(o.weight_kg)}</span>
                  <span className="font-semibold text-[var(--ox-900)]">{formatNpr(o.commission_npr)}</span>
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-[11px] text-slate-500">
        Commission = Rs 50 × total weight of each order. It is earned when the order is delivered. Cancelled orders earn nothing.
      </p>
    </section>
  );
};
