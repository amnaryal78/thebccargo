import React, { useEffect, useState, useRef } from 'react';

export interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatter?: (val: number) => string;
}

export const Counter: React.FC<CounterProps> = ({
  from = 0,
  to,
  duration = 1200,
  prefix = '',
  suffix = '',
  className = '',
  formatter,
}) => {
  const [value, setValue] = useState(from);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setValue(to);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const updateCounter = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.round(from + (to - from) * easeProgress);

            setValue(currentVal);

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          };

          requestAnimationFrame(updateCounter);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [from, to, duration]);

  const displayValue = formatter ? formatter(value) : value.toLocaleString('en-US');

  return (
    <span
      ref={elementRef}
      className={`font-data font-bold tracking-tight inline-block select-none tabular-nums ${className}`}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};
