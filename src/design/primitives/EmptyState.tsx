import React from 'react';
import { PackageX } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center border border-dashed border-[var(--line-strong)] rounded-[var(--r-md)] bg-[var(--surface)] shadow-hard-xs max-w-md mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-[var(--r-md)] bg-[var(--surface-2)] border border-[var(--line)] shadow-hard-xs flex items-center justify-center text-[var(--text-muted)] mb-4">
        {icon || <PackageX className="w-7 h-7" />}
      </div>

      <h3 className="font-heading font-extrabold text-base sm:text-lg text-[var(--text)] uppercase tracking-tight">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 mb-6 max-w-xs leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
