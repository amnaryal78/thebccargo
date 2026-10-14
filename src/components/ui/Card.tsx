import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'elevated' | 'glass';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'flat',
  interactive = true,
  className = '',
  onMouseMove,
  ...props
}) => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
      e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
    }
    if (onMouseMove) {
      onMouseMove(e);
    }
  };

  const variantStyles = {
    flat: 'bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800',
    elevated: 'bg-white dark:bg-[#0B2445] border border-slate-200 dark:border-slate-800 shadow-sm',
    glass: 'bg-white/80 dark:bg-[#0B2445]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg',
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`rounded-xl p-6 ${variantStyles[variant]} ${
        interactive ? 'interactive-card interactive-radial-glow' : 'transition-colors duration-200'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
