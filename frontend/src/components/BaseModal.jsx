import { X } from 'lucide-react';
import { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '760px',
  panelClass = '',
  closeOnBackdrop = true,
  closeOnEscape = true,
  preventClose = false,
  loading = false,
  ariaDescribedby
}) {
  const modalRef = useRef(null);
  const triggerRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape && !preventClose && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape, preventClose, loading]);

  // Lock scroll and save/restore focus
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
          triggerRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Focus trap & initial focus
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const getFocusable = () => {
      return modalRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    };

    const focusable = getFocusable();
    if (focusable.length > 0) {
      // Focus first input or editable field if present, otherwise first focusable
      const firstEditable = Array.from(focusable).find(el => ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName));
      if (firstEditable) {
        firstEditable.focus();
      } else {
        focusable[0].focus();
      }
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      
      const elements = getFocusable();
      if (elements.length === 0) return;
      
      const first = elements[0];
      const last = elements[elements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    const node = modalRef.current;
    node.addEventListener('keydown', handleKeyDown);
    return () => {
      node?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop && !preventClose && !loading) {
      onClose();
    }
  };

  return createPortal(
    <div 
      className="modal-overlay" 
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div 
        ref={modalRef}
        tabIndex="-1"
        className={`modal-shell employee-modal ${panelClass}`}
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={ariaDescribedby ? descId : undefined}
      >
        <header className="modal-header">
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
          <button 
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={preventClose || loading}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </header>

        <div 
          id={ariaDescribedby ? descId : undefined}
          className="modal-body"
        >
          {children}
        </div>

        {footer && (
          <footer className="modal-footer">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}

