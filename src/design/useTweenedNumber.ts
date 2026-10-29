import { useEffect, useRef, useState } from 'react';

/**
 * Glides a displayed number to a new target so a price change reads as a change, not a flicker.
 * Interruptible: a new target starts from the value currently on screen. Instant under reduced motion.
 * Show the result aria-hidden and give screen readers the final value separately.
 */
export function useTweenedNumber(target: number, ms = 380): number {
  const [shown, setShown] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    const from = current.current;
    // first real value (from 0) appears directly: counting up on load would be decoration, not feedback
    if (from === target || from === 0 || target === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      current.current = target;
      setShown(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out: fast start, gentle landing
      current.current = from + (target - from) * eased;
      setShown(current.current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);

  return shown;
}
