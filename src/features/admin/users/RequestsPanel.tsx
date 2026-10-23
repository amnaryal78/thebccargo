import React, { useEffect, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminProfileRequest, PROFILE_FIELD_LABELS } from '../types';
import { Avatar } from './Avatar';

interface Props {
  canDecide: boolean;
  decidedBy: string;
  onMessage: (msg: string) => void;
  onError: (msg: string) => void;
  onPendingCount: (n: number) => void;
}

/** Admin inbox for profile change requests from staff. */
export const RequestsPanel: React.FC<Props> = ({ canDecide, decidedBy, onMessage, onError, onPendingCount }) => {
  const [requests, setRequests] = useState<AdminProfileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    adminDataService
      .fetchProfileRequests()
      .then((r) => {
        setRequests(r);
        onPendingCount(r.filter((x) => x.status === 'pending').length);
      })
      .catch(() => setUnavailable(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decide = async (req: AdminProfileRequest, approve: boolean) => {
    setBusyId(req.id);
    try {
      const done = await adminDataService.decideProfileRequest(req, approve, decidedBy);
      const next = requests.map((r) => (r.id === done.id ? done : r));
      setRequests(next);
      onPendingCount(next.filter((x) => x.status === 'pending').length);
      onMessage(approve ? 'Change approved and applied.' : 'Request declined.');
    } catch (err: any) {
      onError(`Could not update the request: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="h-24 rounded-3xl bg-[var(--surface-muted)] animate-pulse" aria-busy="true" />;
  if (unavailable) return <div className="p-5 rounded-3xl bg-[var(--gd-50)] text-sm text-[var(--gd-900)]">Profile requests are not switched on yet. They need the database update.</div>;
  if (!requests.length) {
    return (
      <div className="p-8 rounded-3xl bg-[var(--surface-subtle)] text-center space-y-1">
        <p className="font-heading font-bold text-[var(--ox-900)]">No requests</p>
        <p className="text-sm text-slate-600">When staff ask to change their name, phone or photo, it shows up here.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {requests.map((r) => (
        <li key={r.id} className="p-4 rounded-3xl bg-white shadow-[var(--shadow-hard-xs)] space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--ox-900)] break-all">{r.requester_email}</p>
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${r.status === 'pending' ? 'bg-amber-100 text-amber-900' : r.status === 'approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{r.status}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {r.field === 'avatar_url' && <Avatar src={r.new_value} email={r.requester_email} size={56} />}
            <div className="min-w-0">
              <p className="text-xs text-slate-600">{PROFILE_FIELD_LABELS[r.field]}</p>
              {r.field !== 'avatar_url' && <p className="font-medium text-[var(--ox-900)] break-words">{r.new_value}</p>}
            </div>
          </div>
          {r.note && <p className="text-sm text-slate-700">Note: {r.note}</p>}
          {r.status === 'pending' && canDecide && (
            <div className="flex gap-2">
              <button disabled={busyId === r.id} onClick={() => decide(r, true)} className="min-h-[40px] px-4 rounded-xl bg-[var(--ox-900)] text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
                {busyId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Approve
              </button>
              <button disabled={busyId === r.id} onClick={() => decide(r, false)} className="min-h-[40px] px-4 rounded-xl border border-[var(--line-strong)] bg-white text-sm font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
                <X className="w-4 h-4" />Decline
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};
