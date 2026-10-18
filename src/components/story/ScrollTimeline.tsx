import React, { useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { Card3D } from '../../design/primitives/Card3D';

/**
 * Shared scroll timeline used by the About story and the How to Ship guide.
 * Light theme only.
 * Uses normal page scrolling only. A gold line fills as the visitor scrolls past each step.
 */

interface ScrollTimelineProps {
  children: React.ReactNode;
  /** Desktop: alternate cards left and right of the line. Off = line on the left, full-width cards. */
  alternate?: boolean;
  /** Surface the line's unreached track sits on. */
  className?: string;
}

export const ScrollTimeline: React.FC<ScrollTimelineProps> = ({ children, alternate = false, className = '' }) => {
  const reduce = !!useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 70%', 'end 60%'] });
  const grow = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const linePos = alternate ? 'left-4 md:left-1/2' : 'left-4';

  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className={`absolute top-0 bottom-0 ${linePos} w-[3px] -translate-x-1/2 rounded-full bg-[#002147]/10`}
      />
      <motion.div
        aria-hidden="true"
        style={{ scaleY: reduce ? 1 : grow }}
        className={`absolute top-0 bottom-0 ${linePos} w-[3px] -translate-x-1/2 rounded-full origin-top bg-gradient-to-b from-[#F2B705] to-[#FAC623]`}
      />
      <ol ref={listRef} className="relative flex flex-col gap-8 sm:gap-10 list-none m-0 p-0">
        {React.Children.map(children, (child, i) =>
          React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { index: i, alternate }) : child
        )}
      </ol>
    </div>
  );
};

type Tone = 'default' | 'danger' | 'warn';

interface TimelineItemProps {
  children: React.ReactNode;
  /** Injected by ScrollTimeline. */
  index?: number;
  alternate?: boolean;
  tone?: Tone;
  /** Clicking/tapping the card keeps it highlighted (for touch). Off for cards with their own buttons. */
  tapToHighlight?: boolean;
  /** Disable the tiny tilt, e.g. for tall cards full of text. */
  flat?: boolean;
}

const TONE_BORDER: Record<Tone, { lit: string; idle: string }> = {
  default: { lit: 'border-[#F2B705]', idle: 'border-[#D5DEEA]' },
  danger: { lit: 'border-red-500', idle: 'border-red-200' },
  warn: { lit: 'border-amber-500', idle: 'border-amber-200' },
};

export const TimelineItem: React.FC<TimelineItemProps> = ({
  children,
  index = 0,
  alternate = false,
  tone = 'default',
  tapToHighlight = true,
  flat = false,
}) => {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const reached = useInView(ref, { once: true, margin: '0px 0px -30% 0px' });
  const current = useInView(ref, { margin: '-40% 0px -40% 0px' });
  const [hover, setHover] = useState(false);
  const [touched, setTouched] = useState(false);
  const lit = current || hover || touched;
  const onLeft = alternate && index % 2 === 0;

  const side = alternate ? (onLeft ? 'md:w-1/2 md:pr-12 md:pl-0' : 'md:w-1/2 md:pl-12 md:ml-auto') : '';
  const dotSide = alternate ? (onLeft ? 'md:left-auto md:right-0 md:translate-x-1/2' : 'md:left-0') : '';
  const dotColor =
    tone === 'danger' ? 'bg-red-500 border-red-500' : tone === 'warn' ? 'bg-amber-500 border-amber-500' : 'bg-[#F2B705] border-[#F2B705]';

  return (
    <li ref={ref} className={`relative pl-12 ${side}`}>
      <span
        aria-hidden="true"
        className={`absolute top-7 left-4 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-300 ${dotSide} ${
          reached ? dotColor : 'bg-[#EEF3FA] border-[#002147]/25'
        } ${lit ? 'scale-150 shadow-[0_0_0_6px_rgba(242,183,5,0.22)]' : ''}`}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Card3D
          maxTilt={reduce || flat ? 0 : 2}
          disabled={reduce || flat}
          spotlightIntensity="subtle"
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onClick={tapToHighlight ? () => setTouched((t) => !t) : undefined}
          className={`overflow-hidden rounded-[var(--r-md)] border bg-white shadow-sm text-[#002147] transition-colors duration-300 ${
            lit ? TONE_BORDER[tone].lit : TONE_BORDER[tone].idle
          }`}
        >
          {children}
        </Card3D>
      </motion.div>
    </li>
  );
};
