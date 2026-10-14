import React, { useEffect, useRef, useState } from 'react';
import { getRandomCursorMessage, CursorMessageItem } from '../services/cursorService';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const flagRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [hoverType, setHoverType] = useState<'none' | 'button' | 'card' | 'input' | 'link'>('none');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<CursorMessageItem>(() => getRandomCursorMessage());
  const [messageOpacity, setMessageOpacity] = useState(1);

  // Periodic smooth message rotation (every 12 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageOpacity(0);
      setTimeout(() => {
        setCurrentMessage(prev => getRandomCursorMessage(prev.id));
        setMessageOpacity(1);
      }, 300);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
        setIsTouchDevice(true);
      }
    };
    checkTouch();
  }, []);

  useEffect(() => {
    // Only run on desktop devices with fine pointers and no reduced motion preference
    const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!finePointerQuery.matches || reducedMotionQuery.matches || isTouchDevice) {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    
    // Physics variables for smooth trailing flag & ring
    let flagX = -100;
    let flagY = -100;
    let ringX = -100;
    let ringY = -100;

    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) setIsVisible(true);

      // Detect hover target category
      const target = e.target as HTMLElement | null;
      if (target) {
        if (target.closest('input, textarea, select')) {
          setHoverType('input');
        } else if (target.closest('button, .interactive-btn, .magnetic-btn, [role="button"]')) {
          setHoverType('button');
        } else if (target.closest('a, .interactive-link')) {
          setHoverType('link');
        } else if (target.closest('.interactive-card, section, article, .interactive-row')) {
          setHoverType('card');
        } else {
          setHoverType('none');
        }
      }
    };

    const onMouseDown = () => setIsMouseDown(true);
    const onMouseUp = () => setIsMouseDown(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    // Physics Animation Loop - ALL cursor elements updated in sync per frame
    const render = () => {
      // 1. Instant Precision Dot Update in sync with rAF
      if (dotRef.current && mouseX >= 0 && mouseY >= 0) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // 2. Flag trailing lerp interpolation
      const flagEase = 0.14;
      flagX += (mouseX - flagX) * flagEase;
      flagY += (mouseY - flagY) * flagEase;

      // 3. Trailing ring lerp
      const ringEase = 0.22;
      ringX += (mouseX - ringX) * ringEase;
      ringY += (mouseY - ringY) * ringEase;

      // Viewport edge collision safety calculation
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const flagWidth = flagRef.current?.offsetWidth || 160;
      const flagHeight = flagRef.current?.offsetHeight || 32;

      // Determine offset relative to cursor pointer
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

      if (ringRef.current && ringX >= 0 && ringY >= 0) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      rafId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  if (isTouchDevice) return null;

  return (
    <div 
      aria-hidden="true" 
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none"
    >
      {/* 1. Precision Center Cursor Dot (Synchronized with rAF; Hidden on button/link hover to prevent extra dot) */}
      <div
        ref={dotRef}
        style={{ opacity: isVisible && hoverType !== 'button' && hoverType !== 'link' ? 1 : 0 }}
        className={`pointer-events-none fixed top-0 left-0 -ml-[4px] -mt-[4px] w-[8px] h-[8px] rounded-full shadow-xs transition-opacity duration-150 ease-out will-change-transform origin-center ${
          hoverType === 'input' 
            ? 'scale-y-[1.8] scale-x-[0.4] bg-[#D97706] dark:bg-[#F5C84C]' 
            : 'scale-100 bg-[#0B5ED7] dark:bg-[#F5C84C]'
        }`}
      />

      {/* 2. Trailing Focus Ring (Exact Center Anchor) */}
      <div
        ref={ringRef}
        style={{ opacity: isVisible && hoverType !== 'input' ? 1 : 0 }}
        className={`pointer-events-none fixed top-0 left-0 -ml-[16px] -mt-[16px] w-[32px] h-[32px] rounded-full transition-all duration-200 ease-out will-change-transform origin-center ${
          hoverType === 'button' || hoverType === 'link'
            ? 'border-2 border-[#D97706] dark:border-[#F5C84C] bg-[#D97706]/15 dark:bg-[#F5C84C]/15 scale-110'
            : isMouseDown
            ? 'border border-[#D97706] dark:border-[#F5C84C] bg-[#D97706]/20 dark:bg-[#F5C84C]/25 scale-90'
            : 'border border-[#0B5ED7]/40 dark:border-[#F5C84C]/40 bg-transparent scale-100'
        }`}
      />

      {/* 3. Smooth Logistics Text-Flag Capsule */}
      <div
        ref={flagRef}
        style={{ 
          opacity: isVisible && hoverType !== 'input' ? 1 : 0,
          transition: 'opacity 250ms ease'
        }}
        className={`pointer-events-none fixed top-0 left-0 px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md flex items-center gap-1.5 will-change-transform transition-colors duration-200 ${
          hoverType === 'button' || hoverType === 'link'
            ? 'bg-white/95 dark:bg-[#0B2445]/95 border-[#D97706] dark:border-[#F5C84C] text-slate-900 dark:text-white shadow-lg ring-2 ring-[#D97706]/20 dark:ring-[#F5C84C]/30'
            : hoverType === 'card'
            ? 'bg-white/95 dark:bg-[#0B2445]/95 border-[#D97706]/50 dark:border-[#F5C84C]/70 text-slate-900 dark:text-white shadow-md'
            : 'bg-white/90 dark:bg-[#0B2445]/90 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200'
        }`}
      >
        {/* Pulsing Status Beacon */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            hoverType === 'button' || hoverType === 'link' ? 'bg-[#D97706] dark:bg-[#F5C84C]' : 'bg-[#10B981]'
          }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            hoverType === 'button' || hoverType === 'link' ? 'bg-[#D97706] dark:bg-[#F5C84C]' : 'bg-[#10B981]'
          }`} />
        </span>

        {/* Dynamic Text Banner Content */}
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
