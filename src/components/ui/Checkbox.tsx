import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = '', id, ...props }) => {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <label htmlFor={checkboxId} className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
      <input
        type="checkbox"
        id={checkboxId}
        className={`w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#0E1638] focus:ring-[#1A56DB] cursor-pointer ${className}`}
        {...props}
      />
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
};
