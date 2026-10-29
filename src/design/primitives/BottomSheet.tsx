import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Critically damped feel (no overshoot): the sheet settles, it does not bounce.
const SETTLE = 'transform 320ms cubic-bezier(0.2, 0.9, 0.25, 1), opacity 320ms ease';
const EXIT_MS = 240;

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Momentum projection (scroll-like deceleration): where a flick would come to rest. */
const project = (velocityPxPerS: number, rate = 0.998) => ((velocityPxPerS / 1000) * rate) / (1 - rate);

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children, footer }) => {
  const [mounted, setMounted] = useState(isOpen);
  const sheetRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; startY: number; y: number; samples: { y: number; t: number }[] } | null>(null);

  const setY = (y: number, animated: boolean) => {
    const sheet = sheetRef.current;
    const backdrop = backdropRef.current;
    if (!sheet || !backdrop) return;
    const h = sheet.offsetHeight || 1;
    sheet.style.transition = animated ? SETTLE : 'none';
    backdrop.style.transition = animated ? 'opacity 320ms ease' : 'none';
    sheet.style.transform = `translateY(${y}px)`;
    backdrop.style.opacity = String(1 - Math.min(1, Math.max(0, y) / h));
  };

  // Position is always set directly (entry, finger, settle, exit), never through React style, so a re-render can never fight a gesture.
  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (mounted) setY(sheetRef.current?.offsetHeight ?? 600, false); // start off-screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      sheetRef.current?.getBoundingClientRect(); // commit the off-screen frame first (works in background tabs, unlike rAF)
      setY(0, true);
      return;
    }
    setY(sheetRef.current?.offsetHeight ?? 600, true); // leave the way it came
    const t = window.setTimeout(() => setMounted(false), reducedMotion() ? 0 : EXIT_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);


  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    // Start from the live on-screen position, so grabbing a moving sheet never jumps.
    const live = new DOMMatrixReadOnly(getComputedStyle(sheet).transform).m42 || 0;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture unsupported for this pointer; tracking still works while over the handle */
    }
    drag.current = { id: e.pointerId, startY: e.clientY - live, y: live, samples: [{ y: e.clientY, t: e.timeStamp }] };
    setY(live, false);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const raw = e.clientY - d.startY;
    // Upward pull rubber-bands instead of hard-stopping.
    d.y = raw >= 0 ? raw : -(Math.sqrt(-raw) * 4);
    d.samples.push({ y: e.clientY, t: e.timeStamp });
    if (d.samples.length > 5) d.samples.shift();
    setY(d.y, false);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const dt = Math.max(1, last.t - first.t);
    const velocity = ((last.y - first.y) / dt) * 1000; // px/s, positive = downward
    const h = sheetRef.current?.offsetHeight ?? 400;
    const restingY = d.y + project(velocity);
    if (restingY > h * 0.4 || velocity > 900) {
      setY(h, true);
      window.setTimeout(onClose, 200);
    } else {
      setY(0, true); // short pull or a tap on the handle: settle back
    }
  };

  if (!mounted) return null;


  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-[var(--ox-950)]/70"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={sheetRef}
        className="relative w-full max-w-lg mx-auto bg-[var(--surface)] text-[var(--text)] rounded-t-[var(--r-lg)] shadow-hard-lg z-10 max-h-[85dvh] flex flex-col overflow-hidden will-change-transform"
      >
        {/* Drag handle: pull down to dismiss (tracks the finger 1:1, flick to throw it away) */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-hidden="true"
        >
          <div className="w-10 h-1.5 bg-[var(--line-strong)] rounded-full" />
        </div>

        {title && (
          <div
            className="flex items-center justify-between px-5 py-3 border-b border-[var(--line)] touch-none"
            onPointerDown={(e) => (e.target as HTMLElement).closest('button') || onPointerDown(e)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <h3 className="font-heading font-semibold text-[17px] text-[var(--brand)]">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-11 h-11 -mr-2 grid place-items-center rounded-[var(--r-sm)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] active:scale-95 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] overflow-y-auto overscroll-contain text-sm leading-relaxed">{children}</div>

        {footer && <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-2)]">{footer}</div>}
      </div>
    </div>
  );
};
