import React, { useState, useEffect } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFileDownload } from '../hooks/useFileDownload';

export default function ExportButton({ 
  path = '/api/transactions/export', 
  filename = 'cashbook_export.csv', 
  label = 'Export CSV', 
  className = '',
  onSuccess,
  onError
}) {
  const { download, isLoading } = useFileDownload();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleExport = async (e) => {
    e.preventDefault();
    try {
      await download(path, filename);
      const msg = 'File downloaded successfully!';
      setToast({ type: 'success', message: msg });
      if (onSuccess) onSuccess(msg);
    } catch (err) {
      const errMsg = err.message || 'Export failed';
      setToast({ type: 'error', message: errMsg });
      if (onError) onError(errMsg);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={handleExport}
        disabled={isLoading}
        className={`ghost-btn flex items-center justify-center gap-2 ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          transition: 'all 0.2s ease',
          padding: '8px 16px',
        }}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        <span>{isLoading ? 'Exporting...' : label}</span>
      </button>

      {toast && (
        <div
          className={`toast-popup flex items-center gap-2.5 glass-effect ${
            toast.type === 'success' ? 'toast-success' : 'toast-error'
          }`}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 18px',
            borderRadius: '12px',
            background: 'var(--glass-bg)',
            border: `1px solid ${
              toast.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
            }`,
            boxShadow: 'var(--shadow)',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'toast-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            fontSize: '0.85rem',
            backdropFilter: 'blur(12px)',
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
          ) : (
            <AlertCircle size={18} style={{ color: 'var(--danger)' }} />
          )}
          <span style={{ fontWeight: 500 }}>{toast.message}</span>
        </div>
      )}

      {/* Inline styles to ensure smooth animation */}
      <style>{`
        @keyframes toast-slide-in {
          from {
            transform: translateY(12px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
