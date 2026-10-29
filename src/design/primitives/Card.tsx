import React from 'react';
import { Spotlight, SpotlightIntensity } from '../../components/ui/spotlight';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'waybill' | 'oxford' | 'interactive';
  headerBanner?: React.ReactNode;
  footer?: React.ReactNode;
  /** Whether to enable pointer-following spotlight illumination. Defaults to true for interactive/flat/oxford */
  enableSpotlight?: boolean;
  /** Spotlight intensity preset */
  spotlightIntensity?: SpotlightIntensity;
}

export const Card: React.FC<CardProps> = ({
  variant = 'flat',
  headerBanner,
  footer,
  children,
  className = '',
  enableSpotlight = true,
  spotlightIntensity = variant === 'interactive' ? 'strong' : 'normal',
  ...props
}) => {
  const variantStyles = {
    flat: 'bg-[var(--surface)] border border-white/60 shadow-hard-sm',
    waybill: 'bg-[var(--surface)] border border-dashed border-[var(--line-strong)] shadow-hard-xs relative p-5 sm:p-6',
    oxford: 'bg-ox-900 text-white border border-white/15 shadow-hard',
    interactive: 'bg-[var(--surface)] border border-white/60 shadow-hard-sm hover:border-gd-500 hover:shadow-[0_8px_24px_-4px_rgba(242,182,50,0.22)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-press transition-all duration-[var(--t-fast)] cursor-pointer',
  };

  if (variant === 'waybill') {
    const waybillContent = (
      <>
        {/* Corner Registration Marks */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[var(--line-strong)] pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[var(--line-strong)] pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-[var(--line-strong)] pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-[var(--line-strong)] pointer-events-none" />

        {headerBanner && <div className="mb-4 pb-3 border-b border-[var(--line)]">{headerBanner}</div>}
        {children}
        {footer && <div className="mt-4 pt-3 border-t border-[var(--line)]">{footer}</div>}
      </>
    );

    if (enableSpotlight) {
      return (
        <Spotlight
          intensity={spotlightIntensity}
          showBorderGlow={false}
          className={`rounded-[var(--r-md)] ${variantStyles.waybill} ${className}`}
          {...props}
        >
          {waybillContent}
        </Spotlight>
      );
    }

    return (
      <div
        className={`rounded-[var(--r-md)] ${variantStyles.waybill} ${className}`}
        {...props}
      >
        {waybillContent}
      </div>
    );
  }

  const standardContent = (
    <>
      {headerBanner && <div className="border-b border-[var(--line)]">{headerBanner}</div>}
      <div className="p-5 sm:p-6">{children}</div>
      {footer && <div className="border-t border-[var(--line)] px-5 py-3.5 bg-[var(--surface-2)]">{footer}</div>}
    </>
  );

  if (enableSpotlight) {
    return (
      <Spotlight
        intensity={spotlightIntensity}
        showBorderGlow={variant !== 'oxford'}
        elevateOnHover={variant === 'interactive'}
        className={`rounded-[var(--r-md)] ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {standardContent}
      </Spotlight>
    );
  }

  return (
    <div
      className={`rounded-[var(--r-md)] overflow-hidden ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {standardContent}
    </div>
  );
};

