import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ResellerOrder } from '../features/reseller/commission';

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

/**
 * The signed-in reseller's own orders with weight and commission (computed by the database).
 * Throws when the call fails so the dashboard can show an error instead of a misleading zero.
 */
export async function fetchMyResellerOrders(): Promise<ResellerOrder[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.rpc('get_my_reseller_orders');
  if (error) throw new Error(error.message);
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    tracking_number: String(r.tracking_number ?? ''),
    created_at: String(r.created_at ?? ''),
    destination: String(r.destination ?? ''),
    status: String(r.status ?? ''),
    weight_kg: Number(r.weight_kg ?? 0),
    commission_npr: Number(r.commission_npr ?? 0),
  }));
}

/** Location rules shared by the form and the database check: 2–120 characters after trimming. */
export const LOCATION_MAX = 120;
export function validateLocation(raw: string): { value: string | null; error: string | null } {
  const value = raw.replace(/\s+/g, ' ').trim();
  if (!value) return { value: null, error: null }; // empty = remove it
  if (value.length < 2) return { value, error: 'Please type at least 2 letters.' };
  if (value.length > LOCATION_MAX) return { value, error: `Please keep it under ${LOCATION_MAX} letters.` };
  return { value, error: null };
}

/** The signed-in person's saved location, or null. */
export async function fetchMyLocation(userId: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.from('account_profiles').select('location').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.location as string | null) ?? null;
}

/** Saves (or clears, with null) the signed-in person's location. RLS only allows their own row. */
export async function saveMyLocation(userId: string, location: string | null): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Not connected.');
  const { error } = await supabase
    .from('account_profiles')
    .upsert({ user_id: userId, location, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
}
