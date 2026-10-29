import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  // Callers often pass an inline onClose; a ref keeps this effect (and the focus move) to open/close only.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Move focus into the dialog, and give it back to whatever opened it when the dialog closes.
    const opener = document.activeElement as HTMLElement | null;
    const first =
      modalRef.current?.querySelector<HTMLElement>('[data-autofocus]') ??
      modalRef.current?.querySelector<HTMLElement>('input, select, textarea, button:not([aria-label="Close modal"])');
    (first ?? modalRef.current)?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      opener?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-desc' : undefined}
      className="fixed inset-0 z-[var(--z-modal)] flex items-end sm:items-center justify-center sm:p-6 overflow-y-auto"
    >
      {/* Flat Dark Backdrop */}
      <div
        className="fixed inset-0 bg-ox-950/70 backdrop-grayscale-20 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-t-[var(--r-lg)] sm:rounded-[var(--r-lg)] shadow-hard-lg z-10 overflow-hidden flex flex-col outline-none pb-[env(safe-area-inset-bottom,0px)] sm:pb-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] bg-[var(--surface-2)]">
          <div>
            <h2 id="modal-title" className="font-heading font-extrabold text-base sm:text-lg tracking-[-0.01em]">
              {title}
            </h2>
            {description && (
              <p id="modal-desc" className="text-xs text-[var(--text-muted)] mt-0.5">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-[var(--r-sm)] border border-[var(--line)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70dvh] text-sm leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--line)] bg-[var(--surface-2)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
