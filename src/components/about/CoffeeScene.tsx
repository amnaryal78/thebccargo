import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/**
 * The "BC = Black Coffee" moment: a small SVG cup with steam and a few sparks.
 * It drifts slightly as the page scrolls; steam and sparks are pure CSS (see index.css).
 */
export const CoffeeScene: React.FC<{ className?: string }> = ({ className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [18, -18]);

  return (
    <div ref={ref} className={`relative ${className}`} role="img" aria-label="A cup of black coffee with the letters BC on it">
      <motion.div style={reduce ? undefined : { y }} className="w-full h-full">
        <svg viewBox="0 0 240 210" className="w-full h-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="cs-cup" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#C9D3E0" />
            </linearGradient>
            <radialGradient id="cs-coffee" cx="0.4" cy="0.35" r="0.8">
              <stop offset="0" stopColor="#3b2418" />
              <stop offset="1" stopColor="#0d0605" />
            </radialGradient>
            <radialGradient id="cs-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#F2B705" stopOpacity="0.35" />
              <stop offset="1" stopColor="#F2B705" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* warm glow behind the cup */}
          <circle cx="120" cy="110" r="100" fill="url(#cs-glow)" />

          {/* saucer */}
          <ellipse cx="120" cy="182" rx="88" ry="14" fill="#06162c" />
          <ellipse cx="120" cy="177" rx="84" ry="12" fill="url(#cs-cup)" stroke="#F2B705" strokeOpacity="0.5" />
          <ellipse cx="120" cy="175" rx="52" ry="7" fill="#aebccd" opacity="0.55" />

          {/* handle */}
          <path d="M184 108c26-2 30 30 4 38-8 3-18 3-26 1" fill="none" stroke="url(#cs-cup)" strokeWidth="9" strokeLinecap="round" />

          {/* cup body */}
          <path d="M52 92h136v38c0 30-26 50-68 50s-68-20-68-50z" fill="url(#cs-cup)" stroke="#002147" strokeOpacity="0.25" strokeWidth="1.5" />
          {/* gold rim */}
          <ellipse cx="120" cy="92" rx="68" ry="14" fill="#F2B705" />
          {/* coffee surface */}
          <ellipse cx="120" cy="92" rx="62" ry="10.5" fill="url(#cs-coffee)" />
          <ellipse cx="102" cy="89" rx="22" ry="3" fill="#fff" opacity="0.14" />

          {/* BC on the cup */}
          <text
            x="120"
            y="146"
            textAnchor="middle"
            fontSize="38"
            fontWeight="800"
            fill="#002147"
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            BC
          </text>

          {/* steam */}
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" className="text-slate-400">
            <path className="cs-steam cs-steam-1" d="M96 70c-10-12 10-18 0-32" />
            <path className="cs-steam cs-steam-2" d="M120 66c-10-12 10-18 0-34" />
            <path className="cs-steam cs-steam-3" d="M144 70c-10-12 10-18 0-30" />
          </g>

          {/* a few gold sparks */}
          <g fill="#F2B705">
            <circle className="cs-spark cs-spark-1" cx="84" cy="60" r="2.2" />
            <circle className="cs-spark cs-spark-2" cx="156" cy="56" r="1.8" />
            <circle className="cs-spark cs-spark-3" cx="124" cy="44" r="1.6" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};
