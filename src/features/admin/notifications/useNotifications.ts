import { useCallback, useEffect, useState } from 'react';
import { AdminNotification, notificationService } from './notificationService';

/** Loads notifications and keeps them fresh (live updates plus a 60 second safety refresh). */
export function useNotifications() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setItems(await notificationService.list());
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const unsubscribe = notificationService.subscribe(() => void refresh());
    const timer = window.setInterval(() => void refresh(), 60000);
    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, [refresh]);

  const markRead = useCallback(
    async (ids: string[], read = true) => {
      setItems((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: read } : n)));
      await notificationService.markRead(ids, read).catch(() => void refresh());
    },
    [refresh]
  );

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await notificationService.markAllRead().catch(() => void refresh());
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      setItems((prev) => prev.filter((n) => n.id !== id));
      await notificationService.remove(id).catch(() => void refresh());
    },
    [refresh]
  );

  const unreadCount = items.filter((n) => !n.isRead).length;

  return { items, loading, error, unreadCount, refresh, markRead, markAllRead, remove };
}
