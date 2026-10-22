import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Phone, Send, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CustomerMessage, fetchAllMessages, replyToMessage } from '../../services/messageService';

/** Staff inbox: customer messages with a one-box reply. Used by the admin tab and the mobile /messages page. */
export const MessagesInbox: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'new' | 'all'>('new');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchAllMessages();
    setMessages(res.messages);
    setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const send = async (m: CustomerMessage) => {
    setSending(m.id);
    const text = (drafts[m.id] || '').trim();
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

  const shown = filter === 'new' ? messages.filter((m) => m.status === 'new') : messages;
  const newCount = messages.filter((m) => m.status === 'new').length;

  return (
    <div className="max-w-3xl mx-auto space-y-4 p-1">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-heading font-black text-2xl text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#F2B705]" /> Messages
        </h1>
        <div className="flex items-center gap-2">
          {(['new', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-heading font-bold uppercase tracking-wider cursor-pointer ${
                filter === f ? 'bg-[#002147] text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {f === 'new' ? `Needs reply (${newCount})` : 'All'}
            </button>
          ))}
          <button
            type="button"
            onClick={load}
            aria-label="Refresh messages"
            className="min-h-[40px] min-w-[40px] grid place-items-center rounded-xl bg-slate-100 text-slate-600 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">{error}</div>}
      {!loading && shown.length === 0 && !error && (
        <div className="p-8 text-center text-sm text-slate-500 rounded-2xl bg-white border border-slate-200">
          {filter === 'new' ? 'No messages waiting for a reply.' : 'No messages yet.'}
        </div>
      )}

      {shown.map((m) => (
        <article key={m.id} className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900">{m.name}</div>
              <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 text-xs font-mono text-[#002147] underline">
                <Phone className="w-3 h-3" /> {m.phone}
              </a>
              {m.userEmail && <div className="text-[11px] text-slate-500 font-mono">{m.userEmail}</div>}
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
              {new Date(m.createdAt).toLocaleString()}
              <div className={m.status === 'new' ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                {m.status === 'new' ? 'NEEDS REPLY' : 'REPLIED'}
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-800 whitespace-pre-wrap break-words bg-slate-50 rounded-xl p-3">{m.body}</p>

          {m.reply ? (
            <div className="text-sm rounded-xl p-3 bg-[#002147]/5 border border-[#002147]/10">
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-700 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Reply by {m.repliedBy}
              </div>
              <p className="whitespace-pre-wrap break-words text-slate-800">{m.reply}</p>
            </div>
          ) : (
            <div className="flex gap-2 items-end">
              <textarea
                value={drafts[m.id] || ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
                rows={2}
                maxLength={2000}
                placeholder="Write your reply..."
                aria-label={`Reply to ${m.name}`}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 resize-y"
              />
              <button
                type="button"
                disabled={sending === m.id || !(drafts[m.id] || '').trim()}
                onClick={() => send(m)}
                className="min-h-[44px] px-4 rounded-xl bg-[#002147] text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" /> {sending === m.id ? 'Sending' : 'Reply'}
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
};
