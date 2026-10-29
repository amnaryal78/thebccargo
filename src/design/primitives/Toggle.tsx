import React, { useId } from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const toggleId = id || generatedId;
  const descId = `${toggleId}-desc`;

  return (
    <div className={`flex items-start justify-between gap-4 select-none ${className}`}>
      <div className="flex flex-col">
        <label
          htmlFor={toggleId}
          className="text-sm font-heading font-semibold text-[var(--text)] cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <span id={descId} className="text-xs text-[var(--text-muted)] mt-0.5">
            {description}
          </span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        id={toggleId}
        aria-checked={checked}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border clay-inset transition-colors duration-[var(--t-fast)] ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-50 disabled:cursor-not-allowed ${
          checked
            ? 'bg-gd-500 border-white/40'
            : 'bg-[var(--surface-2)] border-[var(--line-strong)]'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-4 w-4 rounded-full border border-black/10 shadow-hard-xs transition-transform duration-[var(--t-fast)] ease-[var(--ease-out)] transform ${
            checked
              ? 'translate-x-5 bg-ox-900'
              : 'translate-x-0.5 bg-[var(--surface)]'
          }`}
        />
      </button>
    </div>
  );
};
