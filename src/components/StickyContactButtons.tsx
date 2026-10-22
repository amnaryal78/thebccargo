import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, MessageSquarePlus, MapPin, Plus } from 'lucide-react';

const MessageUsModal = lazy(() => import('./MessageUsModal').then((m) => ({ default: m.MessageUsModal })));

const ACTION_BASE =
  'w-12 h-12 rounded-[var(--r-md)] border shadow-hard flex items-center justify-center transition-all duration-[var(--t-fast)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-press shrink-0 cursor-pointer motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] focus-visible:ring-offset-2';

export const StickyContactButtons: React.FC = () => {
  // Below lg the three actions collapse into one FAB so they never cover page content.
  const [open, setOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const handleOpenChat = () => {
    setOpen(false);
    const el = document.getElementById('bc-cargo-ai-chatbot');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const input = el.querySelector('input');
      if (input) {
        setTimeout(() => (input as HTMLInputElement).focus(), 400);
      }
    } else {
      window.location.href = '/#bc-cargo-ai-chatbot';
    }
  };

  return (
    <aside
      ref={rootRef}
      aria-label="Pinned Fast Actions: Chat, WhatsApp, and Location"
      className="fixed bottom-20 right-4 lg:bottom-10 lg:right-6 z-30 flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-auto select-none"
    >
      <div
        id="sticky-contact-actions"
        className={`${open ? 'flex' : 'hidden'} lg:flex flex-col gap-2.5 sm:gap-3`}
      >
        {/* 1. Chat Button (Opens AI Chat) */}
        <div className="group relative flex items-center">
          <span
            className="hidden lg:group-hover:inline-flex absolute right-14 px-2.5 py-1 rounded-[var(--r-xs)] bg-[#002147] text-[#F2B705] border border-[#F2B705]/40 text-xs font-mono font-bold shadow-hard-xs whitespace-nowrap transition-opacity duration-200 pointer-events-none"
            aria-hidden="true"
          >
            Chat
          </span>
          <button
            type="button"
            onClick={handleOpenChat}
            className={`${ACTION_BASE} bg-[#002147] text-[#F2B705] border-[#F2B705]/40 hover:bg-[#F2B705] hover:text-[#002147] hover:border-[#FAC623] hover:shadow-[0_6px_22px_rgba(242,183,5,0.35)]`}
            title="Chat with BC Cargo AI"
            aria-label="Chat with BC Cargo AI"
          >
            <Bot className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Message us (name + phone form, replies shown to signed-in users) */}
        <div className="group relative flex items-center">
          <span
            className="hidden lg:group-hover:inline-flex absolute right-14 px-2.5 py-1 rounded-[var(--r-xs)] bg-[#002147] text-white border border-white/20 text-xs font-mono font-bold shadow-hard-xs whitespace-nowrap transition-opacity duration-200 pointer-events-none"
            aria-hidden="true"
          >
            Message
          </span>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setMessageOpen(true);
            }}
            className={`${ACTION_BASE} bg-[#002147] text-white border-white/20 hover:bg-[#F2B705] hover:text-[#002147] hover:border-[#FAC623]`}
            title="Send us a message"
            aria-label="Send us a message"
          >
            <MessageSquarePlus className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* 2. WhatsApp Button */}
        <div className="group relative flex items-center">
          <span
            className="hidden lg:group-hover:inline-flex absolute right-14 px-2.5 py-1 rounded-[var(--r-xs)] bg-[#002147] text-[#10B981] border border-[#10B981]/40 text-xs font-mono font-bold shadow-hard-xs whitespace-nowrap transition-opacity duration-200 pointer-events-none"
            aria-hidden="true"
          >
            WhatsApp
          </span>
          <a
            href="https://wa.me/9779855019485?text=Hello%20BC%20Cargo,%20I%20would%20like%20to%20inquire%20about%20a%20shipment."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={`${ACTION_BASE} bg-[#F2B705] text-[#002147] border-white/60 hover:bg-[#002147] hover:text-[#FAC623] hover:border-[#123562] hover:shadow-[0_6px_22px_rgba(0,33,71,0.35)]`}
            title="Message on WhatsApp"
            aria-label="Message on WhatsApp"
          >
            <MessageCircle className="w-5 h-5 fill-current stroke-none shrink-0" />
          </a>
        </div>

        {/* 3. Location Button (Opens Google Maps for Hetauda HQ) */}
        <div className="group relative flex items-center">
          <span
            className="hidden lg:group-hover:inline-flex absolute right-14 px-2.5 py-1 rounded-[var(--r-xs)] bg-[#002147] text-white border border-white/20 text-xs font-mono font-bold shadow-hard-xs whitespace-nowrap transition-opacity duration-200 pointer-events-none"
            aria-hidden="true"
          >
            Location
          </span>
          <a
            href="https://maps.app.goo.gl/pYyv4DPf69xwDV9J7"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={`${ACTION_BASE} bg-[#002147] text-white border-white/20 hover:bg-[#F2B705] hover:text-[#002147] hover:border-[#FAC623] hover:shadow-[0_6px_22px_rgba(242,183,5,0.35)]`}
            title="Open Hetauda Office Location in Google Maps"
            aria-label="Open Hetauda Office Location in Google Maps"
          >
            <MapPin className="w-5 h-5 shrink-0 text-[#F2B705] group-hover:text-[#002147]" />
          </a>
        </div>
      </div>

      {/* Mobile/tablet FAB: expands the three actions above it */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="sticky-contact-actions"
        aria-label={open ? 'Close quick contact actions' : 'Open quick contact actions'}
        className="min-[1024px]:hidden w-12 h-12 rounded-full bg-[#F2B705] text-[#002147] border border-white/60 shadow-hard flex items-center justify-center active:translate-y-0.5 active:shadow-press cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B705] focus-visible:ring-offset-2"
      >
        <Plus
          className={`w-6 h-6 transition-transform duration-[var(--t-fast)] motion-reduce:transition-none ${open ? 'rotate-45' : ''}`}
        />
      </button>
      {messageOpen && (
        <Suspense fallback={null}>
          <MessageUsModal onClose={() => setMessageOpen(false)} />
        </Suspense>
      )}
    </aside>
  );
};
