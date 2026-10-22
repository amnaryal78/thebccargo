import React, { useEffect, useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CustomerMessage, fetchMyMessages, sendCustomerMessage } from '../services/messageService';

const WHATSAPP = '9779855019485';

export const MessageUsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [mine, setMine] = useState<CustomerMessage[]>([]);

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
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await sendCustomerMessage({ name, phone, body, userId: user?.id, userEmail: user?.email });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSent(true);
    setBody('');
  };

  const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hello BC Cargo, I am ${name || 'a customer'}. ${body}`.trim())}`;
  const field =
    'w-full min-h-[44px] px-3 rounded-[var(--r-sm)] border border-[var(--line)] bg-[var(--surface)] text-sm text-[var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] mt-1 font-normal normal-case tracking-normal';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Message BC Cargo"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-[var(--surface)] text-[var(--text)] rounded-t-2xl sm:rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-base uppercase tracking-wider">Message us</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="min-h-[40px] min-w-[40px] grid place-items-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent && (
          <p className="text-sm rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 p-3">
            Message sent. We will reply {user ? 'here and ' : ''}on your phone number.
          </p>
        )}

        <form onSubmit={submit} className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider">
            Your name *
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" className={field} />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider">
            Phone number *
            <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} inputMode="tel" autoComplete="tel" placeholder="+977 98..." className={field} />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider">
            Message *
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={2000} className={`${field} py-2`} />
          </label>
          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}{' '}
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold">
                Send on WhatsApp instead
              </a>
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-[48px] rounded-[var(--r-sm)] bg-[#002147] text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#F2B705]" /> {busy ? 'Sending...' : 'Send message'}
          </button>
        </form>

        {user && mine.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[var(--line)]">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> Your messages
            </h3>
            {mine.map((m) => (
              <div key={m.id} className="text-sm space-y-1">
                <p className="rounded-xl bg-[var(--surface-muted,#f1f3f6)] p-2 whitespace-pre-wrap break-words">{m.body}</p>
                {m.reply ? (
                  <p className="rounded-xl bg-[#002147] text-white p-2 whitespace-pre-wrap break-words">
                    <span className="block text-[10px] font-mono text-[#F2B705] mb-0.5">BC Cargo replied</span>
                    {m.reply}
                  </p>
                ) : (
                  <p className="text-[11px] font-mono text-[var(--text-muted)]">Waiting for a reply</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
