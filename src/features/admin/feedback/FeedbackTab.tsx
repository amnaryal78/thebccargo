import React, { useCallback, useEffect, useState } from 'react';
import { Check, EyeOff, Star, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { friendlyError } from '../friendlyError';
import { useAdminNotifications } from '../notifications/NotificationsContext';
import { AdminPermissionGate } from '../AdminPermissionGate';
import { useAdminDialogs } from '../AdminConfirmDialog';

interface AdminReview {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
}

export const FeedbackTab: React.FC = () => {
  const { confirm } = useAdminDialogs();
  const { items: notifications } = useAdminNotifications();
  const [rows, setRows] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (err) {
      setError(friendlyError(err));
    } else {
      setError(null);
      setRows(
        (data ?? []).map((r: any) => ({
          id: r.id,
          name: r.customer_name,
          role: r.role,
          company: r.company,
          rating: r.rating,
          comment: r.comment,
          approved: Boolean(r.approved),
          createdAt: r.created_at,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);


  const setApproved = async (id: string, approved: boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)));
    const { error: err } = await supabase.from('reviews').update({ approved, verified: approved }).eq('id', id);
    if (err) {
      setError(friendlyError(err));
      void load();
    }
  };

  const remove = async (id: string) => {
    if (!(await confirm({ title: 'Delete this feedback?', body: 'It will be removed for good. To take it off the website but keep it, choose Hide instead.', confirmLabel: 'Delete feedback', danger: true }))) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    const { error: err } = await supabase.from('reviews').delete().eq('id', id);
    if (err) {
      setError(friendlyError(err));
      void load();
    }
  };

  const unreadRefs = new Set(notifications.filter((n) => n.kind === 'review' && !n.isRead).map((n) => n.refId));

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div>
        <h1 className="font-heading font-extrabold text-2xl lg:text-[28px] text-[var(--text)]">Feedback</h1>
        <p className="text-sm opacity-70">New feedback stays hidden until you approve it.</p>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm opacity-70">Loading…</p>}
      {!loading && rows.length === 0 && <p className="text-sm opacity-70">No feedback yet.</p>}

      <ul className="flex flex-col gap-3">
        {rows.map((r) => (
          <li
            key={r.id}
            className={`rounded-xl border p-4 flex flex-col gap-2 ${
              unreadRefs.has(r.id) ? 'border-gd-500 bg-gd-500/10' : 'border-[#E2E2DE]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-sm">{r.name}</span>
                {(r.role || r.company) && (
                  <span className="text-sm opacity-70"> · {[r.role, r.company].filter(Boolean).join(', ')}</span>
                )}
              </div>
              <span className="inline-flex items-center gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < r.rating ? 'fill-gd-500 text-gd-500' : 'opacity-30'}`}
                  />
                ))}
              </span>
            </div>
            <p className="text-sm">{r.comment}</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs opacity-60">
                {new Date(r.createdAt).toLocaleString()} · {r.approved ? 'Shown on website' : 'Hidden'}
              </span>
              <AdminPermissionGate needs="canManageInquiries">
              <div className="flex gap-2">
                {r.approved ? (
                  <button
                    type="button"
                    onClick={() => void setApproved(r.id, false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E2DE] text-sm font-semibold cursor-pointer"
                  >
                    <EyeOff className="w-4 h-4" />
                    Hide
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void setApproved(r.id, true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gd-500 text-ox-900 text-sm font-bold cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void remove(r.id)}
                  aria-label="Delete feedback"
                  className="p-2 rounded-lg border border-[#E2E2DE] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              </AdminPermissionGate>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
