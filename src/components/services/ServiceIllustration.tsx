import React from 'react';

type Mode = 'air' | 'overland' | 'ocean' | 'customs';

/**
 * Small drawn scene for each kind of service. Vector only (no photo requests), fixed
 * aspect ratio so cards never shift while loading.
 */
export const ServiceIllustration: React.FC<{ mode: Mode; className?: string }> = ({ mode, className = '' }) => (
  <svg
    viewBox="0 0 320 112"
    preserveAspectRatio="xMidYMid slice"
    className={`block w-full h-full ${className}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id={`sky-${mode}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#EEF3F9" />
        <stop offset="1" stopColor="#D6E1EF" />
      </linearGradient>
    </defs>
    <rect width="320" height="112" fill={`url(#sky-${mode})`} />

    {mode === 'air' && (
      <g>
        <path d="M-10 92 C 80 92, 120 30, 330 22" fill="none" stroke="#0B2D63" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
        <g transform="translate(224 40) rotate(-14)">
          <path d="M-34 0 L10 -6 L34 0 L10 6 Z" fill="#0B2D63" />
          <path d="M-6 0 L-22 -20 L-12 -20 L12 -3 Z M-6 0 L-22 20 L-12 20 L12 3 Z" fill="#123562" />
          <path d="M-34 0 L-42 -10 L-36 -10 L-28 -2 Z" fill="#F2B632" />
          <circle cx="18" cy="-1" r="1.6" fill="#EEF3F9" />
          <circle cx="24" cy="-1" r="1.6" fill="#EEF3F9" />
        </g>
        <ellipse cx="70" cy="30" rx="26" ry="7" fill="#fff" opacity="0.8" />
        <ellipse cx="96" cy="26" rx="18" ry="6" fill="#fff" opacity="0.8" />
        <path d="M0 104 H320" stroke="#0B2D63" strokeOpacity="0.12" />
      </g>
    )}

    {mode === 'overland' && (
      <g>
        <rect y="78" width="320" height="34" fill="#123562" />
        <path d="M0 95 H320" stroke="#F6F6F4" strokeWidth="2" strokeDasharray="14 12" opacity="0.8" />
        <path d="M0 78 C 60 60, 120 70, 190 62 S 290 58, 320 66 V78 H0Z" fill="#AEC3DE" opacity="0.7" />
        <g transform="translate(120 36)">
          <rect x="0" y="4" width="92" height="38" rx="3" fill="#0B2D63" />
          <rect x="96" y="14" width="34" height="28" rx="3" fill="#123562" />
          <rect x="108" y="19" width="16" height="11" rx="1.5" fill="#EEF3F9" />
          <rect x="6" y="12" width="40" height="6" fill="#F2B632" />
          <circle cx="22" cy="46" r="8" fill="#0A0A09" stroke="#EEF3F9" strokeWidth="2.5" />
          <circle cx="66" cy="46" r="8" fill="#0A0A09" stroke="#EEF3F9" strokeWidth="2.5" />
          <circle cx="112" cy="46" r="8" fill="#0A0A09" stroke="#EEF3F9" strokeWidth="2.5" />
        </g>
      </g>
    )}

    {mode === 'ocean' && (
      <g>
        <path d="M0 84 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 V112 H0Z" fill="#2F5A8F" opacity="0.55" />
        <path d="M0 94 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 V112 H0Z" fill="#123562" />
        <g transform="translate(96 30)">
          <path d="M0 40 H128 L116 60 H12 Z" fill="#0B2D63" />
          <rect x="14" y="24" width="30" height="16" fill="#F2B632" />
          <rect x="44" y="24" width="30" height="16" fill="#2F5A8F" />
          <rect x="74" y="24" width="30" height="16" fill="#AEC3DE" />
          <rect x="30" y="8" width="30" height="16" fill="#2F5A8F" />
          <rect x="60" y="8" width="30" height="16" fill="#F2B632" />
          <rect x="104" y="14" width="16" height="26" fill="#EEF3F9" stroke="#0B2D63" />
        </g>
      </g>
    )}

    {mode === 'customs' && (
      <g>
        <g transform="translate(96 18) rotate(-6)">
          <rect width="84" height="78" rx="4" fill="#fff" stroke="#0B2D63" strokeOpacity="0.3" />
          <path d="M12 18 H64 M12 30 H72 M12 42 H56" stroke="#AEC3DE" strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="58" r="12" fill="#F2B632" />
          <path d="M54 58 l5 5 9 -10" fill="none" stroke="#0B2D63" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g transform="translate(176 30) rotate(5)">
          <rect width="76" height="66" rx="4" fill="#EEF3F9" stroke="#0B2D63" strokeOpacity="0.3" />
          <path d="M10 16 H56 M10 28 H64" stroke="#AEC3DE" strokeWidth="4" strokeLinecap="round" />
          <rect x="10" y="40" width="36" height="14" rx="2" fill="#0B2D63" />
        </g>
      </g>
    )}
  </svg>
);
