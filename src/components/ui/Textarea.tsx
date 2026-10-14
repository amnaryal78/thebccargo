import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  hint,
  className = '',
  id,
  rows = 4,
  disabled,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 bg-white dark:bg-[#0B2445] border ${
          error 
            ? 'border-[#DC2626] ring-2 ring-[#DC2626]/20' 
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
        } rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#0B5ED7] dark:focus:border-[#2F80ED] focus:ring-2 focus:ring-[#0B5ED7]/15 dark:focus:ring-[#2F80ED]/20 transition-all duration-200 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      {error && <span className="text-[11px] font-semibold text-[#DC2626]">{error}</span>}
      {hint && !error && <span className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</span>}
    </div>
  );
};
