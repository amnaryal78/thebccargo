import React, { useEffect, useId, useRef, useState } from 'react';

interface LimitedTextProps {
  text: string;
  /** Number of lines shown before "View more" appears. */
  lines?: 2 | 3 | 4;
  className?: string;
}

const CLAMP: Record<2 | 3 | 4, string> = {
  2: 'line-clamp-2',
  3: 'line-clamp-3',
  4: 'line-clamp-4',
};

// Reserve the same height for every card so a row of cards always lines up.
const RESERVE: Record<2 | 3 | 4, string> = {
  2: 'min-h-[2.844rem]',
  3: 'min-h-[4.266rem]',
  4: 'min-h-[5.688rem]',
};

/**
 * Text limited to a fixed number of lines. When the text is longer, a
 * "View more" button shows the rest, and "View less" folds it again.
 */
export const LimitedText: React.FC<LimitedTextProps> = ({ text, lines = 3, className = '' }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const id = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      // Only measurable while clamped; once opened we keep the button so it can fold back.
      if (!expanded) setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, lines, expanded]);

  return (
    <div className="flex flex-col items-start gap-2">
      <p
        ref={ref}
        id={id}
        className={`text-sm text-[var(--text-secondary)] leading-relaxed ${RESERVE[lines]} ${expanded ? '' : CLAMP[lines]} ${className}`}
      >
        {text}
      </p>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={id}
          className="min-h-[36px] text-sm font-semibold text-[var(--gold-dark)] underline underline-offset-4 decoration-dashed hover:decoration-solid cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring,#F2B705)] rounded"
        >
          {expanded ? 'View less' : 'View more'}
        </button>
      )}
    </div>
  );
};
