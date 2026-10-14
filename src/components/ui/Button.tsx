import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'priority' | 'glass' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'interactive-btn inline-flex items-center justify-center font-semibold tracking-wide rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5ED7] focus-visible:ring-offset-2';

  const variantStyles = {
    primary: 'bg-[#0B5ED7] hover:bg-[#084298] text-white shadow-sm hover:shadow-md active:bg-[#063375]',
    secondary: 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600',
    priority: 'bg-[#071A33] dark:bg-[#0B5ED7] hover:bg-[#0B5ED7] dark:hover:bg-[#084298] text-white shadow-sm hover:shadow-md',
    glass: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md',
    outline: 'border border-[#0B5ED7] text-[#0B5ED7] dark:text-[#2F80ED] hover:bg-[#0B5ED7]/10 hover:border-[#084298]',
    subtle: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/90 dark:hover:bg-slate-700',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs sm:text-sm',
    lg: 'px-5 py-2.5 text-sm sm:text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
