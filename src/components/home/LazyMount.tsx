import React, { useEffect, useRef, useState } from 'react';

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

  if (show) return <>{children}</>;
  return <div ref={ref} style={{ minHeight }} aria-hidden="true" />;
};
