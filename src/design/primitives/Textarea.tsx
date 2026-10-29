import React, { forwardRef, useId } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

/** Multi-line field with the same label, border, focus and error treatment as Input. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, id, rows = 4, className = '', ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const noteId = `${fieldId}-note`;
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={fieldId} className="text-sm font-heading font-semibold text-[var(--text)]">
            {label}
            {props.required && <span className="text-[var(--danger)] ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error || helperText ? noteId : undefined}
          className={`w-full px-4 py-3 bg-[var(--surface)] text-[var(--text)] border rounded-[var(--r-sm)] clay-inset font-body text-[15px] leading-relaxed transition-all hover:border-[var(--ox-400)] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-[var(--danger)] focus:ring-[var(--danger)]' : 'border-[var(--line-strong)]'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p id={noteId} className="text-[13px] font-medium text-[var(--danger)]">{error}</p>
        ) : helperText ? (
          <p id={noteId} className="text-[13px] text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
