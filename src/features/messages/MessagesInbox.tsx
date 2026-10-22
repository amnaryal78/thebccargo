import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Inbox, MessageCircle, Phone, RefreshCw, Search, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CustomerMessage, fetchAllMessages, replyToMessage } from '../../services/messageService';

/** Staff inbox: customer messages with a one-box reply. Used by the admin tab and the mobile /messages page. */

type Filter = 'new' | 'replied' | 'all';

const QUICK_REPLIES = [
  'Thank you for your message. We will call you shortly.',
  'Please share the weight and destination country so we can give you a price.',
  'You can bring your parcel to our Hetauda office, Sunday to Friday, 9 am to 6 pm.',
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

/** "5 min ago", "3 h ago", "2 Oct" */
const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 24 * 60) return `${Math.round(mins / 60)} h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/** WhatsApp link for a Nepali mobile number, with the reply already typed in. */
const whatsappLink = (phone: string, text: string) => {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) digits = `977${digits}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

export const MessagesInbox: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('new');
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    const res = await fetchAllMessages();
    setMessages(res.messages);
    setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(() => load(true), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  const send = async (m: CustomerMessage) => {
    const text = (drafts[m.id] || '').trim();
    if (!text) return;
    setSending(m.id);
    const res = await replyToMessage(m.id, text, user?.email || 'staff');
    setSending(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    setDrafts((d) => ({ ...d, [m.id]: '' }));
    setMessages((list) =>
      list.map((x) =>
        x.id === m.id
          ? { ...x, status: 'replied', reply: text, repliedBy: user?.email || 'staff', repliedAt: new Date().toISOString() }
          : x
      )
    );
  };

  const counts = useMemo(
    () => ({
      new: messages.filter((m) => m.status === 'new').length,
      replied: messages.filter((m) => m.status === 'replied').length,
      all: messages.length,
    }),
    [messages]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter(
      (m) =>
        (filter === 'all' || m.status === filter) &&
        (!q || `${m.name} ${m.phone} ${m.body} ${m.userEmail ?? ''}`.toLowerCase().includes(q))
    );
  }, [messages, filter, query]);

  const tabs: { id: Filter; label: string }[] = [
    { id: 'new', label: 'Needs reply' },
    { id: 'replied', label: 'Replied' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <Inbox className="w-6 h-6 text-[#F2B705]" aria-hidden="true" /> Customer messages
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {counts.new === 0 ? 'Everything has a reply.' : `${counts.new} waiting for a reply.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          aria-label="Refresh messages"
          className="min-h-[44px] min-w-[44px] grid place-items-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#002147] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div role="tablist" aria-label="Filter messages" className="flex gap-1 p-1 rounded-xl bg-slate-100">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={filter === t.id}
              onClick={() => setFilter(t.id)}
              className={`flex-1 sm:flex-none min-h-[38px] px-3 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filter === t.id ? 'bg-white text-[#002147] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label} <span className="text-xs text-slate-400">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <label className="relative flex-1">
          <span className="sr-only">Search messages</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone or text"
            className="w-full min-h-[46px] pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
          />
        </label>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && messages.length === 0 && (
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-white border border-slate-200 animate-pulse motion-reduce:animate-none" />
          ))}
        </div>
      )}

      {!loading && shown.length === 0 && !error && (
        <div className="p-10 text-center rounded-2xl bg-white border border-dashed border-slate-300">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" aria-hidden="true" />
          <p className="mt-2 font-semibold text-slate-800">
            {query ? 'No message matches your search.' : filter === 'new' ? 'No messages waiting for a reply.' : 'No messages yet.'}
          </p>
          <p className="text-sm text-slate-500">New messages from the website's "Message us" button appear here.</p>
        </div>
      )}

      <ul className="space-y-3 list-none p-0 m-0">
        {shown.map((m) => {
          const draft = drafts[m.id] || '';
          return (
            <li key={m.id}>
              <article
                className={`rounded-2xl bg-white border p-4 space-y-3 ${
                  m.status === 'new' ? 'border-[#F2B705]/60 shadow-[0_6px_18px_-12px_rgba(204,151,4,0.6)]' : 'border-slate-200'
                }`}
              >
                <header className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#002147] text-[#F2B705] font-heading font-bold text-sm grid place-items-center shrink-0">
                    {initials(m.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="font-bold text-slate-900 truncate">{m.name}</h2>
                      <time dateTime={m.createdAt} title={new Date(m.createdAt).toLocaleString()} className="text-xs text-slate-500 shrink-0">
                        {timeAgo(m.createdAt)}
                      </time>
                    </div>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      {m.phone}
                      {m.userEmail ? ` · ${m.userEmail}` : ''}
                    </p>
                  </div>
                </header>

                <p className="text-sm text-slate-800 whitespace-pre-wrap break-words bg-slate-50 rounded-xl px-3 py-2.5">{m.body}</p>

                {m.reply ? (
                  <div className="text-sm rounded-xl px-3 py-2.5 bg-[#002147] text-white ml-6">
                    <p className="flex items-center gap-1 text-[11px] text-[#F2B705] mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Replied by {m.repliedBy}
                      {m.repliedAt ? `, ${timeAgo(m.repliedAt)}` : ''}
                    </p>
                    <p className="whitespace-pre-wrap break-words">{m.reply}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" aria-label="Quick replies">
                      {QUICK_REPLIES.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setDrafts((d) => ({ ...d, [m.id]: q }))}
                          className="shrink-0 max-w-[240px] truncate min-h-[32px] px-3 rounded-full border border-slate-200 bg-white text-xs text-slate-700 hover:border-[#002147]/40 hover:text-[#002147] cursor-pointer"
                          title={q}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={draft}
                      onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          send(m);
                        }
                      }}
                      rows={2}
                      maxLength={2000}
                      placeholder="Write your reply. Ctrl + Enter sends."
                      aria-label={`Reply to ${m.name}`}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-500 resize-y focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
                    />
                  </div>
                )}

                <footer className="flex flex-wrap items-center gap-2">
                  {!m.reply && (
                    <button
                      type="button"
                      disabled={sending === m.id || !draft.trim()}
                      onClick={() => send(m)}
                      className="min-h-[44px] px-4 rounded-xl bg-[#002147] text-white text-sm font-heading font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-[#F2B705]" aria-hidden="true" /> {sending === m.id ? 'Sending...' : 'Send reply'}
                    </button>
                  )}
                  <a
                    href={whatsappLink(m.phone, m.reply ? '' : draft)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp
                  </a>
                  <a
                    href={`tel:${m.phone}`}
                    className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-[#002147]/40 hover:text-[#002147] flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" /> Call
                  </a>
                </footer>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
