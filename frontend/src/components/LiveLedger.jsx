import React, { useState, useEffect } from 'react';
import { useTenant } from '../context/CompanyContext';
import { api } from '../services/api';
import LedgerHeader from './LedgerHeader';
import LedgerFilters from './LedgerFilters';
import MultiCurrencyModal from './MultiCurrencyModal';

export function LiveLedger() {
  const { activeCompany, activeBranch } = useTenant();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', account: 'ALL', dateRange: 'ALL_TIME' });
  const [isMultiCurrencyOpen, setIsMultiCurrencyOpen] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const txData = await api.getTransactions({
        branch: activeBranch,
        search: filters.search,
        account: filters.account,
        date_range: filters.dateRange
      });
      let filtered = txData || [];
      if (activeBranch && !activeBranch.startsWith('All')) {
        filtered = filtered.filter(t => t.branch_name === activeBranch || t.branch_id === activeBranch || t.branch === activeBranch);
      }
      if (filters.account && filters.account !== 'ALL') {
        filtered = filtered.filter(t => t.account_name === filters.account);
      }
      if (filters.search && filters.search.trim()) {
        const term = filters.search.toLowerCase();
        filtered = filtered.filter(t => (t.detail || '').toLowerCase().includes(term) || (t.account_name || '').toLowerCase().includes(term) || (t.note || '').toLowerCase().includes(term));
      }
      setTransactions(filtered);
    } catch (error) {
      console.error("Failed to fetch ledger:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [activeCompany?.id, activeBranch, filters]);

  return (
    <div className="space-y-4 mt-6">
      <LedgerHeader />
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1">
          <LedgerFilters onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} />
        </div>
        <button
          onClick={() => setIsMultiCurrencyOpen(true)}
          className="mb-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap"
        >
          + Multi-Currency Entry
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Live Ledger — {activeCompany?.name}</h3>
            <p className="text-xs text-slate-500">{transactions.length} records available in ledger</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">SN</th>
                <th className="p-3">Date</th>
                <th className="p-3">Ref / Account</th>
                <th className="p-3">Detail</th>
                <th className="p-3 text-right">Cash In ({activeCompany?.currency})</th>
                <th className="p-3 text-right">Cash Out ({activeCompany?.currency})</th>
                <th className="p-3 text-right">Type</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center p-6 text-slate-400">Loading records...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-6 text-slate-400">No transactions found for {activeCompany?.name}</td></tr>
              ) : (
                transactions.map((tx, index) => {
                  const isCashIn = tx.transaction_type === 'cash_in';
                  const amount = isCashIn ? (tx.usd_in || tx.cash_in_afn) : (tx.usd_out || tx.cash_out_afn);
                  return (
                    <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-xs text-slate-500">{index + 1}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{tx.date}</td>
                      <td className="p-3 font-medium text-blue-600 dark:text-blue-400">{tx.account_name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{tx.detail}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {isCashIn ? Number(amount || 0).toLocaleString() : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        {!isCashIn ? Number(amount || 0).toLocaleString() : '-'}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isCashIn ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'}`}>
                          {isCashIn ? 'CREDIT' : 'DEBIT'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MultiCurrencyModal
        isOpen={isMultiCurrencyOpen}
        onClose={() => setIsMultiCurrencyOpen(false)}
        onSuccess={fetchLedger}
      />
    </div>
  );
}

export default LiveLedger;
