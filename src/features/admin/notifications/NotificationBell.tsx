import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useAdminNotifications } from './NotificationsContext';
import { KIND_META, timeAgo } from './notificationMeta';

/** Bell with an unread count and a quick list of the latest notifications. */
export const NotificationBell: React.FC<{ align?: 'left' | 'right' }> = ({ align = 'left' }) => {
  const { items, unreadCount, markRead, markAllRead } = useAdminNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const latest = items.slice(0, 8);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative p-2 rounded-xl bg-[#EEF3F9] hover:bg-[#D6E1EF] text-[#002147] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F2B705] text-[#002147] text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute z-[60] mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[#E2E2DE] bg-white text-[#121211] shadow-2xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#E2E2DE]">
            <span className="font-heading font-bold text-sm">Notifications</span>
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C6400] disabled:opacity-40 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>

          <ul className="max-h-80 overflow-y-auto divide-y divide-[#E2E2DE]">
            {latest.length === 0 && <li className="px-3 py-6 text-sm text-center opacity-70">No notifications yet.</li>}
            {latest.map((n) => {
              const { Icon } = KIND_META[n.kind];
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      void markRead([n.id]);
                      setOpen(false);
                      if (n.link) navigate(n.link);
                    }}
                    className={`w-full text-left flex gap-3 px-3 py-2.5 hover:bg-black/5 cursor-pointer ${
                      n.isRead ? 'opacity-70' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0 text-[#8C6400]" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={`text-sm truncate ${n.isRead ? 'font-medium' : 'font-bold'}`}>{n.title}</span>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#F2B705] shrink-0" aria-label="Unread" />}
                      </span>
                      {n.body && <span className="block text-xs opacity-80 truncate">{n.body}</span>}
                      <span className="block text-[11px] opacity-60 mt-0.5">{timeAgo(n.createdAt)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/admin/notifications');
            }}
            className="w-full px-3 py-2.5 text-sm font-semibold text-center border-t border-[#E2E2DE] hover:bg-black/5 cursor-pointer"
          >
            See all notifications
          </button>
        </div>
      )}
    </div>
  );
};
