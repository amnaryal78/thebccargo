import React, { useEffect, useId, useRef, useState } from 'react';
import { Loader2, Phone, Mail, CalendarDays, MapPin, Pencil, Check, X, Package, PackageCheck, CalendarRange } from 'lucide-react';
import { Skeleton, SkeletonGroup } from '../design/primitives/Skeleton';
import {
  fetchMyAccountProfile,
  fetchMyLocation,
  saveMyLocation,
  validateLocation,
  LOCATION_MAX,
  type AccountProfile,
} from '../services/accountService';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../features/admin/users/Avatar';
import { SEOHead } from '../components/SEOHead';
import { ResellerDashboard } from '../features/reseller/ResellerDashboard';

const Stat: React.FC<{ icon: React.ElementType; label: string; value: number | null }> = ({ icon: Icon, label, value }) => (
  <div className="p-3 sm:p-4 rounded-2xl bg-[var(--surface-subtle)] min-w-0">
    <p className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-600">
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {label}
    </p>
    <p className="font-heading font-extrabold text-xl sm:text-2xl text-[var(--ox-900)] mt-1">{value ?? '—'}</p>
  </div>
);

const Row: React.FC<{ icon: React.ElementType; label: string; children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
  <li className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <span className="mt-0.5 w-8 h-8 shrink-0 rounded-xl bg-[var(--ox-50)] text-[var(--ox-900)] grid place-items-center" aria-hidden="true">
      <Icon className="w-4 h-4" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="text-sm text-[var(--ox-900)] break-words">{children}</div>
    </div>
  </li>
);

type LocState = { status: 'loading' } | { status: 'ready'; value: string | null } | { status: 'unavailable' };

/** Location row: shows the saved city/area and lets the person edit it in place. */
const LocationRow: React.FC<{ userId: string }> = ({ userId }) => {
  const [loc, setLoc] = useState<LocState>({ status: 'loading' });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  const inputId = useId();
  const errId = useId();

  useEffect(() => {
    let live = true;
    fetchMyLocation(userId)
      .then((value) => live && setLoc({ status: 'ready', value }))
      .catch(() => live && setLoc({ status: 'unavailable' }));
    return () => {
      live = false;
    };
  }, [userId]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const start = () => {
    setDraft(loc.status === 'ready' ? loc.value ?? '' : '');
    setError(null);
    setSaved(false);
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    setError(null);
    requestAnimationFrame(() => editBtnRef.current?.focus());
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { value, error: msg } = validateLocation(draft);
    if (msg) return setError(msg);
    setSaving(true);
    setError(null);
    try {
      await saveMyLocation(userId, value);
      setLoc({ status: 'ready', value });
      setEditing(false);
      setSaved(true);
      requestAnimationFrame(() => editBtnRef.current?.focus());
    } catch {
      setError('We could not save it. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loc.status === 'loading') return <Row icon={MapPin} label="Location"><span className="text-slate-500">Loading…</span></Row>;
  if (loc.status === 'unavailable') return <Row icon={MapPin} label="Location"><span className="text-slate-500">Not available right now</span></Row>;

  return (
    <Row icon={MapPin} label="Location">
      {editing ? (
        <form onSubmit={save} className="mt-1 space-y-2" noValidate>
          <label htmlFor={inputId} className="sr-only">Your city or area</label>
          <input
            ref={inputRef}
            id={inputId}
            value={draft}
            maxLength={LOCATION_MAX + 20}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && cancel()}
            placeholder="e.g. Hetauda-4, Makwanpur"
            autoComplete="address-level2"
            aria-invalid={!!error}
            aria-describedby={error ? errId : undefined}
            className="w-full min-h-11 px-3 rounded-xl border border-slate-300 bg-white text-sm text-[var(--ox-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gd-500)] aria-[invalid=true]:border-red-500"
          />
          {error && <p id={errId} role="alert" className="text-xs text-red-700">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-xl bg-[var(--ox-900)] text-white text-sm font-semibold disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gd-500)]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Check className="w-4 h-4" aria-hidden="true" />}
              {saving ? 'Saving' : 'Save'}
            </button>
            <button type="button" onClick={cancel} disabled={saving} className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gd-500)]">
              <X className="w-4 h-4" aria-hidden="true" /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <span className={loc.value ? '' : 'text-slate-500'}>{loc.value || 'Add your city or area'}</span>
          <button
            ref={editBtnRef}
            type="button"
            onClick={start}
            aria-label={loc.value ? 'Edit location' : 'Add location'}
            className="shrink-0 inline-flex items-center gap-1 min-h-11 px-3 rounded-xl text-xs font-semibold text-[var(--ox-900)] hover:bg-[var(--ox-50)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--gd-500)]"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> {loc.value ? 'Edit' : 'Add'}
          </button>
        </div>
      )}
      {saved && !editing && <p role="status" className="text-xs text-emerald-700 mt-1">Saved.</p>}
    </Row>
  );
};

/** Profile for anyone signed in: who they are, their location and their orders. Resellers also get their commission dashboard. */
export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetchMyAccountProfile()
      .then((p) => live && setProfile(p))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  // Google gives a name and photo for everyone; the database profile wins when it has one.
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const name = profile?.full_name || (meta.full_name as string) || (meta.name as string) || null;
  const photo = profile?.avatar_url || (meta.avatar_url as string) || (meta.picture as string) || null;
  const email = profile?.email || user?.email || null;
  const started = profile?.started_at || user?.created_at || null;
  const counts = profile !== null;
  const roleText = profile?.role ? profile.role.replace('_', ' ') : 'Customer';
  const isReseller = profile?.role === 'reseller';

  return (
    <main className="min-h-[70vh] pt-28 pb-16 px-4">
      <SEOHead title="My profile | The BC Cargo" description="Your profile and order summary." noindex />
      <div className={`${isReseller ? 'max-w-4xl' : 'max-w-xl'} mx-auto space-y-5`}>
        {loading ? (
          <SkeletonGroup label="Loading your profile" className="rounded-3xl bg-white shadow-[var(--shadow-hard-sm)] p-6 space-y-4">
            <div className="flex items-center gap-4"><Skeleton variant="circle" width={72} /><Skeleton className="h-7 flex-1" /></div>
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-11 w-full" />)}
          </SkeletonGroup>
        ) : (
          <section aria-labelledby="profile-h" className="rounded-3xl bg-white shadow-[var(--shadow-hard-sm)] overflow-hidden">
            <div className="px-5 sm:px-6 pt-6 pb-5 bg-[var(--ox-50)] mb-1">
              <div className="flex items-center gap-4">
                <Avatar name={name} email={email} src={photo} size={72} />
                <div className="min-w-0">
                  <h1 id="profile-h" className="font-heading font-extrabold text-xl sm:text-2xl text-[var(--ox-900)] break-words">{name || email}</h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--gd-50)] text-[var(--gd-800)] text-[11px] font-bold uppercase tracking-wide capitalize">{roleText}</span>
                    {started && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                        <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" /> Member since {new Date(started).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-6 pb-6 space-y-5">
              <ul aria-label="Your details">
                {email && <Row icon={Mail} label="Email">{email}</Row>}
                <Row icon={Phone} label="Phone">{profile?.phone || <span className="text-slate-500">Not added yet</span>}</Row>
                {user?.id && <LocationRow userId={user.id} />}
              </ul>

              {!isReseller && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <Stat icon={Package} label="Total orders" value={counts ? profile.total_orders : null} />
                  <Stat icon={PackageCheck} label="Delivered" value={counts ? profile.completed_orders : null} />
                  <Stat icon={CalendarRange} label="This month" value={counts ? profile.orders_this_month : null} />
                </div>
              )}

              <p className="text-xs text-slate-600">
                {isReseller
                  ? 'Orders booked under your name appear below. To change your name, phone or photo, contact The BC Cargo team.'
                  : 'Orders are matched by your sign-in email. To change your name, phone or photo, contact The BC Cargo team.'}
              </p>
            </div>
          </section>
        )}
        {!loading && isReseller && <ResellerDashboard />}
      </div>
    </main>
  );
};
