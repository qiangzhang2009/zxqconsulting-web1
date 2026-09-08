// Modal — unified accessible modal with size variants
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  size?: Size;
  /** Render as side drawer style (xl variant) */
  drawer?: boolean;
  footer?: ReactNode;
  children?: ReactNode;
  hideClose?: boolean;
}

const SIZE_CLASS: Record<Size, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[760px]',
  xl: 'max-w-[960px]',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  drawer = false,
  footer,
  children,
  hideClose = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="admin-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'admin-modal',
          SIZE_CLASS[size],
          drawer && 'drawer'
        )}
      >
        {(title || !hideClose) && (
          <div className="admin-modal-header">
            <div className="min-w-0">
              {title && (
                <h2 className="text-base font-semibold text-white truncate">{title}</h2>
              )}
              {description && (
                <p className="text-xs text-zinc-500 mt-0.5 truncate">{description}</p>
              )}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="admin-btn subtle sm"
                aria-label="关闭"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        <div className="admin-modal-body admin-scroll">{children}</div>

        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
