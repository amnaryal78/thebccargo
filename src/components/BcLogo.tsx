import React from 'react';

interface BcLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
  variant?: 'full' | 'mark-only';
  /** Hide the subtitle below 420px (tight headers) */
  compactOnMobile?: boolean;
}

export const BcLogo: React.FC<BcLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  theme,
  variant = 'full',
  compactOnMobile = false,
}) => {
  const iconHeights = {
    sm: 'h-9',
    md: 'h-11',
    lg: 'h-16',
    xl: 'h-24',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-[15px] min-[400px]:text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-3xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px] tracking-widest',
    lg: 'text-xs tracking-widest',
    xl: 'text-sm tracking-widest',
  };

  return (
    <div className={`inline-flex items-center gap-2 min-[400px]:gap-3 select-none ${className}`}>
      {/* Official BC logo: transparent background, so it sits on light and dark surfaces alike */}
      <img
        src="/brand/bc-logo.webp"
        alt={variant === 'mark-only' ? 'The BC Cargo & Courier' : ''}
        aria-hidden={variant === 'full' ? true : undefined}
        width={1245}
        height={802}
        decoding="async"
        draggable={false}
        className={`${iconHeights[size]} w-auto shrink-0 object-contain ${
          theme === 'dark'
            ? 'drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]'
            : theme === 'light'
            ? ''
            : ''
        }`}
      />

      {/* Brand Typography */}
      {variant === 'full' && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={`font-heading font-extrabold tracking-tight ${titleSizes[size]} ${
              theme === 'dark'
                ? 'text-[#F6F6F4]'
                : theme === 'light'
                ? 'text-[#002147]'
                : 'text-[var(--text)]'
            }`}
          >
            The BC Cargo
          </span>
          {showSubtitle && (
            <span
              className={`${compactOnMobile ? "hidden min-[420px]:block" : ""} font-display font-semibold uppercase mt-0.5 ${subSizes[size]} ${
                theme === 'dark'
                  ? 'text-[#F2B705]'
                  : theme === 'light'
                  ? 'text-[#8C6400]'
                  : 'text-[var(--accent-text)]'
              }`}
            >
              &amp; Courier Pvt. Ltd.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
