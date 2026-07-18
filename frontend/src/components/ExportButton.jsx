import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useFileDownload } from '../hooks/useFileDownload';
import { useToast } from './ToastProvider';

export default function ExportButton({ 
  path = '/api/transactions/export', 
  filename = 'cashbook_export.csv', 
  label = 'Export CSV', 
  className = '',
  onSuccess,
  onError
}) {
  const { download, isLoading } = useFileDownload();
  const { showToast } = useToast();

  const handleExport = async (e) => {
    e.preventDefault();
    try {
      await download(path, filename);
      const msg = 'File downloaded successfully!';
      showToast(msg, 'success');
      if (onSuccess) onSuccess(msg);
    } catch (err) {
      const errMsg = err.message || 'Export failed';
      showToast(errMsg, 'error');
      if (onError) onError(errMsg);
    }
  };

  return (
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

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
