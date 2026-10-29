import React, { forwardRef, useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  containerClassName?: string;
  hideLabelVisually?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftAdornment,
      rightAdornment,
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
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`text-sm font-heading font-semibold text-[var(--text)] ${
              hideLabelVisually ? 'sr-only' : ''
            }`}
          >
            {label}
            {props.required && <span className="text-[var(--danger)] ml-1" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftAdornment && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
              {leftAdornment}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full min-h-[48px] px-4 py-3 bg-[var(--surface)] text-[var(--text)] border rounded-[var(--r-sm)] clay-inset font-body text-[15px] transition-all duration-200 hover:border-[var(--ox-400)] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
              leftAdornment ? 'pl-10' : ''
            } ${rightAdornment ? 'pr-10' : ''} ${
              error
                ? 'border-[var(--danger)] focus:ring-[var(--danger)]'
                : 'border-[var(--line-strong)]'
            } ${className}`}
            {...props}
          />

          {rightAdornment && (
            <div className="absolute right-3.5 flex items-center text-[var(--text-muted)]">
              {rightAdornment}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs text-[var(--danger)] font-medium mt-0.5 flex items-center gap-1">
            <span>{error}</span>
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

Input.displayName = 'Input';
