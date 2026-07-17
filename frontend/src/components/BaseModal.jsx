import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function BaseModal({ isOpen, onClose, title, children, maxWidth = '500px' }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Trap focus (basic implementation)
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="modal-backdrop" 
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onClick={onClose}
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
            animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            outline: 'none',
            overflow: 'hidden',
            margin: '20px'
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="modal-header"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '24px 24px 16px', borderBottom: '1px solid var(--border)'
            }}
          >
            <h2 id="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>
              {title}
            </h2>
            <button 
              onClick={onClose}
              style={{
                background: 'var(--surface-hover)', border: 'none',
                color: 'var(--text-soft)', padding: '6px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          <div 
            className="modal-body"
            style={{
              padding: '24px', overflowY: 'auto', maxHeight: '70vh'
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
