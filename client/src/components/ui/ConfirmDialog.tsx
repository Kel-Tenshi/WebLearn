import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Подтвердите действие',
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  tone = 'danger',
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousActive = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    // Для опасных действий фокус по умолчанию на «Отмена»
    cancelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActive?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onCancel} role="presentation">
      <div
        ref={dialogRef}
        className="modal-dialog confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="confirm-head">
          {tone === 'danger' && (
            <span className="confirm-icon" aria-hidden="true">
              <AlertTriangle size={20} />
            </span>
          )}
          <div>
            <h3 id="confirm-title" className="confirm-title">
              {title}
            </h3>
            <p id="confirm-message" className="confirm-message">
              {message}
            </p>
          </div>
        </div>
        <div className="modal-actions">
          <button type="button" ref={cancelRef} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={tone === 'danger' ? 'danger-solid' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
