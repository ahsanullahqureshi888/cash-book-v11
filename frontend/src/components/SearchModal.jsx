import { useEffect, useRef, useState } from 'react';
import { Search, Users, ReceiptText, X } from 'lucide-react';
import { currency } from '../utils/format';

export default function SearchModal({ isOpen, onClose, accounts, transactions, setView, setSelectedAccount, setCashSearch }) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
    } else if (e.key === 'Escape') {
      onClose();
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

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-container" onClick={e => e.stopPropagation()}>
        <div className="search-modal-header">
          <Search size={20} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for ledgers, cashbook records..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={onClose} style={{ background: 'transparent', cursor: 'pointer', color: 'var(--text-soft)' }}>
            <X size={18} />
          </button>
        </div>
        
        <div className="search-modal-results">
          {query.trim() === '' ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.88rem' }}>
              Type to start searching accounts and transactions...
            </div>
          ) : totalResults.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.88rem' }}>
              No results found for "{query}"
            </div>
          ) : (
            <>
              {filteredAccounts.length > 0 && (
                <>
                  <div className="search-modal-section-title">Accounts / Ledgers</div>
                  {filteredAccounts.map((acc, i) => {
                    const globalIdx = i;
                    return (
                      <button
                        key={`acc-${acc.id}`}
                        className={`search-modal-item ${globalIdx === activeIndex ? 'active' : ''}`}
                        onClick={() => selectItem({ type: 'account', item: acc })}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                      >
                        <div>
                          <div className="search-modal-item-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={14} style={{ color: 'var(--accent)' }} /> {acc.name}
                          </div>
                          <div className="search-modal-item-subtitle">{acc.account_type}</div>
                        </div>
                        <div className="search-modal-item-meta">Ledger ↵</div>
                      </button>
                    );
                  })}
                </>
              )}

              {filteredTransactions.length > 0 && (
                <>
                  <div className="search-modal-section-title" style={{ marginTop: '8px' }}>Transactions</div>
                  {filteredTransactions.map((tx, i) => {
                    const globalIdx = filteredAccounts.length + i;
                    const isCashIn = tx.transaction_type === 'cash_in';
                    const amountStr = isCashIn 
                      ? `+${currency(tx.cash_in_afn || tx.usd_in * tx.exchange_rate)}`
                      : `-${currency(tx.cash_out_afn || tx.usd_out * tx.exchange_rate)}`;
                    return (
                      <button
                        key={`tx-${tx.id}`}
                        className={`search-modal-item ${globalIdx === activeIndex ? 'active' : ''}`}
                        onClick={() => selectItem({ type: 'transaction', item: tx })}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                      >
                        <div>
                          <div className="search-modal-item-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ReceiptText size={14} style={{ color: isCashIn ? 'var(--success)' : 'var(--danger)' }} />
                            <span>{tx.account_name}</span>
                          </div>
                          <div className="search-modal-item-subtitle">{tx.detail}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className={isCashIn ? 'balance-positive' : 'balance-negative'} style={{ fontWeight: '500', fontSize: '0.88rem' }}>
                            {amountStr}
                          </span>
                          <div className="search-modal-item-meta">Cashbook ↵</div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>

        <div className="search-modal-footer">
          <span>Search ledger accounts and transactions instantly</span>
          <div className="search-modal-footer-shortcuts">
            <span className="search-modal-footer-shortcut">
              <kbd>↑↓</kbd> Navigate
            </span>
            <span className="search-modal-footer-shortcut">
              <kbd>↵</kbd> Select
            </span>
            <span className="search-modal-footer-shortcut">
              <kbd>esc</kbd> Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
