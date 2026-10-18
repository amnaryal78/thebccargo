import { supabase } from '../../../lib/supabase';

export type NotificationKind = 'inquiry' | 'partner' | 'booking' | 'review' | 'job_application';

export interface AdminNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  link: string | null;
  refId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

const map = (r: any): AdminNotification => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  body: r.body,
  link: r.link,
  refId: r.ref_id,
  isRead: r.is_read,
  readAt: r.read_at,
  createdAt: r.created_at,
});

export const notificationService = {
  async list(limit = 100): Promise<AdminNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []).map(map);
  },

  async markRead(ids: string[], read = true): Promise<void> {
    if (ids.length === 0) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: read, read_at: read ? new Date().toISOString() : null })
      .in('id', ids);
    if (error) throw new Error(error.message);
  },

  async markAllRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false);
    if (error) throw new Error(error.message);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  /** Calls onChange whenever a notification is added or updated. Returns an unsubscribe function. */
  subscribe(onChange: () => void): () => void {
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, onChange)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  },
};
