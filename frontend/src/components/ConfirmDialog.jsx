import BaseModal from './BaseModal';
import { useTranslation } from 'react-i18next';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading = false }) {
  const { t } = useTranslation();
  return (
    <BaseModal 
      isOpen={open} 
      onClose={onCancel} 
      title={title} 
      maxWidth="420px"
      preventClose={loading}
      loading={loading}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            className="ghost-btn" 
            onClick={onCancel}
            disabled={loading}
            style={{ minWidth: '80px' }}
          >
            {t('Cancel') || 'Cancel'}
          </button>
          <button 
            type="button" 
            className="danger-btn" 
            onClick={onConfirm}
            disabled={loading}
            style={{ minWidth: '80px' }}
          >
            {loading ? (t('Deleting...') || 'Processing...') : (t('Confirm') || 'Confirm')}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

