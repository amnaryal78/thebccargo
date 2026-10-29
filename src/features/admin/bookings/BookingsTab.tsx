import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PackagePlus } from 'lucide-react';
import { ErrorState, Select, Skeleton, StatusBadge } from '../../../design/primitives';
import { adminDataService } from '../services/adminDataService';
import { useAdminNotifications } from '../notifications/NotificationsContext';
import { useMyPermissions } from '../usePermissions';
import { useAdminDialogs } from '../AdminConfirmDialog';
import type { AdminBooking } from '../types';

type Row = AdminBooking & { shipment: { id: string; tracking_number: string } | null };

const STATUSES = [
  { value: 'submitted', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'picked_up', label: 'Picked up' },
  { value: 'cancelled', label: 'Cancelled' },
];
const FILTERS = [{ value: 'all', label: 'All bookings' }, ...STATUSES];
const label = (s: string) => STATUSES.find((x) => x.value === s)?.label ?? s.replace(/_/g, ' ');
const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const BookingsTab: React.FC = () => {
  const { notify } = useAdminDialogs();
  const { items: notifications } = useAdminNotifications();
  const perms = useMyPermissions();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const filter = params.get('status') ?? 'all';

  const load = useCallback(() => {
    adminDataService.fetchBookings().then((r) => { setError(null); setRows(r); }, (e: Error) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const setStatus = async (b: Row, status: string) => {
    setRows((prev) => prev?.map((r) => (r.id === b.id ? { ...r, status } : r)) ?? prev);
    try {
      await adminDataService.setBookingStatus(b.id, status);
    } catch (e) {
      void notify((e as Error).message, 'Status not changed');
      load();
    }
  };

  const unread = new Set(notifications.filter((n) => n.kind === 'booking' && !n.isRead).map((n) => n.refId));
  const shown = (rows ?? []).filter((b) => filter === 'all' || b.status === filter);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-heading font-extrabold text-2xl lg:text-[28px] text-[var(--text)]">Bookings</h1>
          <p className="text-[var(--text-muted)] mt-1">Pickup requests sent from the website. Turn one into a shipment when the goods arrive.</p>
        </div>
        <Select label="Show" hideLabelVisually value={filter} options={FILTERS} onChange={(e) => setParams(e.target.value === 'all' ? {} : { status: e.target.value }, { replace: true })} containerClassName="sm:w-48" />
      </div>

      {error ? (
        <ErrorState title="Bookings didn't load" description={error} actionLabel="Try again" onAction={load} />
      ) : !rows ? (
        <div className="space-y-2" aria-busy="true">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
      ) : shown.length === 0 ? (
        <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
          <p className="font-semibold text-[var(--text)]">{filter === 'all' ? 'No bookings yet.' : `No ${label(filter).toLowerCase()} bookings.`}</p>
          <p className="text-[var(--text-muted)] mt-1">New pickup requests from the website appear here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((b) => (
            <li key={b.id} className={`rounded-[var(--r-md)] border bg-[var(--surface)] p-4 sm:p-5 space-y-3 ${unread.has(b.id) ? 'border-[var(--gd-500)] border-l-4' : 'border-[var(--line)]'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono font-bold text-[var(--text)]">{b.booking_ref}</p>
                  <p className="text-sm text-[var(--text-muted)]">{when(b.created_at)}{unread.has(b.id) && <span className="ml-2 font-semibold text-[var(--accent-text)]">New</span>}</p>
                </div>
                {perms.canManageInquiries ? (
                  <Select label={`Status of ${b.booking_ref}`} hideLabelVisually value={b.status} onChange={(e) => void setStatus(b, e.target.value)} options={STATUSES.some((s) => s.value === b.status) ? STATUSES : [{ value: b.status, label: label(b.status) }, ...STATUSES]} containerClassName="!w-44 shrink-0" />
                ) : (
                  <StatusBadge status={label(b.status)} className="whitespace-nowrap" />
                )}
              </div>

              <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 text-[15px]">
                <div className="min-w-0">
                  <dt className="text-sm text-[var(--text-muted)]">From</dt>
                  <dd className="[overflow-wrap:anywhere]">{b.sender_name} · {b.origin}<br /><a href={`mailto:${b.sender_email}`} className="text-[var(--brand)] underline underline-offset-4">{b.sender_email}</a>{b.sender_phone && <> · <a href={`tel:${b.sender_phone}`} className="text-[var(--brand)] underline underline-offset-4">{b.sender_phone}</a></>}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-sm text-[var(--text-muted)]">To</dt>
                  <dd className="[overflow-wrap:anywhere]">{b.receiver_name} · {b.destination}{b.receiver_address && <><br />{b.receiver_address}</>}</dd>
                </div>
                {(b.weight_kg || b.commodity) && (
                  <div className="min-w-0">
                    <dt className="text-sm text-[var(--text-muted)]">Goods</dt>
                    <dd className="[overflow-wrap:anywhere]">{[b.commodity, b.weight_kg ? `${Number(b.weight_kg)} kg` : null, b.box_count ? `${b.box_count} ${b.box_count === 1 ? 'box' : 'boxes'}` : null].filter(Boolean).join(' · ')}</dd>
                  </div>
                )}
                {b.notes && (
                  <div className="min-w-0 sm:col-span-2">
                    <dt className="text-sm text-[var(--text-muted)]">Notes</dt>
                    <dd className="whitespace-pre-line [overflow-wrap:anywhere]">{b.notes}</dd>
                  </div>
                )}
              </dl>

              {b.shipment ? (
                <p className="text-[15px]">Shipment <Link to={`/admin/shipments/${b.shipment.id}`} className="font-mono font-bold text-[var(--brand)] underline underline-offset-4">{b.shipment.tracking_number}</Link> was made from this booking.</p>
              ) : perms.canManageShipments && b.status !== 'cancelled' ? (
                <Link to={`/admin/shipments/new?booking=${b.id}`} className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-[var(--r-sm)] bg-[var(--brand)] text-white font-semibold hover:opacity-95">
                  <PackagePlus className="size-4" aria-hidden="true" /> Create shipment from this booking
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
