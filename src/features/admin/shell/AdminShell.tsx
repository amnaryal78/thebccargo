import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  AlertTriangle,
  Receipt,
  FileText,
  Briefcase,
  Users,
  Settings,
  Activity,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  BookOpen,
  Bell,
  Star
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { BcLogo } from '../../../components/BcLogo';
import { getRolePermissions } from '../types';
import { NotificationsProvider, useAdminNotifications } from '../notifications/NotificationsContext';
import { NotificationBell } from '../notifications/NotificationBell';
import type { NotificationKind } from '../notifications/notificationService';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  /** Unread notifications of these kinds show as a count on the nav item. */
  kinds?: NotificationKind[];
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/shipments', label: 'Shipments', icon: Package },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell, kinds: ['inquiry', 'partner', 'booking', 'review', 'job_application'] },
  { to: '/admin/inquiries', label: 'Inquiries & Partners', icon: MessageSquare, kinds: ['inquiry', 'partner'] },
  { to: '/admin/bookings', label: 'Bookings', icon: Package, kinds: ['booking'] },
  { to: '/admin/feedback', label: 'Feedback', icon: Star, kinds: ['review'] },
  { to: '/admin/handling-rules', label: 'Handling Rules', icon: AlertTriangle },
  { to: '/admin/how-to-ship', label: 'How to Ship', icon: BookOpen },
  { to: '/admin/rates', label: 'Rates & CSV', icon: Receipt },
  { to: '/admin/blogs', label: 'Blogs & AI Fixer', icon: FileText },
  { to: '/admin/careers', label: 'Careers & Applicants', icon: Briefcase, kinds: ['job_application'] },
  { to: '/admin/users', label: 'Users & Roles', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/audit', label: 'Audit Logs', icon: Activity },
];

const AdminShellInner: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const permissions = getRolePermissions(role);
  const { items: notifications, markRead } = useAdminNotifications();
  const notificationsRef = useRef(notifications);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Leaving a page marks that page's notifications as read (a page you just opened still shows them as new).
  useEffect(() => {
    const path = location.pathname;
    return () => {
      const item = navItems.find((n) => n.to === path && n.kinds && n.to !== '/admin/notifications');
      if (!item?.kinds) return;
      const ids = notificationsRef.current.filter((n) => !n.isRead && item.kinds!.includes(n.kind)).map((n) => n.id);
      if (ids.length) void markRead(ids);
    };
  }, [location.pathname, markRead]);

  const unreadFor = (kinds?: NotificationKind[]) =>
    kinds ? notifications.filter((n) => !n.isRead && kinds.includes(n.kind)).length : 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F6F6F4] text-[#121211] font-body selection:bg-[#F2B705] selection:text-[#002147]">
      
      {/* ------------------------------------------------------------------ */}
      {/* TOP BAR ON MOBILE (< 768px) */}
      {/* ------------------------------------------------------------------ */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#002147] text-white sticky top-0 z-40 border-b border-[#0B2445] shadow-md">
        <div className="flex items-center gap-2">
          <BcLogo size="sm" variant="mark-only" />
          <span className="font-heading font-black text-xs uppercase tracking-wider text-white">Operations</span>
        </div>
        <div className="flex items-center gap-2">
        <NotificationBell align="right" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#071A33] text-white hover:bg-[#0B2445] active:scale-95 transition-all cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-[#F2B705]" /> : <Menu className="w-5 h-5" />}
        </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* DESKTOP SIDEBAR (Oxford Blue: #002147) */}
      {/* ------------------------------------------------------------------ */}
      {mobileMenuOpen && (
        <button type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} className="md:hidden fixed inset-0 z-40 bg-[#00152D]/60 cursor-default" />
      )}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-50 md:z-30 w-64 md:w-60 lg:w-64 bg-[#002147] text-white flex flex-col justify-between border-r border-[#001A38] shadow-xl transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#0B2445] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BcLogo size="md" variant="mark-only" />
            <div className="flex flex-col">
              <span className="font-heading font-black text-xs uppercase tracking-widest text-white">Admin Desk</span>
              <span className="text-[10px] font-mono text-[#F2B705] tracking-tight">Ops &amp; Telematics</span>
            </div>
          </div>
          <div className="hidden md:block"><NotificationBell /></div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all
                  ${isActive
                    ? 'bg-[#F2B705] text-[#002147] shadow-sm font-extrabold translate-x-1'
                    : 'text-slate-300 hover:bg-[#071A33] hover:text-white hover:translate-x-0.5'
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1">{item.label}</span>
                {unreadFor(item.kinds) > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center" aria-label={`${unreadFor(item.kinds)} unread`}>
                    {unreadFor(item.kinds)}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Session & Status Card */}
        <div className="p-3 border-t border-[#0B2445] bg-[#001A38] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate font-mono">
                {user?.email || 'Authenticated User'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-[#F2B705]/20 text-[#F2B705] text-[10px] font-mono font-bold uppercase">
                  <ShieldCheck className="w-3 h-3" />
                  {role || 'Staff'}
                </span>
                {permissions.isReadOnly && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                    Read-Only
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 transition-colors cursor-pointer shrink-0"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-[#071A33] hover:bg-[#0B2445] text-slate-300 hover:text-white text-[10px] font-mono uppercase tracking-wider transition-colors"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE BOTTOM TAB BAR (Sticky for fast 360px navigation) */}
      {/* ------------------------------------------------------------------ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#002147] border-t border-[#0B2445] px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-mono font-bold uppercase ${isActive ? 'text-[#F2B705]' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/admin/shipments"
          className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-mono font-bold uppercase ${isActive ? 'text-[#F2B705]' : 'text-slate-400'}`}
        >
          <Package className="w-4 h-4" />
          <span>Cargo</span>
        </NavLink>
        <NavLink
          to="/admin/inquiries"
          className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-mono font-bold uppercase ${isActive ? 'text-[#F2B705]' : 'text-slate-400'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Inquiry</span>
        </NavLink>
        <NavLink
          to="/admin/rates"
          className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[10px] font-mono font-bold uppercase ${isActive ? 'text-[#F2B705]' : 'text-slate-400'}`}
        >
          <Receipt className="w-4 h-4" />
          <span>Rates</span>
        </NavLink>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-mono font-bold uppercase text-slate-400 hover:text-white"
        >
          <Menu className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CONTENT AREA (Paper content styling with sticky density) */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-x-clip">
        <Outlet />
      </main>

    </div>
  );
};

export const AdminShell: React.FC = () => (
  <NotificationsProvider>
    <AdminShellInner />
  </NotificationsProvider>
);
