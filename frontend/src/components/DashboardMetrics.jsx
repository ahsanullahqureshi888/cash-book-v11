import React, { useEffect, useState } from 'react';
import { useTenant } from '../context/CompanyContext';
import { api } from '../services/api';

export function DashboardMetrics() {
  const { activeCompany } = useTenant();
  const [metrics, setMetrics] = useState({
    afnBalance: 0,
    usdBalance: 0,
    todayTxCount: 0,
    cashIn: 0,
    cashOut: 0,
    monthNet: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const summaryData = await api.getSummary();
        setMetrics({
          afnBalance: summaryData?.afn_balance || 0,
          usdBalance: summaryData?.usd_balance || 0,
          todayTxCount: summaryData?.today_transactions || 0,
          cashIn: summaryData?.cash_in_afn || 0,
          cashOut: summaryData?.cash_out_afn || 0,
          monthNet: (summaryData?.cash_in_afn || 0) - (summaryData?.cash_out_afn || 0)
        });
      } catch (error) {
        console.error("Failed to load metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [activeCompany?.id]);

  if (loading) return <div className="p-4 text-xs font-semibold text-slate-400">Loading balances...</div>;

  const isUsdPrimary = activeCompany?.currency === 'USD';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
      {/* Primary Balance Card */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          {activeCompany?.currency || 'AFN'} Balance
        </span>
        <h2 className="text-2xl font-extrabold mt-1 text-slate-900 dark:text-white font-mono">
          {activeCompany?.currency} {isUsdPrimary ? metrics.usdBalance.toLocaleString() : metrics.afnBalance.toLocaleString()}
        </h2>
        <span className="text-xs text-slate-400 mt-1 block">Active reserve</span>
      </div>

      {/* Today's Activity */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today</span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-700 dark:text-slate-300">
            #{metrics.todayTxCount} TX
          </span>
        </div>
        <div className="flex justify-between mt-3 text-sm font-bold font-mono">
          <span className="text-emerald-600 dark:text-emerald-400">In: {metrics.cashIn.toLocaleString()}</span>
          <span className="text-rose-600 dark:text-rose-400">Out: {metrics.cashOut.toLocaleString()}</span>
        </div>
      </div>

      {/* Monthly Net Flow */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Month Net</span>
        <h3 className={`text-xl font-extrabold mt-1 font-mono ${metrics.monthNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {activeCompany?.currency} {metrics.monthNet.toLocaleString()}
        </h3>
        <span className="text-xs text-slate-400 mt-1 block">Net cash flow</span>
      </div>
    </div>
  );
}

export default DashboardMetrics;
