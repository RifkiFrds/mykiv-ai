'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
}: DialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sheet" />

      {/* Dialog */}
      <div
        className={`
          relative w-full max-w-sm
          bg-surface-elevated
          rounded-[var(--radius-3xl)]
          shadow-[var(--shadow-float)]
          animate-scale-in
          overflow-hidden
        `}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-2 text-center">
            {title && (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted">{description}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-3">{children}</div>

        {/* Actions */}
        {actions && (
          <div className="px-6 pb-6 pt-2 flex gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}

export { Dialog, type DialogProps };
