import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AccountProfile {
  email: string | null;
  /** Staff/reseller base role, or null for an ordinary customer. */
  role: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  started_at: string | null;
  total_orders: number;
  completed_orders: number;
  orders_this_month: number;
}

/**
 * The signed-in person's profile and order counts.
 * Returns null when the database function is not deployed or the call fails, so the page can still show the basics.
 */
export async function fetchMyAccountProfile(): Promise<AccountProfile | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc('get_my_account_profile');
  if (error || !data) return null;
  const d = data as Record<string, unknown>;
  const s = (v: unknown) => (typeof v === 'string' && v ? v : null);
  return {
    email: s(d.email),
    role: s(d.role),
    full_name: s(d.full_name),
    phone: s(d.phone),
    avatar_url: s(d.avatar_url),
    started_at: s(d.started_at),
    total_orders: Number(d.total_orders ?? 0),
    completed_orders: Number(d.completed_orders ?? 0),
    orders_this_month: Number(d.orders_this_month ?? 0),
  };
}
