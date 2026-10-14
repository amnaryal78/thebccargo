import React from 'react';

export interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
}) => {
  return (
    <div
      className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded ${className}`}
      style={{ width, height }}
    />
  );
};
