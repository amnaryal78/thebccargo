import React, { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  containerClassName?: string;
  hideLabelVisually?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helperText,
      error,
      containerClassName = '',
      className = '',
      id,
      disabled,
      hideLabelVisually = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        <label
          htmlFor={selectId}
          className={`text-xs font-heading font-bold uppercase tracking-wider text-[var(--text)] ${
            hideLabelVisually ? 'sr-only' : ''
          }`}
        >
          {label}
          {props.required && <span className="text-[var(--danger)] ml-1" aria-hidden="true">*</span>}
        </label>

        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full min-h-[44px] px-3.5 py-2.5 pr-10 bg-[var(--surface)] text-[var(--text)] border rounded-[var(--r-sm)] clay-inset font-body text-sm appearance-none transition-all cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? 'border-[var(--danger)] focus:border-[var(--danger)]'
                : 'border-[var(--line)] focus:border-[var(--brand)]'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[var(--surface)] text-[var(--text)]">
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            className="w-4 h-4 text-[var(--text-muted)] absolute right-3.5 pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {error && (
          <p id={errorId} className="text-xs text-[var(--danger)] font-medium mt-0.5">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-[var(--text-muted)] mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
