import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, ChevronLeft, Loader2, LogIn, MessageCircle, Send, ShieldCheck, UserRound, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ChatMessage,
  fetchChat,
  findMyThread,
  getSavedProfile,
  hasGuestChat,
  openChat,
  sendChat,
  subscribeChat,
} from '../../services/chatService';
import { askNotifyPermission, notifyPermission } from '../../lib/chatNotify';

/**
 * Customer chat, Messenger style: choose to sign in (recommended) or chat as a guest,
 * give your name and number once, then the conversation is saved and continues on every visit.
 */

type Step = 'loading' | 'choose' | 'profile' | 'chat';

const WHATSAPP = 'https://wa.me/9779855019485';
const SEEN_KEY = 'bc_chat_seen';

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
};
const clock = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const markChatSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
};

export const ChatWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, loginWithGoogle } = useAuth();
  const [step, setStep] = useState<Step>('loading');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState(() => getSavedProfile()?.name ?? '');
  const [phone, setPhone] = useState(() => getSavedProfile()?.phone ?? '');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perm, setPerm] = useState(notifyPermission);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const signedIn = !!user;

  // Work out where this visitor is: an existing chat, a saved profile, or a fresh start.
  useEffect(() => {
    let alive = true;
    (async () => {
      if (user) {
        const id = await findMyThread(user.id);
        if (!alive) return;
        if (id) {
          setThreadId(id);
          setStep('chat');
        } else {
          const meta = (user.user_metadata?.full_name || user.user_metadata?.name) as string | undefined;
          if (meta) setName((n) => n || meta);
          setStep('profile');
        }
        return;
      }
      setStep(hasGuestChat() && getSavedProfile() ? 'chat' : 'choose');
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const refresh = useCallback(async () => {
    const list = await fetchChat(threadId, signedIn);
    setMessages(list);
    markChatSeen();
  }, [threadId, signedIn]);

  // Load the conversation, then keep it live: realtime when signed in, a light poll for guests.
  useEffect(() => {
    if (step !== 'chat') return;
    void refresh();
    if (signedIn && threadId) {
      return subscribeChat(threadId, (m) => {
        setMessages((list) => (list.some((x) => x.id === m.id) ? list : [...list.filter((x) => !x.id.startsWith('tmp-')), m]));
        markChatSeen();
      });
    }
    const id = window.setInterval(() => void refresh(), 8000);
    return () => window.clearInterval(id);
  }, [step, signedIn, threadId, refresh]);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (step === 'chat') inputRef.current?.focus();
    if (step === 'profile') {
      const fields = formRef.current?.querySelectorAll('input');
      const target = fields ? Array.from(fields).find((f) => !f.value) ?? fields[0] : null;
      target?.focus();
    }
  }, [step]);

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await openChat({ name, phone }, user ? { id: user.id, email: user.email } : null);
    setBusy(false);
    if (res.error) return setError(res.error);
    setThreadId(res.threadId);
    setStep('chat');
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    const temp: ChatMessage = { id: `tmp-${Date.now()}`, sender: 'customer', body: text, createdAt: new Date().toISOString() };
    setMessages((list) => [...list, temp]);
    setDraft('');
    const res = await sendChat(threadId, signedIn, text);
    setBusy(false);
    if (!res.ok) {
      setMessages((list) => list.filter((m) => m.id !== temp.id));
      setDraft(text);
      setError(res.error);
      return;
    }
    if (!signedIn) void refresh();
  };

  const enableNotifications = async () => setPerm(await askNotifyPermission());

  const field =
    'w-full min-h-[46px] mt-1.5 px-3 rounded-xl border border-[var(--line-strong)] bg-white text-[15px] text-[var(--text)] placeholder:text-[var(--ink-500)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] focus-visible:border-[#002147]';

  const body = (() => {
    if (step === 'loading') {
      return (
        <div className="flex-1 grid place-items-center text-[var(--text-muted)]">
          <Loader2 className="w-6 h-6 animate-spin motion-reduce:animate-none" aria-label="Loading chat" />
        </div>
      );
    }

    if (step === 'choose') {
      return (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="text-center space-y-1 pt-2">
            <p className="font-heading font-extrabold text-xl text-[#002147]">How would you like to chat?</p>
            <p className="text-sm text-[var(--text-muted)]">Either way, your conversation is saved.</p>
          </div>

          <button
            type="button"
            onClick={() => loginWithGoogle(window.location.pathname)}
            className="group w-full text-left p-4 rounded-2xl border-2 border-[#F2B705] bg-[#FFF9E0] hover:-translate-y-0.5 active:translate-y-0 transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002147]"
          >
            <span className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-white shadow-sm grid place-items-center shrink-0">
                <LogIn className="w-5 h-5 text-[#002147]" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-heading font-bold text-[#002147]">
                  Continue with Google
                  <span className="px-2 py-0.5 rounded-full bg-[#002147] text-white text-[10px] font-semibold">Most people</span>
                </span>
                <span className="block text-[13px] text-slate-700 leading-snug mt-0.5">
                  Your chat follows you to your phone and computer, and you never lose a reply.
                </span>
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStep('profile')}
            className="w-full text-left p-4 rounded-2xl border border-[var(--line-strong)] bg-white hover:border-[#002147]/40 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
          >
            <span className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-[#EEF3F9] grid place-items-center shrink-0">
                <UserRound className="w-5 h-5 text-[#002147]" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-heading font-bold text-[#002147]">Chat as a guest</span>
                <span className="block text-[13px] text-slate-600 leading-snug mt-0.5">No sign-in. Saved on this device only.</span>
              </span>
            </span>
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> We only use your number to reply to you.
          </p>
        </div>
      );
    }

    if (step === 'profile') {
      return (
        <form ref={formRef} onSubmit={startChat} className="flex-1 overflow-y-auto p-5 space-y-4" noValidate>
          {!signedIn && (
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#002147] -ml-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Back
            </button>
          )}
          <div>
            <p className="font-heading font-extrabold text-xl text-[#002147]">Before we start</p>
            <p className="text-sm text-[var(--text-muted)]">We ask this once, so we know who we are talking to.</p>
          </div>
          <label className="block text-sm font-semibold text-[#002147]">
            Your name
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" className={field} />
          </label>
          <label className="block text-sm font-semibold text-[#002147]">
            Phone number
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={30}
              inputMode="tel"
              autoComplete="tel"
              placeholder="98XXXXXXXX"
              className={`${field} font-mono`}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-[50px] rounded-xl bg-[#F2B705] text-[#002147] font-heading font-extrabold shadow-[0_4px_0_#8A6200] active:translate-y-1 active:shadow-none disabled:opacity-60 transition-all cursor-pointer"
          >
            {busy ? 'Starting chat...' : 'Start chat'}
          </button>
        </form>
      );
    }

    // chat
    let lastDay = '';
    return (
      <>
        {perm === 'default' && (
          <div className="mx-3 mt-3 flex items-center gap-3 p-3 rounded-xl bg-[#FFF9E0] border border-[#F2B705]/50">
            <Bell className="w-5 h-5 text-[#8A6200] shrink-0" aria-hidden="true" />
            <p className="flex-1 text-[13px] text-slate-800 leading-snug">Get a notification when we reply.</p>
            <button
              type="button"
              onClick={enableNotifications}
              className="min-h-[36px] px-3 rounded-lg bg-[#002147] text-white text-xs font-bold cursor-pointer shrink-0"
            >
              Turn on
            </button>
          </div>
        )}
        <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5" aria-live="polite">
          {messages.length === 0 && (
            <div className="text-center py-8 px-4">
              <span className="w-14 h-14 mx-auto rounded-full bg-[#EEF3F9] grid place-items-center">
                <MessageCircle className="w-7 h-7 text-[#002147]" aria-hidden="true" />
              </span>
              <p className="mt-3 font-heading font-bold text-[#002147]">Ask us anything</p>
              <p className="text-sm text-[var(--text-muted)]">Prices, packing, customs or where your parcel is.</p>
            </div>
          )}
          {messages.map((m, i) => {
            const day = dayLabel(m.createdAt);
            const showDay = day !== lastDay;
            lastDay = day;
            const mine = m.sender === 'customer';
            const nextSame = messages[i + 1]?.sender === m.sender;
            return (
              <React.Fragment key={m.id}>
                {showDay && <p className="text-center text-[11px] font-semibold text-[var(--text-muted)] py-2">{day}</p>}
                <div className={`flex ${mine ? 'justify-end' : 'justify-start'} ${nextSame ? '' : 'pb-1.5'}`}>
                  <div
                    className={`max-w-[80%] px-3.5 py-2 text-[15px] leading-snug whitespace-pre-wrap break-words ${
                      mine
                        ? 'bg-[#F2B705] text-[#002147] rounded-2xl rounded-br-md'
                        : 'bg-[#EEF3F9] text-[#002147] rounded-2xl rounded-bl-md'
                    } ${m.id.startsWith('tmp-') ? 'opacity-60' : ''}`}
                  >
                    {m.body}
                    <span className={`block text-[10.5px] mt-0.5 ${mine ? 'text-[#002147]/60 text-right' : 'text-slate-500'}`}>
                      {m.id.startsWith('tmp-') ? 'Sending...' : clock(m.createdAt)}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        {error && (
          <p role="alert" className="px-4 pb-1 text-xs text-[var(--danger)]">
            {error}{' '}
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              WhatsApp us
            </a>
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="flex items-end gap-2 p-3 border-t border-[var(--line)] bg-white"
        >
          <label className="flex-1">
            <span className="sr-only">Message</span>
            <textarea
              ref={inputRef}
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
              placeholder="Type a message"
              className="w-full max-h-32 min-h-[44px] px-4 py-2.5 rounded-[22px] bg-[#EEF3F9] text-[15px] text-[#002147] placeholder:text-slate-500 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] [field-sizing:content]"
            />
          </label>
          <button
            type="submit"
            disabled={!draft.trim() || busy}
            aria-label="Send message"
            className="w-11 h-11 rounded-full bg-[#F2B705] text-[#002147] grid place-items-center shrink-0 shadow-[0_3px_0_#8A6200] active:translate-y-0.5 active:shadow-none disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
        </form>
      </>
    );
  })();

  const profile = getSavedProfile();

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-end sm:justify-end bg-[#00152D]/45 sm:bg-transparent sm:pointer-events-none sm:p-5" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-title"
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-auto w-full sm:w-[380px] h-[88dvh] sm:h-[600px] max-h-[100dvh] flex flex-col bg-[var(--surface)] rounded-t-[22px] sm:rounded-[22px] shadow-[0_24px_60px_-20px_rgba(0,33,71,0.45)] border border-[var(--line-strong)] overflow-hidden"
      >
        <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--line)] bg-white">
          <span className="relative w-10 h-10 rounded-full bg-[#EEF3F9] grid place-items-center shrink-0">
            <img src="/brand/bc-logo-96.webp" alt="" width={28} height={28} className="w-7 h-7 object-contain" />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="chat-title" className="font-heading font-extrabold text-[17px] text-[#002147] leading-tight">
              The BC Cargo
            </h2>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {step === 'chat' && profile ? `Chatting as ${profile.name}` : 'We reply Sun to Fri, 9 am to 6 pm'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="w-10 h-10 grid place-items-center rounded-full text-[#002147] hover:bg-[#EEF3F9] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
          >
            <X className="w-5 h-5" />
          </button>
        </header>
        {body}
      </div>
    </div>,
    document.body
  );
};
