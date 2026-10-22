import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Clock, MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CustomerMessage, fetchMyMessages, sendCustomerMessage, validateMessage } from '../services/messageService';

const WHATSAPP = '9779855019485';
const MAX = 2000;
// Name and phone are remembered on this device only, so returning customers type less.
const CONTACT_KEY = 'bc_message_contact';

const readContact = (): { name: string; phone: string } => {
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    return raw ? JSON.parse(raw) : { name: '', phone: '' };
  } catch {
    return { name: '', phone: '' };
  }
};

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const MessageUsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [name, setName] = useState(() => readContact().name);
  const [phone, setPhone] = useState(() => readContact().phone);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Only a failed send (not a form mistake) offers WhatsApp as the way out. */
  const [sendFailed, setSendFailed] = useState(false);
  const [sent, setSent] = useState(false);
  const [mine, setMine] = useState<CustomerMessage[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const prefill = (user?.user_metadata?.full_name || user?.user_metadata?.name) as string | undefined;
    if (prefill) setName((n) => n || prefill);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchMyMessages(user.id).then(setMine);
  }, [user, sent]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    // focus the first field that still needs typing
    const t = window.setTimeout(() => {
      const fields = formRef.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
      const target = fields ? Array.from(fields).find((f) => !f.value) ?? fields[0] : null;
      target?.focus();
    }, 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = validateMessage(name, phone, body);
    setSendFailed(false);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const res = await sendCustomerMessage({ name, phone, body, userId: user?.id, userEmail: user?.email });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      setSendFailed(true);
      return;
    }
    try {
      localStorage.setItem(CONTACT_KEY, JSON.stringify({ name: name.trim(), phone: phone.trim() }));
    } catch {
      /* storage blocked: nothing to remember */
    }
    setSent(true);
    setBody('');
  };

  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hello BC Cargo, I am ${name || 'a customer'}. ${body}`.trim())}`;
  const field =
    'w-full min-h-[46px] mt-1.5 px-3 rounded-[var(--r-sm)] border border-[var(--line-strong)] bg-white text-[15px] text-[var(--text)] placeholder:text-[var(--ink-500)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] focus-visible:border-[#002147]';
  const label = 'block text-sm font-semibold text-[#002147]';

  // Portal to <body>: the floating buttons sit in their own stacking layer, under the bottom nav.
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[#00152D]/60 p-0 sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-us-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[92dvh] overflow-y-auto bg-[var(--surface)] text-[var(--text)] rounded-t-[22px] sm:rounded-[22px] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start gap-3 px-5 pt-4 pb-3 bg-[#002147] text-white">
          <span className="w-10 h-10 rounded-xl bg-white/10 grid place-items-center shrink-0">
            <MessageCircle className="w-5 h-5 text-[#F2B705]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="message-us-title" className="font-heading font-extrabold text-lg leading-tight">
              Message us
            </h2>
            <p className="flex items-center gap-1 text-xs text-white/75 mt-0.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" /> We reply Sun to Fri, 9 am to 6 pm
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-h-[40px] min-w-[40px] -mr-2 grid place-items-center rounded-full hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {user && mine.length > 0 && (
            <section aria-label="Your messages" className="space-y-2.5">
              {[...mine].reverse().map((m) => (
                <div key={m.id} className="space-y-1.5">
                  <div className="ml-8 rounded-2xl rounded-br-md bg-[#EEF3F9] px-3 py-2 text-sm">
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className="mt-1 text-[11px] text-[var(--text-muted)] text-right">{timeLabel(m.createdAt)}</p>
                  </div>
                  {m.reply ? (
                    <div className="mr-8 rounded-2xl rounded-bl-md bg-[#002147] text-white px-3 py-2 text-sm">
                      <p className="text-[11px] font-semibold text-[#F2B705] mb-0.5">BC Cargo</p>
                      <p className="whitespace-pre-wrap break-words">{m.reply}</p>
                    </div>
                  ) : (
                    <p className="text-[12px] text-[var(--text-muted)]">Waiting for a reply</p>
                  )}
                </div>
              ))}
              <hr className="border-[var(--line)]" />
            </section>
          )}

          {sent ? (
            <div className="text-center py-4 space-y-3" role="status">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" aria-hidden="true" />
              <p className="font-heading font-bold text-lg text-[#002147]">Message sent</p>
              <p className="text-sm text-[var(--text-muted)]">
                We will reply on {phone || 'your phone'}
                {user ? ' and here' : ''}.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="min-h-[44px] px-5 rounded-[var(--r-sm)] border-2 border-[#002147]/30 text-sm font-heading font-bold text-[#002147] hover:border-[#002147] cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={submit} className="space-y-3.5" noValidate>
              <label className={label}>
                Your name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  autoComplete="name"
                  required
                  className={field}
                />
              </label>
              <label className={label}>
                Phone number
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={30}
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="98XXXXXXXX"
                  className={`${field} font-mono`}
                />
              </label>
              <label className={label}>
                <span className="flex items-baseline justify-between">
                  <span>Message</span>
                  <span className={`text-xs font-normal ${body.length > MAX - 100 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]'}`}>
                    {body.length}/{MAX}
                  </span>
                </span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  maxLength={MAX}
                  required
                  placeholder="Where are you sending, and how heavy is it?"
                  className={`${field} py-2.5 resize-y`}
                />
              </label>
              {error && (
                <p role="alert" className="text-sm text-[var(--danger)]">
                  {error}{' '}
                  {sendFailed && (
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                    Send on WhatsApp instead
                  </a>
                  )}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full min-h-[50px] rounded-[var(--r-sm)] bg-[#F2B705] text-[#002147] font-heading font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#002147] active:translate-y-1 active:shadow-none disabled:opacity-60 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002147] focus-visible:ring-offset-2"
              >
                <Send className="w-4 h-4" aria-hidden="true" /> {busy ? 'Sending...' : 'Send message'}
              </button>
              {!user && (
                <p className="text-xs text-center text-[var(--text-muted)]">
                  <Link
                    to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                    onClick={onClose}
                    className="underline font-semibold text-[#002147]"
                  >
                    Sign in
                  </Link>{' '}
                  to see our replies here. Without signing in, we reply by phone.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
