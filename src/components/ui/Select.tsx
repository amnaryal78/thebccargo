import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  hint,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#0B2445] border ${
            error ? 'border-[#DC2626] ring-1 ring-[#DC2626]' : 'border-slate-300 dark:border-slate-700'
          } rounded-md text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/20 appearance-none transition-all pr-10 cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0B2445] text-slate-900 dark:text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
          ▼
        </div>
      </div>
      {error && <span className="text-[11px] font-semibold text-[#DC2626]">{error}</span>}
      {hint && !error && <span className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</span>}
    </div>
  );
};
