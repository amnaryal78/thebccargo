import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      {/* Dark Flat Backdrop */}
      <div
        className="fixed inset-0 bg-[#00152D]/80 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Up Bottom Sheet Card */}
      <div className="relative w-full max-w-lg mx-auto bg-[var(--surface)] text-[var(--text)] border-t border-x border-white/60 rounded-t-[var(--r-lg)] shadow-hard-lg z-10 max-h-[85vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Grab Handle */}
        <div className="flex justify-center pt-3 pb-1 cursor-grab" onClick={onClose}>
          <div className="w-12 h-1.5 bg-[var(--line-strong)] rounded-full shadow-hard-xs" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--line)]">
            <h3 className="font-heading font-extrabold text-base uppercase tracking-tight text-[var(--text)]">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sheet"
              className="p-1 rounded-[var(--r-sm)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto overscroll-contain text-sm leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-2)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
