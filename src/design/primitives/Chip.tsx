import React from 'react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  active = false,
  count,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 min-h-[34px] h-8 px-3.5 rounded-[var(--r-pill)] text-[13px] font-heading font-semibold transition-all select-none cursor-pointer border whitespace-nowrap shrink-0 ${
        active
          ? 'bg-gd-500 text-ox-900 border-white/60 shadow-hard-sm font-bold hover:bg-gd-400 hover:border-ox-900'
          : 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--line)] shadow-hard-xs hover:border-gd-500 hover:text-ox-900 hover:bg-[var(--surface)] hover:-translate-y-0.5 active:translate-y-0.5'
      } disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 inline-flex items-center">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.2 text-[10px] font-mono rounded-[var(--r-pill)] shrink-0 ${
            active ? 'bg-ox-900 text-white font-bold' : 'bg-[var(--line)] text-[var(--text-muted)]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
