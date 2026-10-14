import React from 'react';

interface BcLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
}

export const BcLogo: React.FC<BcLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  theme = 'light'
}) => {
  const heights = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
    xl: 'h-20'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Artwork Vector */}
      <svg
        viewBox="0 0 320 220"
        className={`${heights[size]} w-auto drop-shadow-sm transition-transform hover:scale-105 duration-200`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Rainbow Gradient for 'B' */}
          <linearGradient id="bc-gradient-b" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF1E1E" />
            <stop offset="25%" stopColor="#FF7A00" />
            <stop offset="50%" stopColor="#FFD600" />
            <stop offset="75%" stopColor="#00E676" />
            <stop offset="100%" stopColor="#00B0FF" />
          </linearGradient>

          {/* Rainbow Gradient for 'C' */}
          <linearGradient id="bc-gradient-c" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E676" />
            <stop offset="35%" stopColor="#00B0FF" />
            <stop offset="70%" stopColor="#651FFF" />
            <stop offset="100%" stopColor="#D500F9" />
          </linearGradient>

          {/* Airplane Trail Arc */}
          <linearGradient id="bc-trail-grad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#0E1638" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#0E2356" />
            <stop offset="100%" stopColor="#1A56DB" />
          </linearGradient>

          {/* Chrome Shading Filter */}
          <filter id="bc-bevel" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#060919" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Dynamic Flight Arch Trail */}
        <path
          d="M 20 120 C 10 70, 70 25, 180 32"
          stroke="url(#bc-trail-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        {/* Airplane Silhouette climbing */}
        <g transform="translate(145, 12) rotate(-12)">
          {/* Fuselage */}
          <path
            d="M 10 24 Q 45 10 90 14 Q 105 16 112 22 Q 105 28 85 28 Q 45 28 10 24 Z"
            fill="#0E2356"
          />
          {/* Main Wing */}
          <polygon points="42,22 8,6 18,22" fill="#1A56DB" />
          <polygon points="52,24 82,46 72,25" fill="#0B1C30" />
          {/* Tail Fin */}
          <polygon points="12,24 2,4 16,8" fill="#1A56DB" />
          {/* Window dots */}
          <circle cx="50" cy="20" r="1.5" fill="#FFFFFF" />
          <circle cx="56" cy="20" r="1.5" fill="#FFFFFF" />
          <circle cx="62" cy="20" r="1.5" fill="#FFFFFF" />
          <circle cx="68" cy="20" r="1.5" fill="#FFFFFF" />
          <circle cx="74" cy="20" r="1.5" fill="#FFFFFF" />
          <circle cx="80" cy="20" r="1.5" fill="#FFFFFF" />
          <circle cx="86" cy="20" r="1.5" fill="#FFFFFF" />
          {/* Jet Engine */}
          <ellipse cx="64" cy="30" rx="8" ry="4" fill="#060919" />
        </g>

        {/* Letter 'B' with bevel 3D stroke */}
        <g filter="url(#bc-bevel)">
          <path
            d="M 45 170 L 78 52 L 118 52 C 142 52 155 64 150 82 C 147 94 139 101 127 106 C 142 110 148 122 143 140 C 137 162 118 170 92 170 Z
               M 78 145 L 94 145 C 104 145 111 141 113 133 C 115 125 110 120 100 120 L 84 120 Z
               M 89 102 L 102 102 C 111 102 118 98 120 90 C 122 83 117 78 107 78 L 94 78 Z"
            fill="url(#bc-gradient-b)"
            stroke="#0A1128"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </g>

        {/* Letter 'C' with rainbow gradient */}
        <g filter="url(#bc-bevel)">
          <path
            d="M 235 62 L 208 84 C 196 68 181 60 162 64 C 138 69 123 93 126 122 C 130 151 151 168 176 164 C 196 160 210 147 218 132 L 246 150 C 230 176 204 192 168 196 C 120 202 91 170 85 118 C 78 68 111 34 160 30 C 192 28 221 40 235 62 Z"
            fill="url(#bc-gradient-c)"
            stroke="#0A1128"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </g>

        {/* Steaming Coffee Cup insignia next to C curve (from brand identity) */}
        <g transform="translate(210, 85)">
          {/* Saucer */}
          <ellipse cx="44" cy="48" rx="28" ry="7" fill="#E2E8F0" stroke="#0E1638" strokeWidth="2.5" />
          {/* Cup Body */}
          <path
            d="M 24 16 L 27 38 C 28 45 60 45 61 38 L 64 16 Z"
            fill="#FFFFFF"
            stroke="#0E1638"
            strokeWidth="2.5"
          />
          {/* Coffee liquid */}
          <ellipse cx="44" cy="18" rx="18" ry="4" fill="#3D1C06" />
          {/* Cup Handle */}
          <path
            d="M 62 20 C 72 20 74 34 60 35"
            stroke="#0E1638"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Swirling Steam wisps */}
          <path
            d="M 38 12 Q 35 4 41 -2 T 37 -12"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 46 12 Q 51 4 45 -2 T 49 -12"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Fast-Moving Freight Truck Silhouette below */}
        <g transform="translate(100, 160)">
          {/* Speed Streaks */}
          <line x1="0" y1="12" x2="35" y2="12" stroke="#1A56DB" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8" y1="18" x2="42" y2="18" stroke="#1A56DB" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="24" x2="48" y2="24" stroke="#1A56DB" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="5" y1="30" x2="52" y2="30" stroke="#1A56DB" strokeWidth="2" strokeLinecap="round" />

          {/* Semi Truck Body */}
          <g transform="translate(48, 0)">
            {/* Trailer */}
            <rect x="0" y="4" width="76" height="28" rx="2" fill="#0E1638" />
            {/* Cab */}
            <path
              d="M 76 12 L 88 12 L 95 20 L 102 21 L 102 32 L 76 32 Z"
              fill="#1A56DB"
            />
            {/* Windshield */}
            <polygon points="87,14 93,20 86,20" fill="#E2E8F0" />
            {/* Wheels */}
            <circle cx="16" cy="33" r="5" fill="#060919" stroke="#E2E8F0" strokeWidth="2" />
            <circle cx="30" cy="33" r="5" fill="#060919" stroke="#E2E8F0" strokeWidth="2" />
            <circle cx="68" cy="33" r="5" fill="#060919" stroke="#E2E8F0" strokeWidth="2" />
            <circle cx="92" cy="33" r="5" fill="#060919" stroke="#E2E8F0" strokeWidth="2" />
          </g>
        </g>

      </svg>

      {/* Accompanying Typography Header */}
      {showSubtitle && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-heading font-extrabold uppercase tracking-tight leading-none ${
                size === 'sm'
                  ? 'text-sm'
                  : size === 'lg'
                  ? 'text-2xl'
                  : size === 'xl'
                  ? 'text-3xl'
                  : 'text-lg md:text-xl'
              } ${theme === 'dark' ? 'text-white' : 'text-[#0b1c30]'}`}
            >
              The BC Cargo
            </span>
          </div>
          <span
            className={`font-sans tracking-wider uppercase font-semibold leading-tight ${
              size === 'sm'
                ? 'text-[9px]'
                : size === 'lg'
                ? 'text-xs'
                : 'text-[10px] md:text-[11px]'
            } ${theme === 'dark' ? 'text-slate-300' : 'text-[#0B5ED7]'}`}
          >
            &amp; Courier Pvt. Ltd.
          </span>
        </div>
      )}
    </div>
  );
};
