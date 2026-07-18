import { useEffect, useRef, useState } from 'react';
import { Search, Users, ReceiptText } from 'lucide-react';
import { currency } from '../utils/format';
import BaseModal from './BaseModal';
import { useTranslation } from 'react-i18next';

export default function SearchModal({ isOpen, onClose, accounts = [], transactions = [], setView, setSelectedAccount, setCashSearch }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Filter accounts
  const filteredAccounts = query.trim() === '' ? [] : accounts.filter(acc => 
    acc.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  // Filter transactions
  const filteredTransactions = query.trim() === '' ? [] : transactions.filter(tx => 
    String(tx.transaction_no || '').toLowerCase().includes(query.toLowerCase()) ||
    String(tx.detail || '').toLowerCase().includes(query.toLowerCase()) ||
    String(tx.account_name || '').toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const totalResults = [
    ...filteredAccounts.map(a => ({ type: 'account', item: a })), 
    ...filteredTransactions.map(t => ({ type: 'transaction', item: t }))
  ];

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, totalResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (totalResults[activeIndex]) {
        selectItem(totalResults[activeIndex]);
      }
    }
  };

  const selectItem = (result) => {
    if (result.type === 'account') {
      setSelectedAccount(result.item);
      setView('ledger');
    } else {
      setCashSearch(result.item.transaction_no || '');
      setView('cashbook');
    }
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Search Workspace') || 'Search Workspace'}
      maxWidth="600px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 14px', background: 'var(--surface-hover)' }}>
          <Search size={20} style={{ color: 'var(--text-soft)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('Search for ledgers, cashbook records...') || 'Search for ledgers, cashbook records...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, color: 'var(--text)', fontSize: '0.95rem' }}
          />
        </div>
        
        <div className="search-modal-results" style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {query.trim() === '' ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.88rem' }}>
              {t('Type to start searching accounts and transactions...') || 'Type to start searching accounts and transactions...'}
            </div>
          ) : totalResults.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.88rem' }}>
              {t('No results found for') || 'No results found for'} "{query}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredAccounts.length > 0 && (
                <>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-soft)', padding: '6px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('Accounts / Ledgers') || 'Accounts / Ledgers'}
                  </div>
                  {filteredAccounts.map((acc, i) => {
                    const globalIdx = i;
                    return (
                      <button
                        type="button"
                        key={`acc-${acc.id}`}
                        className={`search-modal-item ${globalIdx === activeIndex ? 'active' : ''}`}
                        onClick={() => selectItem({ type: 'account', item: acc })}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 12px', borderRadius: '10px', background: globalIdx === activeIndex ? 'var(--surface-hover)' : 'transparent',
                          border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--text)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '0.9rem' }}>
                            <Users size={14} style={{ color: 'var(--accent)' }} /> {acc.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginLeft: '22px' }}>{acc.account_type}</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>Ledger ↵</div>
                      </button>
                    );
                  })}
                </>
              )}

              {filteredTransactions.length > 0 && (
                <>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-soft)', padding: '6px 8px', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '12px' }}>
                    {t('Transactions') || 'Transactions'}
                  </div>
                  {filteredTransactions.map((tx, i) => {
                    const globalIdx = filteredAccounts.length + i;
                    const isCashIn = tx.transaction_type === 'cash_in';
                    const amountStr = isCashIn 
                      ? `+${currency(tx.cash_in_afn || tx.usd_in * tx.exchange_rate)}`
                      : `-${currency(tx.cash_out_afn || tx.usd_out * tx.exchange_rate)}`;
                    return (
                      <button
                        type="button"
                        key={`tx-${tx.id}`}
                        className={`search-modal-item ${globalIdx === activeIndex ? 'active' : ''}`}
                        onClick={() => selectItem({ type: 'transaction', item: tx })}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 12px', borderRadius: '10px', background: globalIdx === activeIndex ? 'var(--surface-hover)' : 'transparent',
                          border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--text)'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '0.9rem' }}>
                            <ReceiptText size={14} style={{ color: isCashIn ? 'var(--success)' : 'var(--danger)' }} />
                            <span>{tx.account_name}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginLeft: '22px' }}>{tx.detail}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className={isCashIn ? 'balance-positive' : 'balance-negative'} style={{ fontWeight: '500', fontSize: '0.88rem' }}>
                            {amountStr}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>Cashbook ↵</div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-soft)' }}>
          <span>{t('Search ledger accounts and transactions instantly') || 'Search ledger accounts and transactions instantly'}</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span><kbd style={{ padding: '2px 4px', background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '4px' }}>↑↓</kbd> {t('Navigate') || 'Navigate'}</span>
            <span><kbd style={{ padding: '2px 4px', background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '4px' }}>↵</kbd> {t('Select') || 'Select'}</span>
            <span><kbd style={{ padding: '2px 4px', background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '4px' }}>esc</kbd> {t('Close') || 'Close'}</span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
