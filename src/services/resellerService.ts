import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ResellerProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  started_at: string;
  total_orders: number;
  completed_orders: number;
  orders_this_month: number;
}

/**
 * The signed-in reseller's own profile and order counts.
 * Returns null when the person is not an active reseller or the database function is not deployed yet.
 */
export async function fetchMyResellerProfile(): Promise<ResellerProfile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc('get_my_reseller_profile');
  if (error || !data) return null;
  const d = data as Record<string, unknown>;
  return {
    id: String(d.id),
    email: (d.email as string) ?? null,
    full_name: (d.full_name as string) ?? null,
    phone: (d.phone as string) ?? null,
    avatar_url: (d.avatar_url as string) ?? null,
    started_at: String(d.started_at),
    total_orders: Number(d.total_orders ?? 0),
    completed_orders: Number(d.completed_orders ?? 0),
    orders_this_month: Number(d.orders_this_month ?? 0),
  };
}
