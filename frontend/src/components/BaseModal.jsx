import { X } from 'lucide-react';
import { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '500px',
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
        if (triggerRef.current) {
          triggerRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const getFocusable = () => {
      return modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };

    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
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

    modalRef.current.addEventListener('keydown', handleKeyDown);
    return () => {
      modalRef.current?.removeEventListener('keydown', handleKeyDown);
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
      className="modal-backdrop" 
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        tabIndex="-1"
        className="modal-panel glass-card"
        style={{
          width: '100%', maxWidth: maxWidth,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-lg), var(--glass-inner-light)',
          display: 'flex', flexDirection: 'column',
          outline: 'none',
          overflow: 'hidden',
          margin: '20px'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={ariaDescribedby ? descId : undefined}
      >
        <div 
          className="modal-header"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '24px 24px 16px', borderBottom: '1px solid var(--border)'
          }}
        >
          <h2 id={titleId} style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>
            {title}
          </h2>
          <button 
            onClick={onClose}
            disabled={preventClose || loading}
            style={{
              background: 'var(--surface-hover)', border: 'none',
              color: 'var(--text-soft)', padding: '6px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (preventClose || loading) ? 'not-allowed' : 'pointer', 
              transition: 'all 0.2s ease',
              opacity: (preventClose || loading) ? 0.5 : 1
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div 
          id={ariaDescribedby ? descId : undefined}
          className="modal-body"
          style={{
            padding: '24px', overflowY: 'auto', maxHeight: '70vh'
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
