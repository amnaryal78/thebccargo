import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Briefcase,
  ChevronRight,
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PackagePlus,
  Receipt,
  Search,
  Star,
  Truck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { countThreadsNeedingReply } from '../../../services/chatService';
import { useAuth } from '../../../context/AuthContext';
import { BcLogo } from '../../../components/BcLogo';
import type { RolePermissions } from '../types';
import { useMyPermissions } from '../usePermissions';
import { roleLabel } from '../users/PersonDialog';
import { AdminPermissionGate } from '../AdminPermissionGate';
import { AdminDialogsProvider } from '../AdminConfirmDialog';
import { NotificationsProvider, useAdminNotifications } from '../notifications/NotificationsContext';
import { NotificationBell } from '../notifications/NotificationBell';
import type { NotificationKind } from '../notifications/notificationService';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Unread notifications of these kinds show as a count on the item. */
  kinds?: NotificationKind[];
  /** Shows the count of customer chats waiting for a reply. */
  messages?: boolean;
  /** Hidden, and the page refused, for roles without this permission. */
  needs?: keyof RolePermissions;
}

/** Grouped by how the desk works: what needs me, what came in, what is moving, prices, website, admin. */
const navGroups: { title: string; items: NavItem[] }[] = [
  { title: 'Today', items: [{ to: '/admin', label: 'Today', icon: LayoutDashboard }] },
  {
    title: 'Requests',
    items: [
      { to: '/admin/bookings', label: 'Bookings', icon: Truck, kinds: ['booking'] },
      // Same roles as the database's is_message_staff()
      { to: '/admin/messages', label: 'Customer chats', icon: Inbox, messages: true, needs: 'canManageInquiries' },
      { to: '/admin/inquiries', label: 'Inquiries & partners', icon: MessageSquare, kinds: ['inquiry', 'partner'] },
      { to: '/admin/feedback', label: 'Reviews', icon: Star, kinds: ['review'] },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    title: 'Shipments',
    items: [
      { to: '/admin/shipments', label: 'All shipments', icon: Package },
      { to: '/admin/shipments/new', label: 'Create shipment', icon: PackagePlus, needs: 'canManageShipments' },
    ],
  },
  {
    title: 'Pricing',
    items: [
      { to: '/admin/rates', label: 'Rates', icon: Receipt, needs: 'canManageRates' },
      { to: '/admin/handling-rules', label: 'Handling rules', icon: AlertTriangle, needs: 'canManageHandlingRules' },
    ],
  },
  {
    title: 'Website',
    items: [
      { to: '/admin/blogs', label: 'Blogs', icon: FileText, needs: 'canManageBlogs' },
      { to: '/admin/how-to-ship', label: 'How to ship', icon: BookOpen, needs: 'canManageHowToShip' },
      { to: '/admin/careers', label: 'Careers & applicants', icon: Briefcase, kinds: ['job_application'], needs: 'canManageCareers' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/admin/users', label: 'Staff & roles', icon: Users, needs: 'canManageUsers' },
      { to: '/admin/audit', label: 'Audit log', icon: Activity, needs: 'canViewAuditLogs' },
      { to: '/admin/profile', label: 'My profile', icon: UserRound },
    ],
  },
];
const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

const owns = (to: string, path: string) => (to === '/admin' ? path === '/admin' || path === '/admin/' : path === to || path.startsWith(`${to}/`));

/** The menu entry a URL belongs to: the longest matching path, so /admin/shipments/new is "Create shipment". */
const activeItem = (path: string): NavItem | undefined =>
  navItems.filter((i) => owns(i.to, path)).sort((a, b) => b.to.length - a.to.length)[0];

/** The permission a URL needs: the owning menu entry's (so /admin/users/x needs what /admin/users needs). */
export const routeNeeds = (path: string): keyof RolePermissions | undefined =>
  navItems.find((i) => i.to !== '/admin' && i.to !== '/admin/shipments/new' && owns(i.to, path))?.needs;

/** Customer chats waiting for a reply, refreshed every minute and when you change page. */
function useNewMessageCount(path: string, enabled: boolean): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const load = () => countThreadsNeedingReply().then((n) => alive && setCount(n)).catch(() => undefined);
    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [path, enabled]);
  return enabled ? count : 0;
}

const Count: React.FC<{ n: number; label: string }> = ({ n, label }) =>
  n > 0 ? (
    <span className="ml-auto min-w-[22px] h-[22px] px-1.5 rounded-full bg-gd-500 text-ox-950 text-xs font-bold grid place-items-center tabular-nums" aria-label={label}>
      {n > 99 ? '99+' : n}
    </span>
  ) : null;

const AdminShellInner: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const permissions = useMyPermissions();
  const { items: notifications, markRead } = useAdminNotifications();
  const [drawerAt, setDrawerAt] = useState<{ kind: 'menu' | 'search'; path: string } | null>(null);
  const [profileAt, setProfileAt] = useState<string | null>(null);
  const drawer = drawerAt?.path === path ? drawerAt.kind : null;
  const profileOpen = profileAt === path;
  const setDrawer = (kind: 'menu' | 'search' | null) => setDrawerAt(kind ? { kind, path } : null);
  const setProfileOpen = (open: boolean) => setProfileAt(open ? path : null);
  const profileRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  // Opening the drawer moves focus into it: the search box for Search, the first link for More.
  useEffect(() => {
    if (!drawer) return;
    drawerRef.current?.querySelector<HTMLElement>(drawer === 'search' ? 'input[name="q"]' : 'nav a')?.focus();
  }, [drawer]);
  const notificationsRef = useRef(notifications);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Leaving a page marks that page's notifications as read (a page you just opened still shows them as new).
  useEffect(() => {
    return () => {
      const item = navItems.find((n) => n.to === path && n.kinds);
      if (!item?.kinds) return;
      const ids = notificationsRef.current.filter((n) => !n.isRead && item.kinds!.includes(n.kind)).map((n) => n.id);
      if (ids.length) void markRead(ids);
    };
  }, [path, markRead]);

  // Close the drawer and profile menu on Escape or a click elsewhere (changing page closes them too).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setDrawerAt(null);
      setProfileAt(null);
    };
    const onDown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileAt(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, []);

  const newMessages = useNewMessageCount(path, permissions.canManageInquiries);
  const unreadFor = (item: NavItem) =>
    item.messages ? newMessages : item.kinds ? notifications.filter((n) => !n.isRead && item.kinds!.includes(n.kind)).length : 0;
  const byPath = (to: string) => navItems.find((i) => i.to === to)!;
  const requestCount = unreadFor(byPath('/admin/bookings')) + newMessages + unreadFor(byPath('/admin/inquiries'));

  const groups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.needs || permissions[i.needs]) }))
    .filter((g) => g.items.length > 0);
  const current = activeItem(path);
  const currentGroup = navGroups.find((g) => g.items.includes(current!));
  const isDetail = !!current && path !== current.to && path.startsWith(`${current.to}/`);

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Render helpers, not components: a component defined in here would remount (and lose typed text) on every render.
  const searchForm = (className = '') => (
    <form
      role="search"
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
        navigate(q ? `/admin/shipments?q=${encodeURIComponent(q)}` : '/admin/shipments');
      }}
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" aria-hidden="true" />
      <input
        name="q"
        type="search"
        enterKeyHint="search"
        autoCapitalize="characters"
        autoCorrect="off"
        maxLength={64}
        aria-label="Search shipments by tracking number, customer or place"
        placeholder="Search shipments"
        className="w-full h-10 pl-9 pr-3 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-white text-[15px] text-[var(--text)] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      />
    </form>
  );

  const navList = () => (
    <nav aria-label="Admin sections" className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-5">
      {groups.map((g) => (
        <div key={g.title}>
          {g.title !== 'Today' && <p className="px-3 pb-1.5 text-[13px] font-medium text-white/55">{g.title}</p>}
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const Icon = item.icon;
              const active = current === item;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center gap-3 min-h-[40px] pointer-coarse:min-h-[44px] px-3 rounded-[var(--r-sm)] text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500 ${
                      active ? 'bg-white/[0.12] text-white' : 'text-white/75 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-gd-500" aria-hidden="true" />}
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    <span className="truncate">{item.label}</span>
                    <Count n={unreadFor(item)} label={item.messages ? `${unreadFor(item)} waiting for a reply` : `${unreadFor(item)} new`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (bordered = true) => (
    <Link to="/admin" className={`flex items-center gap-2.5 px-5 h-16 shrink-0 ${bordered ? "border-b border-white/10" : ""} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gd-500`}>
      <span className="grid place-items-center w-9 h-9 rounded-[var(--r-sm)] bg-white">
        <BcLogo size="sm" variant="mark-only" />
      </span>
      <span className="leading-tight">
        <span className="block font-heading font-bold text-[15px] text-white">BC Cargo</span>
        <span className="block text-[12px] text-white/60">Operations</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-[100dvh] bg-[var(--bg)] text-[var(--text)] font-body md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      {/* Sidebar, desktop */}
      <aside className="hidden md:flex flex-col sticky top-0 h-[100dvh] bg-ox-950 text-white">
        {brand()}
        {navList()}
      </aside>

      {/* Drawer, phones: the same navigation, plus search */}
      {drawer && (
        <div ref={drawerRef} className="md:hidden fixed inset-0 z-[var(--z-overlay)]" role="dialog" aria-modal="true" aria-label={drawer === 'search' ? 'Search' : 'All pages'}>
          <button type="button" aria-label="Close" onClick={() => setDrawer(null)} className="absolute inset-0 bg-ox-950/60 cursor-default" />
          <div className="absolute inset-y-0 left-0 w-[min(300px,86vw)] flex flex-col bg-ox-950 text-white shadow-hard-lg pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
            <div className="flex items-center justify-between pr-3 border-b border-white/10">
              {brand(false)}
              <button type="button" onClick={() => setDrawer(null)} aria-label="Close menu" className="grid place-items-center w-11 h-11 rounded-[var(--r-sm)] text-white/80 hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-3 pt-4">
              {searchForm()}
            </div>
            {navList()}
          </div>
        </div>
      )}

      <div className="min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-[var(--z-sticky)] bg-white/95 border-b border-[var(--line)] pt-[env(safe-area-inset-top,0px)]">
          <div className="flex items-center gap-3 h-14 px-4 sm:px-6">
            <Link to="/admin" className="md:hidden flex items-center gap-2 shrink-0" aria-label="Today">
              <BcLogo size="sm" variant="mark-only" />
            </Link>
            <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
              <ol className="flex items-center gap-1.5 text-[14px] text-slate-600 min-w-0">
                {currentGroup && currentGroup.title !== 'Today' && (
                  <li className="hidden sm:flex items-center gap-1.5 shrink-0">
                    {currentGroup.title}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  </li>
                )}
                <li className={`truncate ${isDetail ? '' : 'font-semibold text-[var(--text)]'}`}>
                  {isDetail ? <Link to={current!.to} className="hover:underline">{current!.label}</Link> : current?.label ?? 'Admin'}
                </li>
                {isDetail && (
                  <li className="flex items-center gap-1.5 min-w-0 font-semibold text-[var(--text)]">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                    <span className="truncate">Details</span>
                  </li>
                )}
              </ol>
            </nav>
            {searchForm('hidden md:block w-64 lg:w-80')}
            <NotificationBell align="right" />
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label="Your account"
                className="grid place-items-center w-10 h-10 rounded-full bg-ox-900 text-white font-heading font-bold text-sm uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
              >
                {(user?.email ?? '?').slice(0, 1)}
              </button>
              {profileOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-[var(--r-md)] border border-[var(--line)] bg-white shadow-hard-lg p-2 z-[var(--z-overlay)]">
                  <div className="px-3 py-2.5 border-b border-[var(--line)] mb-1">
                    <p className="text-[14px] font-semibold text-[var(--text)] [overflow-wrap:anywhere]">{user?.email ?? 'Signed in'}</p>
                    <p className="text-[13px] text-slate-600 capitalize">{role ? roleLabel(role) : 'Staff'}{permissions.isReadOnly ? ' · view only' : ''}</p>
                  </div>
                  {[
                    { label: 'My profile', icon: UserRound, onClick: () => navigate('/admin/profile') },
                    { label: 'Sign in with another account', icon: LogIn, onClick: signOut },
                    { label: 'Sign out', icon: LogOut, onClick: signOut },
                  ].map(({ label, icon: Icon, onClick }) => (
                    <button key={label} type="button" role="menuitem" onClick={onClick} className="flex w-full items-center gap-3 min-h-[44px] px-3 rounded-[var(--r-sm)] text-[14px] text-[var(--text)] hover:bg-[var(--surface-2)] text-left">
                      <Icon className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                  <a href="/" target="_blank" rel="noopener noreferrer" role="menuitem" className="flex items-center gap-3 min-h-[44px] px-3 rounded-[var(--r-sm)] text-[14px] text-[var(--text)] hover:bg-[var(--surface-2)]">
                    <ExternalLink className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    Open the public website
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* App.tsx already provides <main id="main"> (skip-link target) around the admin */}
        <div className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-10 overflow-x-clip">
          <AdminPermissionGate needs={routeNeeds(path)} page>
            <Outlet />
          </AdminPermissionGate>
        </div>
      </div>

      {/* Bottom bar, phones: urgent work first */}
      <nav
        aria-label="Quick navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-[var(--z-sticky)] bg-white border-t border-[var(--line-strong)] grid grid-cols-5 px-1 pt-1 pb-[max(env(safe-area-inset-bottom),4px)]"
      >
        {[
          { to: '/admin', label: 'Today', icon: LayoutDashboard, badge: 0 },
          { to: '/admin/bookings', label: 'Requests', icon: Inbox, badge: requestCount },
          { to: '/admin/shipments', label: 'Shipments', icon: Package, badge: 0 },
        ].map(({ to, label, icon: Icon, badge }) => {
          const active = to === '/admin' ? current?.to === '/admin' : to === '/admin/bookings' ? currentGroup?.title === 'Requests' : currentGroup?.title === 'Shipments';
          return (
            <Link key={to} to={to} aria-current={active ? 'page' : undefined} className={`relative min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-[var(--r-sm)] text-[12px] font-semibold ${active ? 'text-ox-900' : 'text-slate-500'}`}>
              {active && <span className="absolute top-0 inset-x-5 h-[3px] rounded-b bg-gd-500" aria-hidden="true" />}
              <Icon className="w-5 h-5" />
              {label}
              {badge > 0 && (
                <span className="absolute top-1 left-1/2 ml-2 min-w-[18px] h-[18px] px-1 rounded-full bg-gd-500 text-ox-950 text-[11px] font-bold grid place-items-center" aria-label={`${badge} new`}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          );
        })}
        {[
          { key: 'search' as const, label: 'Search', icon: Search },
          { key: 'menu' as const, label: 'More', icon: Menu },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" onClick={() => setDrawer(key)} aria-expanded={drawer === key} className="min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-[var(--r-sm)] text-[12px] font-semibold text-slate-500">
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export const AdminShell: React.FC = () => (
  <NotificationsProvider>
    <AdminDialogsProvider>
      <AdminShellInner />
    </AdminDialogsProvider>
  </NotificationsProvider>
);
