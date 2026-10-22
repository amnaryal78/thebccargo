import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Inbox, MessageCircle, Phone, RefreshCw, Search, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ChatMessage,
  ChatThread,
  fetchThreadMessages,
  fetchThreads,
  staffReply,
  subscribeChat,
} from '../../services/chatService';

/** Staff inbox: customer conversations, Messenger style. Used by the admin tab and the mobile /messages page. */

const QUICK_REPLIES = [
  'Thank you for your message. We will call you shortly.',
  'Please share the weight and destination country so we can give you a price.',
  'You can bring your parcel to our Hetauda office, Sunday to Friday, 9 am to 6 pm.',
];

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  if (mins < 24 * 60) return `${Math.round(mins / 60)}h`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
const clock = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const whatsappLink = (phone: string) => {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) digits = `977${digits}`;
  return `https://wa.me/${digits}`;
};

export const MessagesInbox: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    const res = await fetchThreads();
    setThreads(res.threads);
    setError(res.error);
    setLoading(false);
  }, []);

  // Thread list: live on new messages, plus a slow poll as a safety net.
  useEffect(() => {
    void loadThreads();
    const unsub = subscribeChat(null, () => void loadThreads());
    const id = window.setInterval(() => void loadThreads(), 30_000);
    return () => {
      unsub();
      window.clearInterval(id);
    };
  }, [loadThreads]);

  // Open conversation: load and stay live.
  useEffect(() => {
    if (!activeId) return;
    let alive = true;
    void fetchThreadMessages(activeId).then((m) => alive && setMessages(m));
    const unsub = subscribeChat(activeId, (m) =>
      setMessages((list) => (list.some((x) => x.id === m.id) ? list : [...list, m]))
    );
    return () => {
      alive = false;
      unsub();
    };
  }, [activeId]);

  useLayoutEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const active = threads.find((t) => t.id === activeId) ?? null;
  const waiting = threads.filter((t) => t.needsReply).length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? threads.filter((t) => `${t.name} ${t.phone} ${t.userEmail ?? ''}`.toLowerCase().includes(q)) : threads;
  }, [threads, query]);

  const send = async () => {
    if (!activeId || !draft.trim() || sending) return;
    setSending(true);
    const res = await staffReply(activeId, draft, user?.email || 'staff');
    setSending(false);
    if (!res.ok) return setError(res.error);
    setError(null);
    setDraft('');
    setMessages(await fetchThreadMessages(activeId));
    void loadThreads();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <Inbox className="w-6 h-6 text-[#CC9704]" aria-hidden="true" /> Customer chats
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Loading conversations...' : waiting === 0 ? 'Every chat has a reply.' : `${waiting} waiting for a reply.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadThreads()}
          aria-label="Refresh chats"
          className="min-h-[44px] min-w-[44px] grid place-items-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#002147] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} />
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] rounded-2xl bg-white border border-slate-200 overflow-hidden min-h-[520px] md:h-[calc(100dvh-220px)]">
        {/* conversation list */}
        <aside className={`${active ? 'hidden md:flex' : 'flex'} flex-col border-r border-slate-200 min-h-0`}>
          <label className="relative p-3 border-b border-slate-100">
            <span className="sr-only">Search chats</span>
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or phone"
              className="w-full min-h-[42px] pl-9 pr-3 rounded-xl bg-slate-100 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
            />
          </label>
          <ul className="flex-1 overflow-y-auto list-none m-0 p-1.5 space-y-0.5">
            {loading &&
              [0, 1, 2].map((i) => <li key={i} className="h-16 m-1 rounded-xl bg-slate-100 animate-pulse motion-reduce:animate-none" aria-hidden="true" />)}
            {!loading && shown.length === 0 && (
              <li className="p-6 text-center text-sm text-slate-500">
                {query ? 'No chat matches your search.' : 'No chats yet. They appear here when a customer taps Chat on the website.'}
              </li>
            )}
            {shown.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  aria-current={t.id === activeId ? 'true' : undefined}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                    t.id === activeId ? 'bg-[#FFF9E0]' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="relative w-11 h-11 rounded-full bg-[#EEF3F9] text-[#002147] font-heading font-bold grid place-items-center shrink-0">
                    {initials(t.name)}
                    {t.needsReply && <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#F2B705] ring-2 ring-white" aria-label="Needs reply" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate ${t.needsReply ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{t.name}</span>
                      <span className="text-[11px] text-slate-500 shrink-0">{timeAgo(t.lastMessageAt)}</span>
                    </span>
                    <span className="block text-xs text-slate-500 truncate">
                      {t.phone}
                      {t.isGuest ? ' (guest)' : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* conversation */}
        <section className={`${active ? 'flex' : 'hidden md:flex'} flex-col min-h-0`} aria-label="Conversation">
          {!active ? (
            <div className="flex-1 grid place-items-center p-8 text-center text-slate-500">
              <div>
                <MessageCircle className="w-10 h-10 mx-auto text-slate-300" aria-hidden="true" />
                <p className="mt-2 text-sm">Pick a chat to read and reply.</p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 px-3 py-2.5 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  aria-label="Back to chats"
                  className="md:hidden w-10 h-10 grid place-items-center rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="w-10 h-10 rounded-full bg-[#EEF3F9] text-[#002147] font-heading font-bold grid place-items-center shrink-0">
                  {initials(active.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 truncate">{active.name}</p>
                  <p className="text-xs text-slate-500 truncate font-mono">{active.userEmail ?? `${active.phone} (guest)`}</p>
                </div>
                <a href={`tel:${active.phone}`} aria-label={`Call ${active.name}`} className="w-10 h-10 grid place-items-center rounded-full hover:bg-slate-100 text-[#002147]">
                  <Phone className="w-5 h-5" />
                </a>
                <a
                  href={whatsappLink(active.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${active.name}`}
                  className="w-10 h-10 grid place-items-center rounded-full hover:bg-emerald-50 text-emerald-700"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </header>

              <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-slate-50/60">
                {messages.map((m) => {
                  const staff = m.sender === 'staff';
                  return (
                    <div key={m.id} className={`flex ${staff ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[78%] px-3.5 py-2 text-[15px] leading-snug whitespace-pre-wrap break-words ${
                          staff ? 'bg-[#F2B705] text-[#002147] rounded-2xl rounded-br-md' : 'bg-white border border-slate-200 text-slate-900 rounded-2xl rounded-bl-md'
                        }`}
                      >
                        {m.body}
                        <span className={`block text-[10.5px] mt-0.5 ${staff ? 'text-[#002147]/60 text-right' : 'text-slate-500'}`}>
                          {clock(m.createdAt)}
                          {staff && m.staffEmail ? `, ${m.staffEmail.split('@')[0]}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 p-3 space-y-2 bg-white">
                <div className="flex gap-1.5 overflow-x-auto pb-1" aria-label="Quick replies">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setDraft(q)}
                      title={q}
                      className="shrink-0 max-w-[240px] truncate min-h-[32px] px-3 rounded-full border border-slate-200 text-xs text-slate-700 hover:border-[#002147]/40 hover:text-[#002147] cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send();
                  }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    rows={1}
                    maxLength={2000}
                    placeholder="Write a reply. Enter sends, Shift + Enter for a new line."
                    aria-label={`Reply to ${active.name}`}
                    className="flex-1 max-h-32 min-h-[44px] px-4 py-2.5 rounded-[22px] bg-slate-100 text-[15px] text-slate-900 placeholder:text-slate-500 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] [field-sizing:content]"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    aria-label="Send reply"
                    className="w-11 h-11 rounded-full bg-[#F2B705] text-[#002147] grid place-items-center shrink-0 shadow-[0_3px_0_#8A6200] active:translate-y-0.5 active:shadow-none disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
