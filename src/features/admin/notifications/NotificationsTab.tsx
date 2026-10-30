import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Mail, MailOpen, Trash2 } from 'lucide-react';
import { LoadingState } from '../../../design/primitives/Feedback';
import { useAdminNotifications } from './NotificationsContext';
import { KIND_META, timeAgo } from './notificationMeta';

export const NotificationsTab: React.FC = () => {
  const { items, loading, error, unreadCount, markRead, markAllRead, remove } = useAdminNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();
  const shown = filter === 'unread' ? items.filter((n) => !n.isRead) : items;

  return (
    <div className="max-w-3xl flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading font-extrabold text-2xl lg:text-[28px] text-[var(--text)]">Notifications</h1>
          <p className="text-sm opacity-70">{unreadCount} unread</p>
        </div>
        <button
          type="button"
          onClick={() => void markAllRead()}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E2DE] text-sm font-semibold disabled:opacity-40 cursor-pointer"
        >
          <CheckCheck className="w-4 h-4" />
          Mark all read
        </button>
      </div>

      <div className="flex gap-2" role="tablist" aria-label="Filter notifications">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border cursor-pointer ${
              filter === f ? 'bg-gd-500 text-ox-900 border-transparent' : 'border-[#E2E2DE]'
            }`}
          >
            {f === 'all' ? 'All' : 'Unread'}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading && <LoadingState label="Loading notifications" />}
      {!loading && shown.length === 0 && <p className="text-sm opacity-70">Nothing here.</p>}

      <ul className="flex flex-col gap-2">
        {shown.map((n) => {
          const { Icon, label } = KIND_META[n.kind];
          return (
            <li
              key={n.id}
              className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                n.isRead ? 'border-[#E2E2DE] opacity-75' : 'border-gd-500 bg-gd-500/10'
              }`}
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0 text-[#8C6400]" />
              <button
                type="button"
                className="min-w-0 flex-1 text-left cursor-pointer"
                onClick={() => {
                  void markRead([n.id]);
                  if (n.link) navigate(n.link);
                }}
              >
                <span className="block text-xs opacity-70">{label} · {timeAgo(n.createdAt)}</span>
                <span className={`block text-sm ${n.isRead ? 'font-medium' : 'font-bold'}`}>{n.title}</span>
                {n.body && <span className="block text-sm opacity-80 truncate">{n.body}</span>}
              </button>
              <button
                type="button"
                onClick={() => void markRead([n.id], !n.isRead)}
                title={n.isRead ? 'Mark as unread' : 'Mark as read'}
                aria-label={n.isRead ? 'Mark as unread' : 'Mark as read'}
                className="p-2 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                {n.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => void remove(n.id)}
                title="Delete"
                aria-label="Delete notification"
                className="p-2 rounded-lg hover:bg-black/5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
