import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type?: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const styles = {
    success: 'bg-[var(--surface)] text-[var(--text)] border border-[var(--success)]/30',
    error: 'bg-[var(--surface)] text-[var(--text)] border border-[var(--danger)]/40',
    warning: 'bg-[var(--surface)] text-[var(--text)] border border-gd-500/50',
    info: 'bg-[var(--surface)] text-[var(--text)] border border-[var(--line-strong)]',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[var(--success)] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[var(--danger)] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0" />,
    info: <Info className="w-5 h-5 text-[var(--brand)] shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-[var(--r-md)] shadow-hard ${styles[type]} ${className}`}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        <h4 className="font-heading font-semibold text-sm leading-tight">
          {title}
        </h4>
        {message && (
          <p className="text-xs text-[var(--text-muted)] mt-1 leading-normal">
            {message}
          </p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="text-[var(--text-muted)] hover:text-[var(--text)] p-0.5 rounded cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
