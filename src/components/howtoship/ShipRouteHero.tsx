import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

/**
 * Hero illustration: a parcel in Hetauda and routes to destinations, with a small plane
 * flying the main route. Pure SVG. The parcel tilts a few degrees with the real pointer on
 * devices that have one; touch devices and reduced-motion users get a still picture.
 */

const MAIN_ROUTE = 'M92 214 C 150 70, 300 24, 424 74';
const ROUTE_B = 'M92 214 C 210 160, 360 150, 440 196';
const ROUTE_C = 'M92 214 C 140 130, 210 96, 292 64';

export const ShipRouteHero: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduce = !!useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [canTilt, setCanTilt] = useState(false);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 18 });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 18 });

  useEffect(() => {
    setCanTilt(!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  }, [reduce]);

  const onMove = (e: React.PointerEvent) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r || !canTilt) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative [perspective:900px] ${className}`}
      role="img"
      aria-label="A parcel in Hetauda, Nepal with flight routes to destinations around the world"
    >
      <motion.div style={canTilt ? { rotateX: rx, rotateY: ry } : undefined} className="[transform-style:preserve-3d]">
        <svg viewBox="0 0 520 300" className="w-full h-auto overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="hs-top" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FAC623" />
              <stop offset="1" stopColor="#F2B705" />
            </linearGradient>
            <radialGradient id="hs-glow" cx="0.2" cy="0.7" r="0.7">
              <stop offset="0" stopColor="#F2B705" stopOpacity="0.28" />
              <stop offset="1" stopColor="#F2B705" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="170" cy="190" rx="250" ry="150" fill="url(#hs-glow)" />

          {/* faint globe lines for orientation */}
          <g fill="none" stroke="#002147" strokeOpacity="0.09" strokeWidth="1.2">
            <ellipse cx="270" cy="150" rx="236" ry="120" />
            <ellipse cx="270" cy="150" rx="150" ry="120" />
            <ellipse cx="270" cy="150" rx="60" ry="120" />
            <path d="M34 150h472M60 90h420M60 210h420" />
          </g>

          {/* secondary routes */}
          <g fill="none" stroke="#002147" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 8">
            <path d={ROUTE_B} />
            <path d={ROUTE_C} />
          </g>

          {/* main route draws itself once */}
          <motion.path
            d={MAIN_ROUTE}
            fill="none"
            stroke="#002147"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 9"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
          />

          {/* destination markers */}
          {[
            [424, 74],
            [440, 196],
            [292, 64],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="13" fill="#F2B705" fillOpacity="0.25" />
              <circle cx={x} cy={y} r="6" fill="#F2B705" stroke="#002147" strokeWidth="2" />
            </g>
          ))}

          {/* plane flying the main route (not rendered when motion is reduced) */}
          {!reduce && (
            <g>
              <path
                d="M-12 0 L2 -4 L12 0 L2 4 Z M-2 0 L-8 -9 L-4 -9 L4 -2 M-2 0 L-8 9 L-4 9 L4 2"
                fill="#002147"
                stroke="#002147"
                strokeLinejoin="round"
                strokeWidth="1"
              />
              <animateMotion dur="7s" repeatCount="indefinite" rotate="auto" path={MAIN_ROUTE} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
            </g>
          )}

          {/* the parcel in Hetauda */}
          <g transform="translate(44 168)">
            <ellipse cx="48" cy="84" rx="52" ry="10" fill="#002147" opacity="0.18" />
            {/* left face */}
            <polygon points="0,26 48,46 48,92 0,72" fill="#123562" />
            {/* right face */}
            <polygon points="48,46 96,26 96,72 48,92" fill="#002147" />
            {/* top face */}
            <polygon points="0,26 48,6 96,26 48,46" fill="url(#hs-top)" />
            {/* tape */}
            <polygon points="40,9 56,9 72,17 56,25" fill="#fff" fillOpacity="0.55" />
            <polygon points="52,46 62,42 62,88 52,92" fill="#F2B705" />
            {/* BC mark */}
            <text x="14" y="62" fontSize="17" fontWeight="800" fill="#F6F6F4" transform="rotate(22 14 62)" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
              BC
            </text>
          </g>

          <g style={{ fontFamily: 'var(--font-heading, inherit)' }} fontWeight="700" fontSize="13" fill="#002147">
            <text x="46" y="274">Hetauda, Nepal</text>
          </g>
        </svg>
      </motion.div>
    </div>
  );
};
