import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function SideDrawer({ isOpen, onClose, title, children, width = '450px' }) {
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Trap focus (basic implementation)
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="drawer-backdrop" 
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      />
      <div 
        ref={drawerRef}
        tabIndex="-1"
        className="drawer-panel"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 110,
          width: width, maxWidth: '100%',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg), var(--glass-inner-light)',
          backdropFilter: 'var(--glass-blur)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div 
          className="drawer-header"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: '1px solid var(--border)'
          }}
        >
          <h2 id="drawer-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>
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
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>
        <div 
          className="drawer-body"
          style={{
            flex: 1, padding: '24px', overflowY: 'auto'
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
