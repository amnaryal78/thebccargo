import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Handshake,
  Inbox,
  MessageSquare,
  PackageSearch,
  RefreshCw,
  Star,
  Truck,
} from 'lucide-react';
import { Button, ErrorState, Skeleton } from '../../../design/primitives';
import { fetchSheetRates } from '../../../services/ratesService';
import { adminDataService } from '../services/adminDataService';
import { useMyPermissions } from '../usePermissions';
import { useAuth } from '../../../context/AuthContext';
import type { TodayDashboard } from '../types';

const NPT = 'Asia/Kathmandu';

/** "12 min", "3 h", "2 days" since a time. */
export function waitedFor(iso: string | null, now: number): string | null {
  if (!iso) return null;
  const min = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h} h`;
  return `${Math.round(h / 24)} days`;
}

const greeting = () => {
  const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: NPT }).format(new Date()));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

/** Audit action → what a person did, in words. */
const ACTION_WORDS: Record<string, string> = {
  'shipment.insert': 'created shipment',
  'shipment.update': 'updated shipment',
  'shipment.delete': 'deleted shipment',
  'tracking.insert': 'added a tracking update to',
  'tracking.update': 'changed a tracking update on',
  'tracking.delete': 'removed a tracking update from',
  save_user_role: 'changed staff access for',
  save_user_profile: 'updated a staff profile',
  approve_profile_change: 'approved a profile change',
};

interface ActionRow {
  key: string;
  label: string;
  count: number | null;
  oldest?: string | null;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}

export const AdminOverviewTab: React.FC = () => {
  const { user } = useAuth();
  const permissions = useMyPermissions();
  const [data, setData] = useState<TodayDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // first load
  const [refreshing, setRefreshing] = useState(false);
  const [rateSource, setRateSource] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await adminDataService.fetchTodayDashboard());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  const refresh = () => {
    setRefreshing(true);
    void load();
  };

  useEffect(() => {
    let alive = true;
    adminDataService
      .fetchTodayDashboard()
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    // Which source the website is pricing from right now (live sheet, cached copy or fallback).
    fetchSheetRates()
      .then((p) => setRateSource(p.rates.length ? p.source : 'none'))
      .catch(() => setRateSource('none'));
    return () => {
      alive = false;
    };
  }, []);

  const name = (user?.email ?? '').split('@')[0];
  const dateLine = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: NPT }).format(new Date());

  const now = data ? Date.parse(data.generated_at) : 0;
  const n = data?.needs_action;
  const rows: ActionRow[] = n
    ? [
        { key: 'bookings', label: 'New bookings waiting for a reply', count: n.bookings_new, oldest: n.bookings_oldest, to: '/admin/bookings', icon: Truck },
        { key: 'chats', label: 'Customer chats waiting for staff', count: n.chats_waiting, oldest: n.chats_oldest, to: '/admin/messages', icon: Inbox },
        { key: 'inquiries', label: 'New inquiries', count: n.inquiries_new, to: '/admin/inquiries', icon: MessageSquare },
        { key: 'partners', label: 'New partner requests', count: n.partners_new, to: '/admin/inquiries', icon: Handshake },
        {
          key: 'stale',
          label: 'Shipments with no update for 3 days or more',
          count: n.shipments_stale,
          to: '/admin/shipments?stale=1',
          icon: PackageSearch,
          hint: `of ${n.shipments_open} open`,
        },
        { key: 'reviews', label: 'Reviews to approve', count: n.reviews_pending, to: '/admin/feedback', icon: Star },
        { key: 'applications', label: 'New job applications', count: n.applications_new, to: '/admin/careers', icon: Briefcase },
      ].filter((r) => r.count !== null && (r.key !== 'applications' || permissions.canManageCareers))
    : [];
  const waiting = rows.filter((r) => (r.count ?? 0) > 0);
  const clear = rows.filter((r) => !r.count);

  const pricing = data?.pricing;
  const syncedAgo = pricing ? waitedFor(pricing.updated_at, now) : null;
  const stale = pricing ? now - Date.parse(pricing.updated_at) > 24 * 3600_000 : true;
  const sourceWords: Record<string, string> = {
    live: 'Live from the Google Sheet',
    cache_memory: 'Live from the Google Sheet',
    cache_database: 'Saved copy of the sheet (live sheet not reachable)',
    local_fallback: 'Copy saved in this browser (live sheet not reachable)',
    none: 'No prices available',
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[15px] text-slate-600">{dateLine}</p>
          <h1 className="font-heading font-bold text-[28px] sm:text-[32px] leading-tight tracking-[-0.02em] text-[var(--brand)] text-balance">
            {greeting()}{name ? `, ${name}` : ''}. Here’s what needs attention today.
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} isLoading={refreshing} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Refresh
        </Button>
      </header>

      {error && !data && (
        <ErrorState title="Today’s summary didn’t load" description={error} actionLabel="Try again" onAction={refresh} />
      )}

      {/* Needs action */}
      <section aria-labelledby="needs-title" className="flex flex-col gap-3">
        <h2 id="needs-title" className="font-heading font-semibold text-lg text-[var(--text)]">Needs action</h2>
        <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-white overflow-hidden">
          {loading && !data ? (
            <div className="p-4 space-y-3" aria-busy="true" aria-label="Loading">
              {[0, 1, 2].map((i) => <Skeleton key={i} height={48} />)}
            </div>
          ) : waiting.length === 0 && data ? (
            <p className="flex items-center gap-3 px-5 py-6 text-[15px] text-[var(--text)]">
              <CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0" aria-hidden="true" />
              Nothing is waiting. New bookings, chats and inquiries will appear here.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--line)]">
              {waiting.map((r) => {
                const Icon = r.icon;
                const age = waitedFor(r.oldest ?? null, now);
                return (
                  <li key={r.key}>
                    <Link to={r.to} className="group flex items-center gap-4 px-4 sm:px-5 py-3.5 hover:bg-[var(--ox-50)] focus-visible:outline-none focus-visible:bg-[var(--ox-50)]">
                      <span className="grid place-items-center w-10 h-10 rounded-[var(--r-sm)] bg-[var(--gd-100)] text-[var(--gd-800)] shrink-0">
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold text-[var(--text)]">{r.label}</span>
                        <span className="block text-[13px] text-slate-600">
                          {age ? `Oldest waiting ${age}` : r.hint ?? 'Open the list'}
                        </span>
                      </span>
                      <span className="font-heading font-bold text-2xl tabular-nums text-[var(--brand)]">{r.count}</span>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[var(--brand)] shrink-0" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {clear.length > 0 && data && waiting.length > 0 && (
            <p className="px-5 py-3 border-t border-[var(--line)] text-[13px] text-slate-600 bg-[var(--surface-subtle)]">
              Clear: {clear.map((r) => r.label.toLowerCase()).join(', ')}.
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Today's activity: audit roles only */}
        {data?.today && (
          <section aria-labelledby="activity-title" className="flex flex-col gap-3 min-w-0">
            <h2 id="activity-title" className="font-heading font-semibold text-lg text-[var(--text)]">Today’s activity</h2>
            <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-white">
              <dl className="grid grid-cols-3 divide-x divide-[var(--line)] border-b border-[var(--line)]">
                {[
                  ['Shipments created', data.today.shipments_created],
                  ['Tracking updates', data.today.tracking_updates],
                  ['Delivered', data.today.delivered],
                ].map(([label, value]) => (
                  <div key={label as string} className="px-4 py-3">
                    <dt className="text-[13px] text-slate-600">{label}</dt>
                    <dd className="font-heading font-bold text-2xl tabular-nums text-[var(--brand)]">{value}</dd>
                  </div>
                ))}
              </dl>
              {data.today.activity.length === 0 ? (
                <p className="px-5 py-5 text-[14px] text-slate-600">No changes yet today. Shipments, tracking updates and staff changes will be listed here.</p>
              ) : (
                <ol className="divide-y divide-[var(--line)]">
                  {data.today.activity.map((a, i) => {
                    const target = a.target_entity.replace(/^shipments:/, '');
                    const isShipment = a.target_entity.startsWith('shipments:');
                    return (
                      <li key={i} className="flex gap-3 px-4 sm:px-5 py-3 text-[14px]">
                        <time dateTime={a.created_at} className="w-12 shrink-0 tabular-nums text-slate-500">
                          {new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: NPT }).format(new Date(a.created_at))}
                        </time>
                        <p className="min-w-0 [overflow-wrap:anywhere] text-[var(--text)]">
                          <span className="font-semibold">{a.actor_email ? a.actor_email.split('@')[0] : 'System'}</span>{' '}
                          {ACTION_WORDS[a.action] ?? a.action.replace(/[._]/g, ' ')}{' '}
                          {isShipment ? <span className="font-mono font-semibold">{target}</span> : null}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </section>
        )}

        {/* Pricing health */}
        <section aria-labelledby="pricing-title" className="flex flex-col gap-3 min-w-0">
          <h2 id="pricing-title" className="font-heading font-semibold text-lg text-[var(--text)]">Website prices</h2>
          <div className="rounded-[var(--r-md)] border border-[var(--line)] bg-white p-5 flex flex-col gap-3">
            {loading && !data ? (
              <Skeleton height={64} />
            ) : (
              <>
                <p className="flex items-start gap-2.5 text-[15px] font-semibold text-[var(--text)]">
                  {rateSource && rateSource !== 'live' && rateSource !== 'cache_memory' ? (
                    <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-[var(--success)]" aria-hidden="true" />
                  )}
                  {rateSource ? sourceWords[rateSource] ?? rateSource : 'Checking the price source…'}
                </p>
                {pricing ? (
                  <p className="flex items-center gap-2 text-[14px] text-slate-600">
                    <Clock3 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    Last synced {syncedAgo} ago · {pricing.row_count} price rows
                  </p>
                ) : (
                  <p className="text-[14px] text-slate-600">No saved copy of the rate sheet yet.</p>
                )}
                {stale && pricing && rateSource !== 'live' && rateSource !== 'cache_memory' && (
                  <p className="rounded-[var(--r-sm)] bg-[var(--warning-bg)] px-3 py-2 text-[14px] text-[var(--warning)]">
                    The website is using a copy saved more than a day ago. Prices changed in the sheet since then are not shown yet.
                  </p>
                )}
                {permissions.canManageRates && (
                  <Link to="/admin/rates" className="self-start text-[14px] font-semibold text-[var(--brand)] underline underline-offset-4">
                    Open rates
                  </Link>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
