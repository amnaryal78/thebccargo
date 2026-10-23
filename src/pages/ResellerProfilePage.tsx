import React, { useEffect, useState } from 'react';
import { Loader2, Phone, Mail, CalendarDays } from 'lucide-react';
import { fetchMyResellerProfile, type ResellerProfile } from '../services/resellerService';
import { Avatar } from '../features/admin/users/Avatar';
import { SEOHead } from '../components/SEOHead';

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] text-center">
    <p className="font-heading font-extrabold text-2xl text-[var(--ox-900)]">{value}</p>
    <p className="text-xs font-semibold text-slate-600 mt-1">{label}</p>
  </div>
);

/** A reseller's own profile: who they are, when they started and how many orders they have sent. Read-only. */
export const ResellerProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ResellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetchMyResellerProfile()
      .then((p) => live && setProfile(p))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  return (
    <main className="min-h-[70vh] pt-28 pb-16 px-4">
      <SEOHead title="Reseller profile | The BC Cargo" description="Your reseller profile and order summary." noindex />
      <div className="max-w-xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-16" aria-busy="true"><Loader2 className="w-6 h-6 animate-spin text-[var(--ox-900)]" /></div>
        ) : !profile ? (
          <div className="p-6 rounded-3xl bg-white shadow-[var(--shadow-hard-sm)] text-center space-y-2">
            <h1 className="font-heading font-extrabold text-lg text-[var(--ox-900)]">No reseller profile</h1>
            <p className="text-sm text-slate-600">This account is not an active reseller. Contact The BC Cargo if you think this is a mistake.</p>
          </div>
        ) : (
          <div className="p-5 sm:p-6 rounded-3xl bg-white shadow-[var(--shadow-hard-sm)] space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={profile.full_name} email={profile.email} src={profile.avatar_url} size={72} />
              <div className="min-w-0">
                <h1 className="font-heading font-extrabold text-xl text-[var(--ox-900)] truncate">{profile.full_name || profile.email}</h1>
                <p className="text-xs font-semibold text-[var(--gd-800)] uppercase tracking-wide">Reseller</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {profile.email && <li className="flex items-center gap-2 break-all"><Mail className="w-4 h-4 shrink-0" />{profile.email}</li>}
              {profile.phone && <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" />{profile.phone}</li>}
              <li className="flex items-center gap-2"><CalendarDays className="w-4 h-4 shrink-0" />Started {new Date(profile.started_at).toLocaleDateString()}</li>
            </ul>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Total orders" value={profile.total_orders} />
              <Stat label="Delivered" value={profile.completed_orders} />
              <Stat label="This month" value={profile.orders_this_month} />
            </div>
            <p className="text-xs text-slate-600">To change your name, phone or photo, ask The BC Cargo team.</p>
          </div>
        )}
      </div>
    </main>
  );
};
