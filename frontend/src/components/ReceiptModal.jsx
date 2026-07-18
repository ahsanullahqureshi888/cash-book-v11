import BaseModal from './BaseModal';
import { currency } from '../utils/format';
import DateDisplay from './DateDisplay';
import { useTranslation } from 'react-i18next';

export default function ReceiptModal({ transaction, companyName, dateDisplayFormat, onClose, onPrint }) {
  const { t } = useTranslation();
  return (
    <BaseModal
      isOpen={!!transaction}
      onClose={onClose}
      title={t('Receipt / Voucher') || 'Receipt / Voucher'}
      maxWidth="600px"
    >
      {transaction && (
        <div className="receipt-content">
          <div className="receipt-head" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{companyName}</h2>
              <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '0.85rem' }}>{t('Receipt / Voucher')}</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-soft)' }}>
              <strong>{t('Receipt No')}:</strong> {transaction.transaction_no || String(transaction.id).slice(0, 8)}<br />
              <strong>{t('Date')}:</strong> <DateDisplay value={transaction.date} format={dateDisplayFormat} />
            </div>
          </div>
          <div className="receipt-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem', marginBottom: '24px' }}>
            <div><strong>{t('Name')}:</strong> {transaction.account_name}</div>
            <div><strong>{t('Detail')}:</strong> {transaction.detail}</div>
            <div><strong>{t('Type')}:</strong> {transaction.transaction_type === 'cash_in' ? t('Cash In') : t('Cash Out')}</div>
            <div><strong>{t('AFN Amount')}:</strong> {currency(transaction.transaction_type === 'cash_in' ? transaction.cash_in_afn : transaction.cash_out_afn)}</div>
            <div><strong>{t('USD Amount')}:</strong> {currency(transaction.transaction_type === 'cash_in' ? transaction.usd_in : transaction.usd_out, 'USD')}</div>
            <div><strong>{t('Exchange Rate')}:</strong> {transaction.exchange_rate}</div>
            <div><strong>{t('Payment Method')}:</strong> {transaction.payment_method || 'cash'}</div>
            <div><strong>{t('Note')}:</strong> {transaction.note || '-'}</div>
          </div>
          <div className="signature-line" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', gap: '20px', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-soft)' }}>
            <div>{t('Prepared By')}</div>
            <div>{t('Received By')}</div>
          </div>
          <div className="signature-line" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', gap: '20px', fontSize: '0.85rem' }}>
            <div>____________________</div>
            <div>____________________</div>
          </div>
          <div className="signature-line" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', gap: '20px', fontSize: '0.85rem', color: 'var(--text-soft)' }}>
            <div>{t('Cashier')}</div>
            <div>{t('Manager')}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button className="primary-btn" onClick={onPrint}>{t('Print Receipt')}</button>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
