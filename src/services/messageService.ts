import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CustomerMessage {
  id: string;
  userId: string | null;
  userEmail: string | null;
  name: string;
  phone: string;
  body: string;
  status: 'new' | 'replied';
  reply: string | null;
  repliedBy: string | null;
  repliedAt: string | null;
  createdAt: string;
}

const toMessage = (r: any): CustomerMessage => ({
  id: r.id,
  userId: r.user_id ?? null,
  userEmail: r.user_email ?? null,
  name: r.name,
  phone: r.phone,
  body: r.body,
  status: r.status,
  reply: r.reply ?? null,
  repliedBy: r.replied_by ?? null,
  repliedAt: r.replied_at ?? null,
  createdAt: r.created_at,
});

export function validateMessage(name: string, phone: string, body: string): string | null {
  if (!name.trim()) return 'Please enter your name.';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return 'Please enter a valid phone number.';
  if (!body.trim()) return 'Please write your message.';
  if (body.trim().length > 2000) return 'Message is too long (max 2000 characters).';
  return null;
}

export async function sendCustomerMessage(input: {
  name: string;
  phone: string;
  body: string;
  userId?: string | null;
  userEmail?: string | null;
}): Promise<{ ok: boolean; error: string | null }> {
  const invalid = validateMessage(input.name, input.phone, input.body);
  if (invalid) return { ok: false, error: invalid };
  if (!isSupabaseConfigured) return { ok: false, error: 'Messaging is unavailable right now.' };
  const { error } = await supabase.from('customer_messages').insert({
    user_id: input.userId ?? null,
    user_email: input.userEmail ?? null,
    name: input.name.trim(),
    phone: input.phone.trim(),
    body: input.body.trim(),
  });
  return error ? { ok: false, error: error.message } : { ok: true, error: null };
}

/** The signed-in customer's own messages with any staff replies (RLS limits rows to the owner). */
export async function fetchMyMessages(userId: string): Promise<CustomerMessage[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('customer_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return error || !data ? [] : data.map(toMessage);
}

/** Staff inbox. RLS returns every message only to staff roles. */
export async function fetchAllMessages(): Promise<{ messages: CustomerMessage[]; error: string | null }> {
  if (!isSupabaseConfigured) return { messages: [], error: 'Supabase is not configured.' };
  const { data, error } = await supabase
    .from('customer_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return { messages: [], error: error.message };
  return { messages: (data || []).map(toMessage), error: null };
}

/** How many messages still need a reply (staff only; RLS returns 0 rows to everyone else). */
export async function countNewMessages(): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const { count, error } = await supabase
    .from('customer_messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');
  return error ? 0 : count ?? 0;
}

export async function replyToMessage(id: string, reply: string, staffEmail: string): Promise<{ ok: boolean; error: string | null }> {
  const text = reply.trim();
  if (!text) return { ok: false, error: 'Write a reply first.' };
  const { error } = await supabase
    .from('customer_messages')
    .update({ reply: text, status: 'replied', replied_by: staffEmail, replied_at: new Date().toISOString() })
    .eq('id', id);
  return error ? { ok: false, error: error.message } : { ok: true, error: null };
}
