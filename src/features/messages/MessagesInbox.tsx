import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, Copy, Inbox, MessageCircle, MessageSquareText, Phone, RefreshCw, Search, Send, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ChatMessage,
  ChatThread,
  fetchThreadMessages,
  fetchThreads,
  staffReply,
  subscribeChat,
} from '../../services/chatService';

/**
 * Staff inbox for customer chats, laid out like a messaging app:
 * conversation list, open thread with composer, and (on wide screens) the customer's details.
 * Used by the admin "Customer chats" page and the mobile /messages page.
 */

const SAVED_REPLIES = [
  { label: 'We will call you', text: 'Thank you for your message. We will call you shortly.' },
  { label: 'Ask weight and country', text: 'Please share the weight and destination country so we can give you a price.' },
  { label: 'Office hours', text: 'You can bring your parcel to our Hetauda office, Sunday to Friday, 9 am to 6 pm.' },
  { label: 'Price on WhatsApp', text: 'We have sent the price to your WhatsApp. Please check and reply there if you want to book.' },
];

const AVATAR_TINTS = ['#EEF3F9', '#FFF9E0', '#E7F6EE', '#FCEBEA', '#EEF0FB'];
const tintFor = (id: string) => AVATAR_TINTS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TINTS.length];

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

const listTime = (iso: string) => {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  if (d.toDateString() === new Date().toDateString()) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
const dayLabel = (iso: string) => {
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString()) return 'Today';
  if (d.toDateString() === new Date(Date.now() - 86_400_000).toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};
const clock = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const whatsappLink = (phone: string) => {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) digits = `977${digits}`;
  return `https://wa.me/${digits}`;
};

const Avatar: React.FC<{ thread: ChatThread; size?: 'sm' | 'md' | 'lg' }> = ({ thread, size = 'md' }) => {
  const box = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-11 h-11 text-sm';
  return (
    <span
      className={`${box} rounded-full grid place-items-center font-heading font-bold text-[#002147] shrink-0`}
      style={{ background: tintFor(thread.id) }}
      aria-hidden="true"
    >
      {initials(thread.name)}
    </span>
  );
};

type Filter = 'all' | 'waiting';

export const MessagesInbox: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const loadThreads = useCallback(async () => {
    const res = await fetchThreads();
    setThreads(res.threads);
    setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadThreads();
    const unsub = subscribeChat(null, () => void loadThreads());
    const id = window.setInterval(() => void loadThreads(), 30_000);
    return () => {
      unsub();
      window.clearInterval(id);
    };
  }, [loadThreads]);

  useEffect(() => {
    if (!activeId) return;
    let alive = true;
    setLoadingThread(true);
    setMessages([]);
    void fetchThreadMessages(activeId).then((m) => {
      if (!alive) return;
      setMessages(m);
      setLoadingThread(false);
    });
    const unsub = subscribeChat(activeId, (m) => setMessages((list) => (list.some((x) => x.id === m.id) ? list : [...list, m])));
    composerRef.current?.focus();
    return () => {
      alive = false;
      unsub();
    };
  }, [activeId]);

  useLayoutEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  // Open the first waiting chat on wide screens so staff land on work, not an empty pane.
  useEffect(() => {
    if (activeId || loading || !threads.length) return;
    if (window.matchMedia('(min-width: 768px)').matches) setActiveId((threads.find((t) => t.needsReply) ?? threads[0]).id);
  }, [threads, loading, activeId]);

  const active = threads.find((t) => t.id === activeId) ?? null;
  const waiting = threads.filter((t) => t.needsReply).length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads.filter(
      (t) =>
        (filter === 'all' || t.needsReply) &&
        (!q || `${t.name} ${t.phone} ${t.userEmail ?? ''} ${t.lastBody ?? ''}`.toLowerCase().includes(q))
    );
  }, [threads, query, filter]);

  const send = async () => {
    if (!activeId || !draft.trim() || sending) return;
    const text = draft.trim();
    setSending(true);
    const res = await staffReply(activeId, text, user?.email || 'staff');
    setSending(false);
    if (!res.ok) return setError(res.error);
    setError(null);
    setDraft('');
    setMessages(await fetchThreadMessages(activeId));
    void loadThreads();
    composerRef.current?.focus();
  };

  const applySaved = (text: string) => {
    setDraft(text);
    setSavedOpen(false);
    composerRef.current?.focus();
  };

  const copyPhone = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const customerMessages = messages.filter((m) => m.sender === 'customer').length;

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 h-[calc(100dvh-7.5rem)] md:h-[100dvh] flex flex-col bg-white">
      <div
        className={`grid flex-1 min-h-0 grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_288px]`}
      >
        {/* ---------- conversation list ---------- */}
        <aside className={`${active ? 'hidden md:flex' : 'flex'} flex-col min-h-0 border-r border-slate-200 bg-[#FBFCFE]`} aria-label="Conversations">
          <div className="px-4 pt-5 pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="font-heading font-extrabold text-xl text-[#002147] flex items-center gap-2">
                <Inbox className="w-5 h-5 text-[#CC9704]" aria-hidden="true" /> Chats
              </h1>
              <button
                type="button"
                onClick={() => void loadThreads()}
                aria-label="Refresh chats"
                className="w-9 h-9 grid place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-[#002147] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} />
              </button>
            </div>
            <label className="relative block">
              <span className="sr-only">Search chats</span>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, phone or message"
                className="w-full h-10 pl-9 pr-3 rounded-full bg-slate-100 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] focus-visible:bg-white"
              />
            </label>
            <div role="tablist" aria-label="Filter chats" className="flex gap-1.5">
              {(
                [
                  ['all', `All ${threads.length || ''}`],
                  ['waiting', `Needs reply ${waiting || ''}`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={filter === id}
                  onClick={() => setFilter(id)}
                  className={`h-8 px-3 rounded-full text-[13px] font-semibold cursor-pointer transition-colors ${
                    filter === id ? 'bg-[#002147] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label.trim()}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p role="alert" className="mx-4 mb-2 p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
              {error}
            </p>
          )}

          <ul className="flex-1 overflow-y-auto list-none m-0 px-2 pb-3">
            {loading &&
              [0, 1, 2, 3].map((i) => (
                <li key={i} className="flex items-center gap-3 p-2.5" aria-hidden="true">
                  <span className="w-11 h-11 rounded-full bg-slate-100 animate-pulse motion-reduce:animate-none" />
                  <span className="flex-1 space-y-2">
                    <span className="block h-3 w-2/3 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
                    <span className="block h-3 w-1/2 rounded bg-slate-100 animate-pulse motion-reduce:animate-none" />
                  </span>
                </li>
              ))}
            {!loading && shown.length === 0 && (
              <li className="px-4 py-10 text-center">
                <MessageSquareText className="w-8 h-8 mx-auto text-slate-300" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {query ? 'No chat matches your search' : filter === 'waiting' ? 'Nobody is waiting' : 'No chats yet'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {query || filter === 'waiting' ? 'Try All, or clear the search.' : 'Chats appear here when a customer taps Chat on the website.'}
                </p>
              </li>
            )}
            {shown.map((t) => {
              const on = t.id === activeId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(t.id)}
                    aria-current={on ? 'true' : undefined}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] ${
                      on ? 'bg-[#EEF3F9]' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <Avatar thread={t} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`truncate text-[15px] ${t.needsReply ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>{t.name}</span>
                        <span className={`text-xs shrink-0 ${t.needsReply ? 'text-[#8A6200] font-semibold' : 'text-slate-500'}`}>{listTime(t.lastMessageAt)}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className={`truncate text-[13px] ${t.needsReply ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                          {t.lastBody ? `${t.lastSender === 'staff' ? 'You: ' : ''}${t.lastBody}` : t.phone}
                        </span>
                        {t.needsReply && <span className="ml-auto w-2.5 h-2.5 rounded-full bg-[#F2B705] shrink-0" aria-label="Needs reply" />}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ---------- open conversation ---------- */}
        <section className={`${active ? 'flex' : 'hidden md:flex'} flex-col min-h-0 min-w-0`} aria-label="Conversation">
          {!active ? (
            <div className="flex-1 grid place-items-center p-8 text-center">
              <div className="max-w-xs">
                <span className="w-16 h-16 mx-auto rounded-full bg-[#EEF3F9] grid place-items-center">
                  <MessageCircle className="w-8 h-8 text-[#002147]" aria-hidden="true" />
                </span>
                <p className="mt-3 font-heading font-bold text-[#002147]">{loading ? 'Loading chats' : threads.length ? 'Pick a chat' : 'No chats yet'}</p>
                <p className="text-sm text-slate-500">
                  {threads.length ? 'Choose a conversation on the left to read and reply.' : 'When a customer messages from the website, it shows up here instantly.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 h-16 px-3 sm:px-4 border-b border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  aria-label="Back to chats"
                  className="md:hidden w-10 h-10 -ml-1 grid place-items-center rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <Avatar thread={active} />
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold text-slate-900 truncate leading-tight">{active.name}</p>
                  <p className="text-[13px] text-slate-500 truncate">
                    {active.phone}
                    <span className="mx-1.5 text-slate-300" aria-hidden="true">|</span>
                    {active.isGuest ? 'Guest' : 'Signed in'}
                  </p>
                </div>
                <a
                  href={`tel:${active.phone}`}
                  aria-label={`Call ${active.name}`}
                  className="w-10 h-10 grid place-items-center rounded-full text-[#002147] hover:bg-[#EEF3F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <a
                  href={whatsappLink(active.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${active.name}`}
                  className="w-10 h-10 grid place-items-center rounded-full text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </header>

              <div ref={listRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-5 bg-[#F6F8FB]">
                {loadingThread && <p className="text-center text-sm text-slate-500 py-8">Loading messages...</p>}
                {(() => {
                  let lastDay = '';
                  return messages.map((m, i) => {
                    const staff = m.sender === 'staff';
                    const day = dayLabel(m.createdAt);
                    const showDay = day !== lastDay;
                    lastDay = day;
                    const prev = messages[i - 1];
                    const next = messages[i + 1];
                    const firstOfRun = showDay || prev?.sender !== m.sender;
                    const lastOfRun = !next || next.sender !== m.sender || dayLabel(next.createdAt) !== day;
                    return (
                      <React.Fragment key={m.id}>
                        {showDay && (
                          <p className="flex justify-center my-4">
                            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-500">{day}</span>
                          </p>
                        )}
                        <div className={`flex items-end gap-2 ${staff ? 'justify-end' : 'justify-start'} ${lastOfRun ? 'mb-3' : 'mb-0.5'}`}>
                          {!staff && (lastOfRun ? <Avatar thread={active} size="sm" /> : <span className="w-7 shrink-0" />)}
                          <div
                            className={`max-w-[min(75%,520px)] px-3.5 py-2 text-[15px] leading-snug whitespace-pre-wrap break-words shadow-[0_1px_1px_rgba(0,33,71,0.06)] ${
                              staff ? 'bg-[#F2B705] text-[#002147]' : 'bg-white text-slate-900'
                            } ${
                              staff
                                ? `rounded-2xl ${firstOfRun ? '' : 'rounded-tr-md'} ${lastOfRun ? 'rounded-br-md' : 'rounded-br-md'}`
                                : `rounded-2xl ${firstOfRun ? '' : 'rounded-tl-md'} ${lastOfRun ? 'rounded-bl-md' : 'rounded-bl-md'}`
                            }`}
                            title={new Date(m.createdAt).toLocaleString()}
                          >
                            {m.body}
                            {lastOfRun && (
                              <span className={`block text-[10.5px] mt-1 ${staff ? 'text-[#002147]/65 text-right' : 'text-slate-400'}`}>
                                {clock(m.createdAt)}
                                {staff && m.staffEmail ? `, ${m.staffEmail.split('@')[0]}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </div>

              {/* composer */}
              <div className="relative shrink-0 border-t border-slate-200 bg-white p-3 sm:px-4">
                {savedOpen && (
                  <div role="menu" aria-label="Saved replies" className="absolute bottom-full left-3 sm:left-4 mb-2 w-[min(360px,calc(100%-1.5rem))] rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_-16px_rgba(0,33,71,0.35)] p-1.5 z-10">
                    {SAVED_REPLIES.map((r) => (
                      <button
                        key={r.label}
                        type="button"
                        role="menuitem"
                        onClick={() => applySaved(r.text)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#EEF3F9] focus-visible:bg-[#EEF3F9] focus-visible:outline-none cursor-pointer"
                      >
                        <span className="block text-sm font-semibold text-[#002147]">{r.label}</span>
                        <span className="block text-xs text-slate-500 truncate">{r.text}</span>
                      </button>
                    ))}
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send();
                  }}
                  className="flex items-end gap-2 rounded-[26px] bg-slate-100 pl-1.5 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-[#F2B705] focus-within:bg-white transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setSavedOpen((o) => !o)}
                    aria-expanded={savedOpen}
                    aria-haspopup="menu"
                    title="Saved replies"
                    className="h-10 px-3 rounded-full text-[13px] font-semibold text-[#002147] hover:bg-white shrink-0 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                  >
                    <MessageSquareText className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Saved replies</span>
                  </button>
                  <textarea
                    ref={composerRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setSavedOpen(false);
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    rows={1}
                    maxLength={2000}
                    placeholder={`Reply to ${active.name.split(' ')[0]}`}
                    aria-label={`Reply to ${active.name}`}
                    className="flex-1 min-w-0 max-h-36 min-h-[40px] py-2 bg-transparent text-[15px] text-slate-900 placeholder:text-slate-500 resize-none focus:outline-none [field-sizing:content]"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    aria-label="Send reply"
                    className="w-10 h-10 rounded-full bg-[#F2B705] text-[#002147] grid place-items-center shrink-0 shadow-[0_2px_0_#8A6200] active:translate-y-0.5 active:shadow-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer transition-colors"
                  >
                    <Send className="w-[18px] h-[18px]" />
                  </button>
                </form>
                <p className="hidden sm:block mt-1.5 px-3 text-[11px] text-slate-400">Enter to send, Shift + Enter for a new line</p>
              </div>
            </>
          )}
        </section>

        {/* ---------- customer details (wide screens) ---------- */}
        {active && (
          <aside className="hidden xl:flex flex-col min-h-0 overflow-y-auto border-l border-slate-200 p-5" aria-label="Customer details">
            <div className="text-center pb-5 border-b border-slate-100">
              <span className="inline-flex"><Avatar thread={active} size="lg" /></span>
              <p className="mt-3 font-heading font-bold text-lg text-slate-900">{active.name}</p>
              <p className="text-sm text-slate-500">{active.isGuest ? 'Guest customer' : 'Signed-in customer'}</p>
              <div className="mt-4 flex justify-center gap-2">
                <a href={`tel:${active.phone}`} className="h-9 px-3.5 rounded-full bg-[#EEF3F9] text-[13px] font-semibold text-[#002147] flex items-center gap-1.5 hover:bg-[#D6E1EF]">
                  <Phone className="w-4 h-4" aria-hidden="true" /> Call
                </a>
                <a
                  href={whatsappLink(active.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3.5 rounded-full bg-emerald-50 text-[13px] font-semibold text-emerald-800 flex items-center gap-1.5 hover:bg-emerald-100"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp
                </a>
              </div>
            </div>
            <dl className="pt-4 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold text-slate-500">Phone</dt>
                <dd className="mt-0.5 flex items-center justify-between gap-2 text-slate-900">
                  {active.phone}
                  <button
                    type="button"
                    onClick={copyPhone}
                    aria-label="Copy phone number"
                    className="w-8 h-8 grid place-items-center rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Account</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 text-slate-900 break-all">
                  <UserRound className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  {active.userEmail ?? 'Guest, chat saved on their device'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">First message</dt>
                <dd className="mt-0.5 text-slate-900">{new Date(active.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Messages from customer</dt>
                <dd className="mt-0.5 text-slate-900">{customerMessages}</dd>
              </div>
            </dl>
          </aside>
        )}
      </div>
    </div>
  );
};
