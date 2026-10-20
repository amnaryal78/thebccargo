import React, { Suspense, useEffect, useRef, useState } from 'react';

interface LazyMountProps {
  children: React.ReactNode;
  /** Reserved height so the page does not jump when the section appears. */
  minHeight?: number;
  /** How early (px) before it scrolls into view the section starts to mount. */
  rootMargin?: string;
}

/**
 * Mounts its children only once the placeholder is close to the viewport.
 * Used on the home page so the first load only renders the first two sections.
 */
export const LazyMount: React.FC<LazyMountProps> = ({ children, minHeight = 320, rootMargin = '400px 0px' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  // Keep the reserved height while a code-split section is still downloading, so nothing jumps.
  if (show) return <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>{children}</Suspense>;
  return <div ref={ref} style={{ minHeight }} aria-hidden="true" />;
};

/**
 * Mounts its children when the browser is idle (or after `timeout` ms at the latest).
 * For widgets that are not needed for the first paint, such as the floating chat button.
 */
export const IdleMount: React.FC<{ children: React.ReactNode; timeout?: number }> = ({ children, timeout = 2500 }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setShow(true), { timeout });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setShow(true), 600);
    return () => window.clearTimeout(t);
  }, [timeout]);
  return show ? <>{children}</> : null;
};
