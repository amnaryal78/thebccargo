import React, { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Check, Clock } from 'lucide-react';
import { adminDataService } from '../services/adminDataService';
import { AdminProfileRequest, AdminUserRole, PROFILE_FIELD_LABELS, ProfileField, ROLE_SUMMARY } from '../types';
import { useAuth } from '../../../context/AuthContext';
import { Avatar } from './Avatar';
import { roleLabel } from './PersonDialog';

const TEXT_FIELDS: ProfileField[] = ['full_name', 'phone', 'job_title', 'department'];
const input = 'w-full min-h-[44px] px-3 rounded-xl border border-[var(--line-strong)] bg-white text-[var(--ox-900)] placeholder:text-slate-500';

const statusStyle = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-50 text-emerald-800',
  declined: 'bg-red-50 text-red-700',
} as const;

/** Read-only profile set up by an admin. Staff can ask for a change; an admin approves it. */
export const MyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [me, setMe] = useState<AdminUserRole | null>(null);
  const [requests, setRequests] = useState<AdminProfileRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [field, setField] = useState<ProfileField>('full_name');
  const [value, setValue] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const profile = user?.email ? await adminDataService.fetchMyProfile(user.email) : null;
        setMe(profile);
        if (profile) setRequests(await adminDataService.fetchProfileRequests(profile.id).catch(() => { setUnavailable(true); return []; }));
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.email]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me || !user) return;
    setBusy(true);
    setMessage(null);
    try {
      let newValue = value;
      if (field === 'avatar_url') {
        if (!photo) throw new Error('Choose a photo first.');
        newValue = await adminDataService.uploadPendingAvatar(photo, user.id);
      }
      if (!newValue.trim()) throw new Error('Enter the new value.');
      const created = await adminDataService.requestProfileChange(me, field, newValue, note);
      setRequests((r) => [created, ...r]);
      setValue('');
      setNote('');
      setPhoto(null);
      setMessage({ kind: 'ok', text: 'Request sent. An admin will review it.' });
    } catch (err: any) {
      setMessage({ kind: 'error', text: err.message || 'Could not send the request.' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="h-40 rounded-3xl bg-[var(--surface-muted)] animate-pulse max-w-2xl mx-auto" aria-busy="true" />;

  if (!me) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-[var(--surface-subtle)] space-y-1">
        <h1 className="font-heading font-extrabold text-xl text-[var(--ox-900)]">My profile</h1>
        <p className="text-sm text-slate-700">No staff profile was found for {user?.email}. Ask an admin to add you under Users &amp; roles.</p>
      </div>
    );
  }

  const rows: [string, string | null | undefined][] = [
    ['Full name', me.full_name],
    ['Email', me.email],
    ['Phone', me.phone],
    ['Job title', me.job_title],
    ['Department', me.department],
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-[var(--ox-900)] tracking-tight">My profile</h1>
        <p className="text-sm text-slate-600 mt-1">Your details are set up by an admin. To change something, send a request below.</p>
      </div>

      <section className="p-5 rounded-3xl bg-white shadow-[var(--shadow-hard-sm)] space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={me.full_name} email={me.email} src={me.avatar_url} size={72} />
          <div className="min-w-0">
            <p className="font-heading font-bold text-lg text-[var(--ox-900)] truncate">{me.full_name || me.email}</p>
            <span className="inline-block mt-1 px-2.5 py-1 rounded-full bg-[var(--ox-100)] text-xs font-bold text-[var(--ox-900)] capitalize">{roleLabel(me.role)}</span>
            <p className="text-xs text-slate-600 mt-1">{ROLE_SUMMARY[me.role]}</p>
          </div>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-slate-600">{k}</dt>
              <dd className="font-medium text-[var(--ox-900)] break-words">{v || <span className="text-slate-500 font-normal">Not set</span>}</dd>
            </div>
          ))}
        </dl>
      </section>

      {unavailable ? (
        <div className="p-5 rounded-3xl bg-[var(--gd-50)] text-sm text-[var(--gd-900)]">Change requests are not switched on yet. Ask an admin to update your details.</div>
      ) : (
        <>
          <form onSubmit={submit} className="p-5 rounded-3xl bg-[var(--surface-subtle)] space-y-4">
            <h2 className="font-heading font-bold text-base text-[var(--ox-900)]">Request a change</h2>
            {message && (
              <div role={message.kind === 'error' ? 'alert' : 'status'} className={`flex items-center gap-2 p-3 rounded-2xl text-sm ${message.kind === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
                {message.kind === 'ok' && <Check className="w-4 h-4 shrink-0" />}{message.text}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="rq-field" className="block text-sm font-semibold text-[var(--ox-900)]">What should change?</label>
              <select id="rq-field" value={field} onChange={(e) => setField(e.target.value as ProfileField)} className={input}>
                {[...TEXT_FIELDS, 'avatar_url' as ProfileField].map((f) => <option key={f} value={f}>{PROFILE_FIELD_LABELS[f]}</option>)}
              </select>
            </div>
            {field === 'avatar_url' ? (
              <div className="space-y-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="min-h-[44px] px-4 rounded-xl border border-[var(--line-strong)] bg-white text-sm font-bold text-[var(--ox-900)] flex items-center gap-2 cursor-pointer">
                  <Camera className="w-4 h-4" />{photo ? photo.name : 'Choose photo'}
                </button>
                <p className="text-xs text-slate-600">JPG, PNG or WebP, up to 2 MB</p>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label="New profile photo" className="sr-only" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="rq-value" className="block text-sm font-semibold text-[var(--ox-900)]">New {PROFILE_FIELD_LABELS[field].toLowerCase()}</label>
                <input id="rq-value" maxLength={field === 'phone' ? 32 : 120} type={field === 'phone' ? 'tel' : 'text'} value={value} onChange={(e) => setValue(e.target.value)} className={input} />
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="rq-note" className="block text-sm font-semibold text-[var(--ox-900)]">Note for the admin (optional)</label>
              <input id="rq-note" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why this is changing" className={input} />
            </div>
            <button type="submit" disabled={busy} className="min-h-[44px] px-5 rounded-xl bg-[var(--ox-900)] text-white font-bold text-sm active:scale-[0.98] transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 w-full sm:w-auto">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}Send request
            </button>
          </form>

          {requests.length > 0 && (
            <section className="space-y-2">
              <h2 className="font-heading font-bold text-base text-[var(--ox-900)]">Your requests</h2>
              <ul className="space-y-2">
                {requests.map((r) => (
                  <li key={r.id} className="p-3 rounded-2xl bg-white shadow-[var(--shadow-hard-xs)] flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-[var(--ox-900)]">{PROFILE_FIELD_LABELS[r.field]}{r.field !== 'avatar_url' && `: ${r.new_value}`}</span>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyle[r.status]}`}>
                      {r.status === 'pending' && <Clock className="w-3 h-3" />}{r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
};
