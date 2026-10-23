import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { validateMessage } from './messageService';

/**
 * Customer chat. Signed-in customers read/write their own thread directly (RLS);
 * guests hold a random token in this browser and go through the chat_guest_* functions.
 */

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'staff';
  body: string;
  createdAt: string;
  staffEmail?: string | null;
}

export interface ChatThread {
  id: string;
  userId: string | null;
  userEmail: string | null;
  name: string;
  phone: string;
  needsReply: boolean;
  lastMessageAt: string;
  createdAt: string;
  isGuest: boolean;
  /** Latest message, for the list preview */
  lastBody?: string;
  lastSender?: 'customer' | 'staff';
}

export interface ChatProfile {
  name: string;
  phone: string;
}

const PROFILE_KEY = 'bc_chat_profile';
const TOKEN_KEY = 'bc_chat_guest_token';
/** Set once a chat has started on this device, so the reply watcher knows to run. */
export const CHAT_ACTIVE_KEY = 'bc_chat_active';

const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage blocked: the chat still works for this visit */
    }
  },
};

export function getSavedProfile(): ChatProfile | null {
  const raw = store.get(PROFILE_KEY);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as ChatProfile;
    return p.name && p.phone ? p : null;
  } catch {
    return null;
  }
}

function guestToken(create: boolean): string | null {
  let t = store.get(TOKEN_KEY);
  if (!t && create) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    t = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    store.set(TOKEN_KEY, t);
  }
  return t;
}

export const hasGuestChat = () => !!store.get(TOKEN_KEY);

const toMessage = (r: any): ChatMessage => ({
  id: r.id,
  sender: r.sender,
  body: r.body,
  createdAt: r.created_at,
  staffEmail: r.staff_email ?? null,
});

const friendly = (msg: string) =>
  /does not exist|schema cache|not find the function/i.test(msg)
    ? 'Chat is not switched on yet. Please message us on WhatsApp for now.'
    : msg;

/** Opens (or updates) this customer's thread and saves their name and number for next time. */
export async function openChat(
  profile: ChatProfile,
  user: { id: string; email?: string | null } | null
): Promise<{ threadId: string | null; error: string | null }> {
  const invalid = validateMessage(profile.name, profile.phone, 'x');
  if (invalid) return { threadId: null, error: invalid };
  if (!isSupabaseConfigured) return { threadId: null, error: 'Chat is unavailable right now.' };

  const clean = { name: profile.name.trim(), phone: profile.phone.trim() };
  if (user) {
    const { data, error } = await supabase
      .from('chat_threads')
      .upsert({ user_id: user.id, user_email: user.email ?? null, ...clean }, { onConflict: 'user_id' })
      .select('id')
      .single();
    if (error) return { threadId: null, error: friendly(error.message) };
    store.set(PROFILE_KEY, JSON.stringify(clean));
    store.set(CHAT_ACTIVE_KEY, 'user');
    return { threadId: data.id, error: null };
  }

  const { data, error } = await supabase.rpc('chat_guest_open', {
    p_token: guestToken(true),
    p_name: clean.name,
    p_phone: clean.phone,
  });
  if (error) return { threadId: null, error: friendly(error.message) };
  store.set(PROFILE_KEY, JSON.stringify(clean));
  store.set(CHAT_ACTIVE_KEY, 'guest');
  return { threadId: data as string, error: null };
}

/** The signed-in customer's existing thread, if they have one. */
export async function findMyThread(userId: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.from('chat_threads').select('id').eq('user_id', userId).maybeSingle();
  return data?.id ?? null;
}

export async function fetchChat(threadId: string | null, signedIn: boolean): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured) return [];
  if (signedIn && threadId) {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(500);
    return (data || []).map(toMessage);
  }
  const token = guestToken(false);
  if (!token) return [];
  const { data } = await supabase.rpc('chat_guest_fetch', { p_token: token });
  return ((data as any[]) || []).map(toMessage);
}

export async function sendChat(
  threadId: string | null,
  signedIn: boolean,
  body: string
): Promise<{ ok: boolean; error: string | null }> {
  const text = body.trim();
  if (!text) return { ok: false, error: 'Write a message first.' };
  if (text.length > 2000) return { ok: false, error: 'Message is too long (max 2000 characters).' };
  if (signedIn && threadId) {
    const { error } = await supabase.from('chat_messages').insert({ thread_id: threadId, sender: 'customer', body: text });
    return error ? { ok: false, error: friendly(error.message) } : { ok: true, error: null };
  }
  const { error } = await supabase.rpc('chat_guest_send', { p_token: guestToken(false), p_body: text });
  return error ? { ok: false, error: friendly(error.message) } : { ok: true, error: null };
}

/** Live updates for signed-in customers and staff. Returns an unsubscribe function. */
export function subscribeChat(filter: string | null, onInsert: (m: ChatMessage & { threadId: string }) => void): () => void {
  if (!isSupabaseConfigured) return () => undefined;
  const channel = supabase
    .channel(`chat-${filter ?? 'all'}-${Math.random().toString(36).slice(2, 8)}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages', ...(filter ? { filter: `thread_id=eq.${filter}` } : {}) },
      (payload) => onInsert({ ...toMessage(payload.new), threadId: (payload.new as any).thread_id })
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

/* ---------- staff ---------- */

export async function fetchThreads(): Promise<{ threads: ChatThread[]; error: string | null }> {
  if (!isSupabaseConfigured) return { threads: [], error: 'Supabase is not configured.' };
  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .order('needs_reply', { ascending: false })
    .order('last_message_at', { ascending: false })
    .limit(300);
  if (error) return { threads: [], error: friendly(error.message) };
  // newest message per thread, for the previews (one query, newest first)
  const ids = (data || []).map((t: any) => t.id);
  const latest = new Map<string, { body: string; sender: 'customer' | 'staff' }>();
  if (ids.length) {
    const { data: recent } = await supabase
      .from('chat_messages')
      .select('thread_id, body, sender, created_at')
      .in('thread_id', ids)
      .order('created_at', { ascending: false })
      .limit(1000);
    for (const m of recent || []) if (!latest.has(m.thread_id)) latest.set(m.thread_id, { body: m.body, sender: m.sender });
  }
  return {
    threads: (data || []).map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      userEmail: t.user_email,
      name: t.name,
      phone: t.phone,
      needsReply: t.needs_reply,
      lastMessageAt: t.last_message_at,
      createdAt: t.created_at,
      isGuest: !t.user_id,
      lastBody: latest.get(t.id)?.body,
      lastSender: latest.get(t.id)?.sender,
    })),
    error: null,
  };
}

export async function fetchThreadMessages(threadId: string): Promise<ChatMessage[]> {
  return fetchChat(threadId, true);
}

export async function staffReply(threadId: string, body: string, staffEmail: string): Promise<{ ok: boolean; error: string | null }> {
  const text = body.trim();
  if (!text) return { ok: false, error: 'Write a reply first.' };
  const { error } = await supabase
    .from('chat_messages')
    .insert({ thread_id: threadId, sender: 'staff', body: text, staff_email: staffEmail });
  return error ? { ok: false, error: friendly(error.message) } : { ok: true, error: null };
}

export async function countThreadsNeedingReply(): Promise<number> {
  if (!isSupabaseConfigured) return 0;
  const { count, error } = await supabase
    .from('chat_threads')
    .select('id', { count: 'exact', head: true })
    .eq('needs_reply', true);
  return error ? 0 : count ?? 0;
}
