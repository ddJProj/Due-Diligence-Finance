// frontend/src/components/common/ConfirmDialog.tsx

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './ConfirmDialog.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  content?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  focusButton?: 'confirm' | 'cancel';
  className?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  content,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  isLoading = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
  focusButton = 'confirm',
  className = '',
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && closeOnBackdrop && !isLoading) {
        onCancel();
      }
    },
    [closeOnBackdrop, isLoading, onCancel]
  );

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, isLoading, onCancel]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    const buttonToFocus = focusButton === 'confirm' ? confirmButtonRef : cancelButtonRef;
    const timer = setTimeout(() => {
      buttonToFocus.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, focusButton]);

  // Trap focus within dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const dialog = (
    <div
      className="confirm-dialog-backdrop"
      onClick={handleBackdropClick}
      data-testid="confirm-dialog-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className={`confirm-dialog confirm-dialog--${variant} ${className}`.trim()}
      >
        <h2 id="confirm-dialog-title" className="confirm-dialog__title">
          {title}
        </h2>

        <div id="confirm-dialog-message" className="confirm-dialog__content">
          {content || <p className="confirm-dialog__message">{message}</p>}
        </div>

        <div className="confirm-dialog__actions">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="confirm-dialog__button confirm-dialog__button--cancel"
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`confirm-dialog__button confirm-dialog__button--confirm confirm-dialog__button--${variant} ${
              isLoading ? 'confirm-dialog__button--loading' : ''
            }`.trim()}
          >
            {isLoading ? (
              <>
                <span className="confirm-dialog__spinner" />
                Loading...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};
