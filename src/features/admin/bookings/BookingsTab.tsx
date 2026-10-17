import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAdminNotifications } from '../notifications/NotificationsContext';

interface AdminBooking {
  id: string;
  bookingRef: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  receiverName: string;
  receiverAddress: string | null;
  origin: string;
  destination: string;
  serviceMode: string | null;
  commodity: string | null;
  weightKg: number | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

const STATUSES = ['submitted', 'confirmed', 'picked_up', 'cancelled'];

export const BookingsTab: React.FC = () => {
  const { items: notifications } = useAdminNotifications();
  const [rows, setRows] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setError(null);
      setRows(
        (data ?? []).map((b: any) => ({
          id: b.id,
          bookingRef: b.booking_ref,
          senderName: b.sender_name,
          senderEmail: b.sender_email,
          senderPhone: b.sender_phone,
          receiverName: b.receiver_name,
          receiverAddress: b.receiver_address,
          origin: b.origin,
          destination: b.destination,
          serviceMode: b.service_mode,
          commodity: b.commodity,
          weightKg: b.weight_kg === null ? null : Number(b.weight_kg),
          notes: b.notes,
          status: b.status,
          createdAt: b.created_at,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);


  const setStatus = async (id: string, status: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    const { error: err } = await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (err) {
      setError(err.message);
      void load();
    }
  };

  const unreadRefs = new Set(notifications.filter((n) => n.kind === 'booking' && !n.isRead).map((n) => n.refId));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading font-bold text-2xl">Bookings</h1>
        <p className="text-sm opacity-70">Pickup requests sent from the website.</p>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm opacity-70">Loading…</p>}
      {!loading && rows.length === 0 && <p className="text-sm opacity-70">No bookings yet.</p>}

      <ul className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {rows.map((b) => (
          <li
            key={b.id}
            className={`rounded-xl border p-4 flex flex-col gap-2 ${
              unreadRefs.has(b.id) ? 'border-[#F2B705] bg-[#F2B705]/10' : 'border-[#E2E2DE]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono font-bold text-sm">{b.bookingRef}</span>
              <select
                value={b.status}
                onChange={(e) => void setStatus(b.id, e.target.value)}
                aria-label={`Status of ${b.bookingRef}`}
                className="text-sm rounded-lg border border-[#E2E2DE] bg-transparent px-2 py-1"
              >
                {[...new Set([b.status, ...STATUSES])].map((s) => (
                  <option key={s} value={s} className="text-black">
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm">
              <strong>{b.origin}</strong> to <strong>{b.destination}</strong>
              {b.serviceMode ? ` · ${b.serviceMode}` : ''}
              {b.weightKg ? ` · ${b.weightKg} kg` : ''}
            </p>
            <p className="text-sm opacity-80">
              From {b.senderName} ({b.senderEmail}
              {b.senderPhone ? `, ${b.senderPhone}` : ''}) to {b.receiverName}
              {b.receiverAddress ? `, ${b.receiverAddress}` : ''}
            </p>
            {b.commodity && <p className="text-sm opacity-80">Goods: {b.commodity}</p>}
            {b.notes && <p className="text-sm opacity-80">Notes: {b.notes}</p>}
            <p className="text-xs opacity-60">{new Date(b.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
