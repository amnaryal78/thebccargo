import React from 'react';
import './skeleton.css';

/** Below this wait a skeleton would only flicker, so it stays invisible. */
export const SKELETON_DELAY_MS = 300;

/** Wraps the skeletons for one loading area: announces the wait and fades in only if the wait is real. */
export const SkeletonGroup: React.FC<{ label: string; className?: string; delayMs?: number; children: React.ReactNode }> = ({
  label,
  className = '',
  delayMs = SKELETON_DELAY_MS,
  children,
}) => (
  <div role="status" aria-label={label} aria-busy="true" className={`bc-skeleton-group ${className}`} style={{ animationDelay: `${delayMs}ms` }}>
    {children}
  </div>
);

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'text' | 'circle';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const variantStyles = {
    rect: 'rounded-[var(--r-sm)]',
    text: 'rounded-[var(--r-sm)] h-4 w-3/4 my-1',
    circle: 'rounded-full aspect-square',
  };

  return (
    <div
      aria-hidden="true"
      style={{ width, height, ...style }}
      className={`bg-[var(--line)] animate-pulse motion-reduce:animate-none ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
};
