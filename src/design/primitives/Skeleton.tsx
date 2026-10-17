import React from 'react';

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
      className={`bg-[var(--line)] animate-pulse ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
};
