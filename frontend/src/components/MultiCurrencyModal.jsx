import React, { useState, useEffect } from 'react';
import { useTenant } from '../context/CompanyContext';
import { api } from '../services/api';

export function MultiCurrencyModal({ isOpen, onClose, onSuccess }) {
  const { activeCompany, activeBranch } = useTenant();
  const accounts = activeCompany?.accounts || ['Export Account', 'Import Account', 'Demurrage Account', 'General Ledger'];

  const [account, setAccount] = useState(accounts[0] || '');
  const [primaryAmount, setPrimaryAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(activeCompany?.currency === 'AFN' ? 70.50 : 1.0);
  const [foreignAmount, setForeignAmount] = useState('0.00');
  const [type, setType] = useState('CREDIT');
  const [detail, setDetail] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically compute foreign currency conversion (e.g., AFN <-> USD)
  useEffect(() => {
    const val = parseFloat(primaryAmount) || 0;
    const rate = parseFloat(exchangeRate) || 1;
    if (activeCompany?.currency === 'AFN') {
      setForeignAmount((val / rate).toFixed(2));
    } else {
      setForeignAmount((val * rate).toFixed(2));
    }
  }, [primaryAmount, exchangeRate, activeCompany?.currency]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isCredit = type === 'CREDIT';
      const numPrimary = parseFloat(primaryAmount) || 0;
      const numForeign = parseFloat(foreignAmount) || 0;
      const isAfn = activeCompany?.currency === 'AFN';

      await api.createTransaction({
        account_name: account,
        detail: detail || 'Multi-currency transaction',
        note: note || '',
        transaction_type: isCredit ? 'cash_in' : 'cash_out',
        cash_in_afn: isCredit && isAfn ? numPrimary : (isCredit ? numForeign : 0),
        cash_out_afn: !isCredit && isAfn ? numPrimary : (!isCredit ? numForeign : 0),
        usd_in: isCredit && !isAfn ? numPrimary : (isCredit ? numForeign : 0),
        usd_out: !isCredit && !isAfn ? numPrimary : (!isCredit ? numForeign : 0),
        exchange_rate: parseFloat(exchangeRate) || 64.3,
        payment_method: 'cash',
        category: 'other',
        date: new Date().toISOString().slice(0, 10),
        company_id: activeCompany?.id || 'cashbook_bawar_prod',
        branch_name: activeBranch || 'Main Branch'
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Dual currency transaction failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Currency Entry</h3>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{activeCompany?.name} • {activeBranch}</span>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType('CREDIT')}
              className={`px-3 py-1 text-xs font-bold rounded-md ${type === 'CREDIT' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Cash In
            </button>
            <button
              type="button"
              onClick={() => setType('DEBIT')}
              className={`px-3 py-1 text-xs font-bold rounded-md ${type === 'DEBIT' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Cash Out
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              >
                {accounts.map((acc) => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Exchange Rate</label>
              <input
                type="number"
                step="0.001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase mb-1">Amount ({activeCompany?.currency || 'AFN'})</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={primaryAmount}
                onChange={(e) => setPrimaryAmount(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-base font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Equivalent ({activeCompany?.currency === 'AFN' ? 'USD' : 'AFN'})
              </label>
              <div className="w-full p-2 bg-slate-200/60 dark:bg-slate-700/60 border border-transparent rounded-lg text-base font-mono font-bold text-slate-700 dark:text-slate-200 flex items-center h-[42px]">
                {foreignAmount}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g., Currency conversion for customs clearing"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Internal Note (Optional)</label>
            <input
              type="text"
              placeholder="Add audit reference or invoice #..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              {isSubmitting ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MultiCurrencyModal;
