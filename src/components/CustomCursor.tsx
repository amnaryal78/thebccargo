import React, { useEffect, useRef, useState } from 'react';
import { getRandomCursorMessage, CursorMessageItem } from '../services/cursorService';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const flagRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [hoverType, setHoverType] = useState<'none' | 'button' | 'input' | 'card'>('none');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Dynamic message flag state (rotating promotional ads, brand slogans, and logistics updates)
  const [currentMessage, setCurrentMessage] = useState<CursorMessageItem>(() => getRandomCursorMessage());
  const [messageOpacity, setMessageOpacity] = useState(1);

  const hoverTypeRef = useRef<'none' | 'button' | 'input' | 'card'>('none');

  // Rotate messages every 6 seconds with smooth cross-fade
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageOpacity(0);
      setTimeout(() => {
        setCurrentMessage(prev => getRandomCursorMessage(prev.id));
        setMessageOpacity(1);
      }, 300);
    }, 6000);

    // Also listen for real-time changes saved from the Admin panel
    const handleMessagesChanged = () => {
      setCurrentMessage(getRandomCursorMessage());
    };
    window.addEventListener('bc_cursor_messages_changed', handleMessagesChanged);

    return () => {
      clearInterval(interval);
      window.removeEventListener('bc_cursor_messages_changed', handleMessagesChanged);
    };
  }, []);

  useEffect(() => {
    const checkFinePointer = () => {
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsDesktop(finePointer && !reducedMotion);
    };

    checkFinePointer();
    const m1 = window.matchMedia('(hover: hover) and (pointer: fine)');
    const m2 = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = () => checkFinePointer();
    m1.addEventListener('change', handler);
    m2.addEventListener('change', handler);

    return () => {
      m1.removeEventListener('change', handler);
      m2.removeEventListener('change', handler);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let flagX = -100;
    let flagY = -100;
    let rafId: number;
    let active = true;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        let nextType: 'none' | 'button' | 'input' | 'card' = 'none';
        if (target.closest('input, textarea, select, [contenteditable="true"], iframe, .chatbot-panel')) {
          nextType = 'input';
        } else if (
          target.closest(
            'button, a, [role="button"], [role="tab"], .interactive-btn, .magnetic-btn, summary, label[for]'
          )
        ) {
          nextType = 'button';
        } else if (target.closest('.interactive-card, .hover-card-interactive, article, .interactive-row, .spotlight-container')) {
          nextType = 'card';
        }

        if (hoverTypeRef.current !== nextType) {
          hoverTypeRef.current = nextType;
          setHoverType(nextType);
        }
      }
    };

    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);
    const onTouchStart = () => setIsVisible(false);

    const render = () => {
      if (!active) return;

      // 1. Instant precision dot
      if (dotRef.current && mouseX >= 0 && mouseY >= 0) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // 2. Smooth lerp for outer ambient ring
      const ringEase = 0.24;
      ringX += (mouseX - ringX) * ringEase;
      ringY += (mouseY - ringY) * ringEase;

      if (ringRef.current && ringX >= 0 && ringY >= 0) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      // 3. Smooth trailing lerp for text-flag capsule with viewport boundary collision avoidance
      const flagEase = 0.16;
      flagX += (mouseX - flagX) * flagEase;
      flagY += (mouseY - flagY) * flagEase;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const flagWidth = flagRef.current?.offsetWidth || 180;
      const flagHeight = flagRef.current?.offsetHeight || 32;

      let offsetX = 18;
      let offsetY = 18;

      if (flagX + flagWidth + 30 > viewportWidth) {
        offsetX = -flagWidth - 14;
      }
      if (flagY + flagHeight + 30 > viewportHeight) {
        offsetY = -flagHeight - 14;
      }

      const finalFlagX = flagX + offsetX;
      const finalFlagY = flagY + offsetY;

      if (flagRef.current && flagX >= 0 && flagY >= 0) {
        flagRef.current.style.transform = `translate3d(${finalFlagX}px, ${finalFlagY}px, 0)`;
      }

      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    rafId = requestAnimationFrame(render);

    return () => {
      active = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isDesktop, isVisible]);

  if (!isDesktop) return null;

  // Over text inputs, native selects, or chatbot panel, suppress ambient cursor overlay
  const showCursor = isVisible && hoverType !== 'input';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none"
    >
      {/* 1. Precision Center Cursor Dot */}
      <div
        ref={dotRef}
        style={{
          opacity: showCursor && hoverType !== 'button' ? 1 : 0,
          transition: 'opacity 120ms ease-out',
        }}
        className="pointer-events-none fixed top-0 left-0 -ml-[4px] -mt-[4px] w-[8px] h-[8px] will-change-transform"
      >
        <div
          className="w-full h-full rounded-full transition-transform duration-150 origin-center bg-[var(--ox-900)] ring-1 ring-white/60 scale-100"
        />
      </div>

      {/* 2. Trailing Focus Ring */}
      <div
        ref={ringRef}
        style={{
          opacity: showCursor ? 1 : 0,
          transition: 'opacity 150ms ease-out',
        }}
        className="pointer-events-none fixed top-0 left-0 -ml-[14px] -mt-[14px] w-[28px] h-[28px] will-change-transform"
      >
        <div
          className={`w-full h-full rounded-full transition-[border-color,background-color,transform] duration-200 ease-out origin-center ${
            hoverType === 'button'
              ? 'border-2 border-[var(--gold)] bg-[var(--gold)]/20 scale-125 ring-2 ring-[var(--gold)]/30'
              : isMouseDown
              ? 'border-2 border-[var(--ox-900)] scale-90'
              : 'border border-[var(--ox-900)]/40 bg-transparent scale-100'
          }`}
        />
      </div>

      {/* 3. Smooth Logistics & Ads Text-Flag Capsule */}
      <div
        ref={flagRef}
        style={{
          opacity: showCursor ? 1 : 0,
          transition: 'opacity 200ms ease-out',
        }}
        className={`pointer-events-none fixed top-0 left-0 px-2.5 py-1 rounded-full border backdrop-blur-md shadow-hard-xs flex items-center gap-1.5 will-change-transform transition-colors duration-200 ${
          hoverType === 'button'
            ? 'bg-white/95 border-[var(--gold)] text-slate-900 ring-2 ring-[var(--gold)]/30 shadow-md'
            : hoverType === 'card'
            ? 'bg-white/95 border-[var(--gold)]/50 text-slate-900'
            : currentMessage.category === 'ad'
            ? 'bg-amber-50/95 border-amber-400 text-ox-900'
            : 'bg-white/90 border-slate-200/80 text-slate-800'
        }`}
      >
        {/* Pulsing Status Beacon */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              currentMessage.category === 'ad' || hoverType === 'button'
                ? 'bg-[var(--gold)]'
                : 'bg-emerald-500'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              currentMessage.category === 'ad' || hoverType === 'button'
                ? 'bg-[var(--gold)]'
                : 'bg-emerald-500'
            }`}
          />
        </span>

        {/* Dynamic Promotional Ad & Brand Text Content */}
        <span
          style={{ opacity: messageOpacity, transition: 'opacity 300ms ease' }}
          className="text-[10px] font-mono font-bold tracking-wide uppercase whitespace-nowrap"
        >
          {currentMessage.text}
        </span>
      </div>
    </div>
  );
};
