import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface DashboardMetrics {
  total_shipments: number;
  in_transit: number;
  delivered: number;
  new_bookings: number;
  new_inquiries: number;
  published_blogs: number;
  active_jobs: number;
}

export async function fetchAdminDashboardMetrics(): Promise<DashboardMetrics> {
  const fallback: DashboardMetrics = {
    total_shipments: 3,
    in_transit: 3,
    delivered: 0,
    new_bookings: 0,
    new_inquiries: 2,
    published_blogs: 3,
    active_jobs: 2
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_metrics');
      if (!error && data) {
        return data as DashboardMetrics;
      }
    } catch (e) {}
  }

  return fallback;
}

export async function logAdminAudit(action: string, targetEntity: string, metadata?: any): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData?.session?.user?.email || 'admin@thebccargo.com';
      await supabase
        .from('audit_logs')
        .insert({
          actor_email: email,
          action,
          target_entity: targetEntity,
          metadata: metadata || {}
        });
    } catch (e) {}
  }
}
