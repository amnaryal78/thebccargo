import React, { forwardRef, useRef, useState, useEffect } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  magnetic?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      magnetic = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      children,
      onMouseMove,
      onMouseLeave,
      onBlur,
      style,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLButtonElement | null>(null);
    const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const setMergedRef = (element: HTMLButtonElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = element;
      }
    };

    useEffect(() => {
      if (!magnetic) return;
      const reset = () => {
        setIsHovered(false);
        setMagneticOffset({ x: 0, y: 0 });
      };
      window.addEventListener('scroll', reset, { passive: true });
      return () => window.removeEventListener('scroll', reset);
    }, [magnetic]);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (magnetic && !disabled && !isLoading) {
        const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (canHover && !reducedMotion && internalRef.current) {
          setIsHovered(true);
          const rect = internalRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const maxPull = 4.5; // Bounded physically restrained pull (never jars surrounding content)
          const pullX = ((e.clientX - centerX) / (rect.width / 2)) * maxPull;
          const pullY = ((e.clientY - centerY) / (rect.height / 2)) * maxPull;
          setMagneticOffset({
            x: Math.max(-maxPull, Math.min(maxPull, pullX)),
            y: Math.max(-maxPull, Math.min(maxPull, pullY)),
          });
        }
      }
      if (onMouseMove) onMouseMove(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (magnetic) {
        setIsHovered(false);
        setMagneticOffset({ x: 0, y: 0 });
      }
      if (onMouseLeave) onMouseLeave(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
      if (magnetic) {
        setIsHovered(false);
        setMagneticOffset({ x: 0, y: 0 });
      }
      if (onBlur) onBlur(e);
    };

    const sizeClasses = {
      sm: 'min-h-[44px] sm:pointer-fine:min-h-[38px] h-10 sm:pointer-fine:h-9 px-3.5 text-sm gap-1.5',
      md: 'min-h-[44px] h-11 px-5 text-[15px] gap-2',
      lg: 'min-h-[48px] h-12 sm:h-13 px-6 sm:px-7 text-base gap-2.5',
    };

    // Sentence-case labels; hover deepens the same colour instead of swapping brand colours,
    // so a button never changes identity under the pointer. Gold is the one action per view.
    const variantClasses = {
      primary:
        'bg-[var(--gd-500)] text-[var(--on-accent)] font-semibold shadow-hard-xs hover:bg-[var(--gd-400)] hover:shadow-hard-sm active:bg-[var(--gd-600)] active:shadow-press',
      secondary:
        'bg-[var(--ox-900)] text-white font-semibold shadow-hard-xs hover:bg-[var(--ox-800)] hover:shadow-hard-sm active:bg-[var(--ox-950)] active:shadow-press',
      outline:
        'bg-[var(--surface)] text-[var(--brand)] font-semibold border border-[var(--line-strong)] hover:border-[var(--ox-400)] hover:bg-[var(--ox-50)] active:bg-[var(--ox-100)]',
      ghost:
        'bg-transparent text-[var(--brand)] font-semibold hover:bg-[var(--surface-2)] active:bg-[var(--ink-200)]',
      danger:
        'bg-[var(--rd-500)] text-white font-semibold shadow-hard-xs hover:bg-[var(--rd-600)] active:shadow-press',
    };

    // Apply magnetic pull to inner wrapper so layout flow remains completely undisturbed
    const innerMagneticStyle = magnetic && (magneticOffset.x !== 0 || magneticOffset.y !== 0 || isHovered)
      ? {
          transform: `translate3d(${magneticOffset.x}px, ${magneticOffset.y}px, 0)`,
          transition: isHovered ? 'transform 80ms ease-out' : 'transform 280ms cubic-bezier(0.25, 1, 0.5, 1)',
        }
      : {};

    return (
      <button
        ref={setMergedRef}
        disabled={disabled || isLoading}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onBlur={handleBlur}
        style={style}
        className={`inline-flex items-center justify-center select-none cursor-pointer rounded-[var(--r-sm)] font-heading tracking-[-0.005em] whitespace-nowrap shrink-0 transition-[transform,box-shadow,background-color,color,border-color] duration-[var(--t-fast)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        <span
          style={innerMagneticStyle}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap will-change-transform"
        >
          {isLoading ? (
            <span
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
              aria-hidden="true"
            />
          ) : (
            leftIcon && <span className="shrink-0 inline-flex items-center">{leftIcon}</span>
          )}
          {/* inline-flex keeps an icon and its text on one line when both are passed as children */}
          <span className="inline-flex items-center justify-center whitespace-nowrap">{children}</span>
          {!isLoading && rightIcon && (
            <span className="shrink-0 inline-flex items-center">{rightIcon}</span>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
