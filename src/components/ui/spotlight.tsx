import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Slot } from '@radix-ui/react-slot';

export type SpotlightIntensity = 'subtle' | 'normal' | 'strong' | 'prominent';

export interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** Size / radius of the spotlight in pixels (defaults based on intensity) */
  size?: number;
  /** Intensity preset: subtle (0.5x), normal (1x), strong (1.4x), prominent (1.8x) */
  intensity?: SpotlightIntensity;
  /** Optional custom color override for the light circle (e.g. rgba(242,182,50, 0.35)) */
  spotlightColor?: string;
  /** Optional custom border/edge illumination color */
  edgeColor?: string;
  /** Whether to render the dynamic pointer-following edge/border glow. Defaults to true */
  showBorderGlow?: boolean;
  /** Whether to add subtle elevation lift on hover (-translate-y-0.5). Defaults to false */
  elevateOnHover?: boolean;
  /** Whether the spotlight is disabled (e.g. for static/read-only views) */
  disabled?: boolean;
}

const INTENSITY_MULTIPLIERS: Record<SpotlightIntensity, { opacity: number; defaultSize: number }> = {
  subtle: { opacity: 0.65, defaultSize: 360 },
  normal: { opacity: 1.0, defaultSize: 440 },
  strong: { opacity: 1.45, defaultSize: 520 },
  prominent: { opacity: 1.85, defaultSize: 600 },
};

/**
 * Spotlight component: creates a soft, visible pointer-following illumination
 * that follows the user's cursor across meaningful card/panel surfaces.
 *
 * Automatically adapts:
 * - DARK MODE: warm golden-yellow (#FAC623 / #F2B632) glow and edge ring.
 * - LIGHT MODE: rich Oxford-blue (#0B2D63 / #2F5A8F) glow and edge highlight.
 *
 * Uses requestAnimationFrame and direct CSS custom property updates (--mouse-x, --mouse-y)
 * to avoid React re-renders during high-frequency pointer movement.
 * Decorative layers are strictly pointer-events-none and will never disrupt
 * nested clicks, inputs, buttons, dropdowns, or selection.
 */
export const Spotlight = React.forwardRef<HTMLDivElement, SpotlightProps>(
  (
    {
      asChild = false,
      children,
      className = '',
      size,
      intensity = 'normal',
      spotlightColor,
      edgeColor,
      showBorderGlow = true,
      elevateOnHover = false,
      disabled = false,
      style,
      onPointerMove,
      onPointerEnter,
      onPointerLeave,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = (forwardedRef as React.RefObject<HTMLDivElement>) || internalRef;
    const [isInteractive, setIsInteractive] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const rafIdRef = useRef<number | null>(null);
    const targetCoordsRef = useRef<{ x: number; y: number } | null>(null);

  // Check device capabilities: fine pointer and user motion preferences
  useEffect(() => {
    const checkCapability = () => {
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsInteractive(finePointer && !reducedMotion && !disabled);
    };

    checkCapability();
    const hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handler = () => checkCapability();
    hoverMq.addEventListener('change', handler);
    motionMq.addEventListener('change', handler);

    return () => {
      hoverMq.removeEventListener('change', handler);
      motionMq.removeEventListener('change', handler);
    };
  }, [disabled]);

  const updateCssVars = useCallback(() => {
    if (!containerRef.current || !targetCoordsRef.current) return;
    const { x, y } = targetCoordsRef.current;
    const el = containerRef.current;
    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);
    rafIdRef.current = null;
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (onPointerMove) onPointerMove(e);
    if (!isInteractive || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetCoordsRef.current = { x, y };

    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(updateCssVars);
    }
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (onPointerEnter) onPointerEnter(e);
    if (!isInteractive) return;
    setIsHovered(true);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetCoordsRef.current = { x, y };
      updateCssVars();
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (onPointerLeave) onPointerLeave(e);
    if (!isInteractive) return;
    setIsHovered(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const { opacity: intensityOpacity, defaultSize } = INTENSITY_MULTIPLIERS[intensity];
  const spotlightRadius = size ?? defaultSize;

  // Custom inline styles merging CSS custom properties
  const customStyles: React.CSSProperties = {
    ...style,
    ['--spotlight-sz' as any]: `${spotlightRadius}px`,
    ['--spotlight-op' as any]: isHovered ? intensityOpacity : 0,
    ...(spotlightColor ? { ['--spotlight-col-override' as any]: spotlightColor } : {}),
    ...(edgeColor ? { ['--spotlight-edge-override' as any]: edgeColor } : {}),
  };

  // Base container class combining positioning, overflow clipping and optional elevation
  const containerClasses = [
    'spotlight-container',
    'relative',
    'isolate',
    elevateOnHover ? 'spotlight-elevate' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {/* Decorative spotlight illumination glow layer */}
      <div
        aria-hidden="true"
        className="spotlight-glow-layer pointer-events-none absolute inset-0 z-0"
        style={{
          opacity: isHovered ? intensityOpacity : 0,
          // The glow starts small and faint, then grows and deepens the longer the pointer stays.
          ['--spot-k' as any]: isHovered ? 1.35 : 0.3,
          transition: isHovered
            ? 'opacity 1200ms ease-out, --spot-k 1400ms cubic-bezier(0.2, 0.7, 0.2, 1)'
            : 'opacity 250ms ease-out, --spot-k 250ms ease-out',
          background: `radial-gradient(
            calc(var(--spotlight-sz, 440px) * var(--spot-k, 1)) circle at var(--mouse-x, -999px) var(--mouse-y, -999px),
            var(--spotlight-col-override, var(--spotlight-color, rgba(242,182,50, 0.22))) 0%,
            var(--spotlight-glow, rgba(242,182,50, 0.08)) 40%,
            transparent 75%
          )`,
        }}
      />

      {/* Decorative pointer-following perimeter border glow layer */}
      {showBorderGlow && (
        <div
          aria-hidden="true"
          className="spotlight-border-layer pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-300 ease-out"
          style={{
            opacity: isHovered ? intensityOpacity * 0.9 : 0,
            padding: '1px',
            background: `radial-gradient(
              calc(var(--spotlight-sz, 440px) * 0.7) circle at var(--mouse-x, -999px) var(--mouse-y, -999px),
              var(--spotlight-edge-override, var(--spotlight-edge, rgba(250, 198, 35, 0.65))) 0%,
              transparent 70%
            )`,
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      )}

      {/* Relative child content kept in higher stacking context */}
      <div className="relative z-10 w-full h-full flex flex-col pointer-events-auto">
        {children}
      </div>
    </>
  );

  if (asChild) {
    return (
      <Slot
        ref={containerRef}
        className={containerClasses}
        style={customStyles}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        {content}
      </Slot>
    );
  }

    return (
      <div
        ref={containerRef}
        className={containerClasses}
        style={customStyles}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...props}
      >
        {content}
      </div>
    );
  }
);

Spotlight.displayName = 'Spotlight';

export default Spotlight;

