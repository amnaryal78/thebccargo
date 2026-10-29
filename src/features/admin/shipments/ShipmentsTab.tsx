import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPinned, Plus, Printer, Search, Trash2 } from 'lucide-react';
import { Button, ErrorState, Input, Select, Skeleton, StatusBadge } from '../../../design/primitives';
import { adminDataService, SHIPMENT_PAGE_SIZE } from '../services/adminDataService';
import { AdminShipment } from '../types';
import { useMyPermissions } from '../usePermissions';
import { MilestonesModal } from './MilestonesModal';
import { useAdminDialogs } from '../AdminConfirmDialog';

const STATUSES = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'customs_cleared', label: 'Customs cleared' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];
const statusLabel = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s.replace(/_/g, ' ');
const money = (n: number | null | undefined) => (n == null ? null : `Rs ${Number(n).toLocaleString('en-US')}`);
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const who = (s: AdminShipment) => s.receiver_name || s.consignee_company || '—';
const weight = (s: AdminShipment) => {
  const boxes = s.pieces || 1;
  return `${s.chargeable_weight_kg || s.gross_weight_kg || 0} kg · ${boxes} ${boxes === 1 ? 'box' : 'boxes'}`;
};

export const ShipmentsTab: React.FC = () => {
  const { confirm, notify } = useAdminDialogs();
  const permissions = useMyPermissions();
  const navigate = useNavigate();

  // Every filter lives in the URL, so the shell search, Today links and the back button all work.
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const status = params.get('status') ?? 'all';
  const stale = params.get('stale') === '1';
  const page = Math.max(0, Number(params.get('page')) || 0);
  const setFilter = (key: string, value: string) =>
    setParams((p) => {
      const n = new URLSearchParams(p);
      if (value && value !== 'all') n.set(key, value);
      else n.delete(key);
      if (key !== 'page') n.delete('page');
      return n;
    }, { replace: true });

  // Typing updates the box at once and the URL (and so the query) after a pause.
  const [typed, setTyped] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setTyped(q);
  }
  useEffect(() => {
    if (typed === q) return;
    const t = setTimeout(() => setFilter('q', typed.trim()), 300);
    return () => clearTimeout(t);
  });

  const [data, setData] = useState<{ rows: AdminShipment[]; total: number; key: string } | null>(null);
  const [error, setError] = useState<{ message: string; key: string } | null>(null);
  const [reload, setReload] = useState(0);
  const key = `${q}|${status}|${stale}|${page}|${reload}`;
  useEffect(() => {
    let live = true;
    adminDataService.fetchShipmentsPage({ q, status, stale, page }).then(
      (r) => live && setData({ ...r, key }),
      (e: Error) => live && setError({ message: e.message, key })
    );
    return () => {
      live = false;
    };
  }, [key, q, status, stale, page]);
  const loading = data?.key !== key && error?.key !== key;
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / SHIPMENT_PAGE_SIZE));

  const [tracking, setTracking] = useState<AdminShipment | null>(null);

  const handleDelete = async (s: AdminShipment) => {
    if (!(await confirm({ title: 'Delete this shipment?', body: <>Shipment <strong className="font-mono">{s.tracking_number}</strong> and all its tracking updates will be deleted. The customer's tracking number will stop working. This cannot be undone.</>, confirmLabel: 'Delete shipment', danger: true }))) return;
    try {
      await adminDataService.deleteShipment(s.id, s.tracking_number);
      setReload((n) => n + 1);
    } catch (err) {
      void notify((err as Error).message, 'Shipment not deleted');
    }
  };

  const filtered = !!(q || status !== 'all' || stale);
  const iconBtn = 'min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[var(--r-sm)] text-[var(--text-muted)] hover:bg-[var(--ox-50)] hover:text-[var(--text)] cursor-pointer';
  const actions = (s: AdminShipment) => (
    <div className="flex items-center justify-end">
      <button type="button" onClick={() => setTracking(s)} aria-label={`Tracking updates for ${s.tracking_number}`} title="Tracking updates" className={iconBtn}><MapPinned className="size-4" aria-hidden="true" /></button>
      <button type="button" onClick={() => navigate(`/admin/shipments/${s.id}?print=1`)} aria-label={`Print bill for ${s.tracking_number}`} title="Print" className={iconBtn}><Printer className="size-4" aria-hidden="true" /></button>
      {permissions.canManageShipments && (
        <button type="button" onClick={() => void handleDelete(s)} aria-label={`Delete shipment ${s.tracking_number}`} title="Delete" className={`${iconBtn} hover:!text-[var(--danger)] hover:!bg-[var(--danger-bg)]`}><Trash2 className="size-4" aria-hidden="true" /></button>
      )}
    </div>
  );
  // Only people who can edit open the bill editor; the others get the tracking view.
  const open = (s: AdminShipment) => (permissions.canManageShipments ? `/admin/shipments/${s.id}` : null);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-heading font-extrabold text-2xl lg:text-[28px] text-[var(--text)]">Shipments</h1>
          <p className="text-[var(--text-muted)] mt-1">
            {loading && !data ? 'Loading…' : `${total.toLocaleString('en-US')} ${total === 1 ? 'shipment' : 'shipments'}${filtered ? ' match' : ''}`}
          </p>
        </div>
        {permissions.canManageShipments && (
          <Button onClick={() => navigate('/admin/shipments/new')} leftIcon={<Plus className="size-4" aria-hidden="true" />} className="self-start sm:self-auto">New shipment</Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <Input
          label="Search shipments"
          hideLabelVisually
          type="search"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Tracking number, name, phone or destination"
          leftAdornment={<Search className="size-4" aria-hidden="true" />}
          containerClassName="md:max-w-md"
        />
        <Select label="Status" hideLabelVisually value={status} onChange={(e) => setFilter('status', e.target.value)} options={STATUSES} containerClassName="md:w-52" />
        <label className="inline-flex items-center gap-2 min-h-[44px] text-[15px] text-[var(--text)] cursor-pointer select-none">
          <input type="checkbox" checked={stale} onChange={(e) => setFilter('stale', e.target.checked ? '1' : '')} className="size-4 accent-[var(--brand)]" />
          No update for 3+ days
        </label>
        {filtered && (
          <Link to="/admin/shipments" className="min-h-[44px] inline-flex items-center text-[15px] font-semibold text-[var(--brand)] underline underline-offset-4">Clear filters</Link>
        )}
      </div>

      {error?.key === key ? (
        <ErrorState title="Shipments didn't load" description={error.message} actionLabel="Try again" onAction={() => setReload((n) => n + 1)} />
      ) : loading && !data ? (
        <div className="space-y-2" aria-busy="true">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
          <p className="font-semibold text-[var(--text)]">{filtered ? 'No shipments match.' : 'No shipments yet.'}</p>
          <p className="text-[var(--text-muted)] mt-1">{filtered ? 'Try another search or clear the filters.' : permissions.canManageShipments ? 'Create the first one with New shipment.' : 'Shipments appear here once the office creates them.'}</p>
        </div>
      ) : (
        <div className={loading ? 'opacity-60 transition-opacity' : ''} aria-busy={loading}>
          {/* Table from 768px */}
          <div className="hidden md:block rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] overflow-x-auto">
            <table className="w-full text-left text-[15px]">
              <thead className="border-b border-[var(--line)] text-sm text-[var(--text-muted)]">
                <tr>
                  <th scope="col" className="py-3 px-4 font-semibold whitespace-nowrap">Tracking number</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Receiver</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Destination</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Weight</th>
                  <th scope="col" className="py-3 px-4 font-semibold text-right">Total</th>
                  <th scope="col" className="py-3 px-4 font-semibold">Status</th>
                  <th scope="col" className="py-3 px-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {rows.map((s) => {
                  const to = open(s);
                  return (
                    <tr key={s.id} className="hover:bg-[var(--ox-50)]">
                      <td className="py-2 px-4">
                        {to ? <Link to={to} className="font-mono font-bold text-[var(--brand)] underline-offset-4 hover:underline whitespace-nowrap">{s.tracking_number}</Link> : <span className="font-mono font-bold whitespace-nowrap">{s.tracking_number}</span>}
                        <span className="block text-sm text-[var(--text-muted)]">{shortDate(s.created_at)}</span>
                      </td>
                      <td className="py-2 px-4 max-w-[16rem] [overflow-wrap:anywhere]">{who(s)}</td>
                      <td className="py-2 px-4 max-w-[12rem] [overflow-wrap:anywhere]">{s.destination}</td>
                      <td className="py-2 px-4 whitespace-nowrap tabular-nums text-[var(--text-muted)]">{weight(s)}</td>
                      <td className="py-2 px-4 whitespace-nowrap tabular-nums text-right font-semibold">{money(s.total_npr) ?? '—'}</td>
                      <td className="py-2 px-4"><StatusBadge status={statusLabel(s.status)} className="whitespace-nowrap" /></td>
                      <td className="py-1 px-2">{actions(s)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards below 768px */}
          <ul className="md:hidden space-y-3">
            {rows.map((s) => {
              const to = open(s);
              return (
                <li key={s.id} className="rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {to ? <Link to={to} className="font-mono font-bold text-[var(--brand)] [overflow-wrap:anywhere]">{s.tracking_number}</Link> : <span className="font-mono font-bold [overflow-wrap:anywhere]">{s.tracking_number}</span>}
                      <p className="text-[var(--text)] [overflow-wrap:anywhere]">{who(s)} · {s.destination}</p>
                    </div>
                    <StatusBadge status={statusLabel(s.status)} className="shrink-0" />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-[var(--text-muted)] tabular-nums">{weight(s)}{money(s.total_npr) ? ` · ${money(s.total_npr)}` : ''}</p>
                    {actions(s)}
                  </div>
                </li>
              );
            })}
          </ul>

          {pages > 1 && (
            <nav aria-label="Pages" className="flex items-center justify-between gap-3 pt-4">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setFilter('page', String(page - 1))}>Previous</Button>
              <span className="text-sm text-[var(--text-muted)] tabular-nums">Page {page + 1} of {pages}</span>
              <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setFilter('page', String(page + 1))}>Next</Button>
            </nav>
          )}
        </div>
      )}

      <MilestonesModal shipment={tracking} canManage={permissions.canManageMilestones} onClose={() => setTracking(null)} onChanged={() => setReload((n) => n + 1)} />
    </div>
  );
};
