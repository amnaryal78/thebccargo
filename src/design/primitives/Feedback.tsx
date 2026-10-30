import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Skeleton, SkeletonGroup } from './Skeleton';

/** Inline spinner for buttons and small areas. Prefer Skeleton when the shape of the content is known. */
export const Spinner: React.FC<{ className?: string; label?: string }> = ({ className = 'size-5', label = 'Loading' }) => (
  <span role="status" className="inline-flex">
    <span className={`${className} rounded-full border-2 border-current border-t-transparent animate-spin`} aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </span>
);

/** Whole-area loading: placeholder rows, only visible when the wait is long enough to notice. */
export const LoadingState: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => (
  <SkeletonGroup label={label} className={`space-y-3 py-4 ${className}`}>
    {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
  </SkeletonGroup>
);

export interface ErrorStateProps {
  title: string;
  /** What happened and what to do next, in one or two sentences */
  description: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** Extra actions, e.g. a WhatsApp or call link */
  children?: React.ReactNode;
  className?: string;
}

/** Something failed. Says what, and gives a way forward; never apologises, never vague. */
export const ErrorState: React.FC<ErrorStateProps> = ({ title, description, actionLabel, onAction, children, className = '' }) => (
  <div role="alert" className={`flex gap-4 p-5 sm:p-6 rounded-[var(--r-md)] bg-[var(--danger-bg)]/50 border border-[var(--danger)]/20 ${className}`}>
    <AlertTriangle className="size-5 shrink-0 mt-0.5 text-[var(--danger)]" aria-hidden="true" />
    <div className="min-w-0">
      <h3 className="font-heading font-semibold text-base text-[var(--text)]">{title}</h3>
      <div className="mt-1 text-[15px] leading-relaxed text-[var(--text-muted)] [overflow-wrap:anywhere]">{description}</div>
      {(actionLabel || children) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {actionLabel && onAction && <Button variant="outline" size="sm" onClick={onAction}>{actionLabel}</Button>}
          {children}
        </div>
      )}
    </div>
  </div>
);
