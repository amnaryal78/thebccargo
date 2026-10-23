import React, { useEffect, useState } from 'react';
import { Loader2, Phone, Mail, CalendarDays } from 'lucide-react';
import { fetchMyAccountProfile, type AccountProfile } from '../services/accountService';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../features/admin/users/Avatar';
import { SEOHead } from '../components/SEOHead';
import { ResellerDashboard } from '../features/reseller/ResellerDashboard';

const Stat: React.FC<{ label: string; value: number | null }> = ({ label, value }) => (
  <div className="p-3 sm:p-4 rounded-2xl bg-[var(--surface-subtle)] text-center min-w-0">
    <p className="font-heading font-extrabold text-xl sm:text-2xl text-[var(--ox-900)]">{value ?? '—'}</p>
    <p className="text-[11px] sm:text-xs font-semibold text-slate-600 mt-1">{label}</p>
  </div>
);

/** Profile for anyone signed in: who they are plus their order counts. Read-only. */
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
          <div className="flex justify-center py-16" aria-busy="true"><Loader2 className="w-6 h-6 animate-spin text-[var(--ox-900)]" /></div>
        ) : (
          <div className="p-5 sm:p-6 rounded-3xl bg-white shadow-[var(--shadow-hard-sm)] space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={name} email={email} src={photo} size={72} />
              <div className="min-w-0">
                <h1 className="font-heading font-extrabold text-xl text-[var(--ox-900)] break-words">{name || email}</h1>
                <p className="text-xs font-semibold text-[var(--gd-800)] uppercase tracking-wide">{roleText}</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {email && <li className="flex items-center gap-2 break-all"><Mail className="w-4 h-4 shrink-0" />{email}</li>}
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" />{profile?.phone || 'No phone on file'}</li>
              {started && <li className="flex items-center gap-2"><CalendarDays className="w-4 h-4 shrink-0" />Member since {new Date(started).toLocaleDateString()}</li>}
            </ul>
            {!isReseller && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Stat label="Total orders" value={counts ? profile.total_orders : null} />
              <Stat label="Delivered" value={counts ? profile.completed_orders : null} />
              <Stat label="This month" value={counts ? profile.orders_this_month : null} />
            </div>
            )}
            <p className="text-xs text-slate-600">
              {isReseller
                ? 'Orders booked under your name appear below. To change your name, phone or photo, contact The BC Cargo team.'
                : 'Orders are matched by your sign-in email. To change your name, phone or photo, contact The BC Cargo team.'}
            </p>
          </div>
        )}
        {!loading && isReseller && <ResellerDashboard />}
      </div>
    </main>
  );
};
