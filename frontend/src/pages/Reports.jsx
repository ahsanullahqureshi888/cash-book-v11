/* eslint-disable */
import { useMemo } from 'react';
import { currency } from '../utils/format';
import { BarChart3, Download, FileText, Filter, Printer } from 'lucide-react';
import DateDisplay from '../components/DateDisplay';
import DateField from '../components/DateField';
import DataTable from '../components/DataTable';

export default function Reports({ mode, setMode, startDate, setStartDate, endDate, setEndDate, dateDisplayFormat, onRun, data, onPrint, onExport }) {
  const summary = data?.summary || data || {};
  const rows = data?.transactions || [];

  const columns = useMemo(() => [
    { key: 'index', label: 'SN', render: (row, i) => <span className="font-mono text-zinc-500 text-xs">{i + 1}</span>, className: 'w-12' },
    { key: 'date', label: 'Date', render: (row) => <DateDisplay value={row.date} format={dateDisplayFormat} />, className: 'w-24 whitespace-nowrap' },
    { key: 'transaction_no', label: 'TX No', render: (row) => <span className="text-zinc-500 text-xs font-mono">{row.transaction_no || '-'}</span>, className: 'w-20' },
    { key: 'account_name', label: 'Account', render: (row) => <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{row.account_name}</strong>, className: 'w-40' },
    { key: 'detail', label: 'Detail', render: (row) => <span className="text-zinc-600 dark:text-zinc-400 text-xs">{row.detail}</span>, className: 'min-w-[150px]' },
    { key: 'category', label: 'Category', render: (row) => <span className="inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{row.category}</span>, className: 'w-24' },
    { key: 'cash_in_afn', label: 'Cash In', render: (row) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{currency(row.cash_in_afn)}</span>, className: 'w-28 text-right' },
    { key: 'cash_out_afn', label: 'Cash Out', render: (row) => <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{currency(row.cash_out_afn)}</span>, className: 'w-28 text-right' }
  ], [dateDisplayFormat]);

  const headerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
          <FileText size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Report Transactions</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{rows.length} records found</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all" onClick={onPrint}>
          <Printer size={14} /> Print
        </button>
        <button className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all" onClick={onExport}>
          <Download size={14} /> JSON
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Reports & Analytics</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Daily, Monthly and Date Range Analysis</p>
        </div>
      </header>

      {/* Control Panel */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <Filter size={18} />
          <span className="text-sm font-semibold uppercase tracking-wider">Report Type</span>
        </div>
        
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value)}
          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-w-[200px]"
        >
          <option value="daily">Daily Report</option>
          <option value="monthly">Monthly Report</option>
          <option value="dateRange">Date Range Report</option>
          <option value="expenses">Expense Report</option>
        </select>

        {mode === 'dateRange' && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4">
            <DateField value={startDate} onChange={(e) => setStartDate(e.target.value)} displayFormat={dateDisplayFormat} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
            <span className="text-zinc-400">to</span>
            <DateField value={endDate} onChange={(e) => setEndDate(e.target.value)} displayFormat={dateDisplayFormat} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        )}

        <button 
          className="primary-btn ml-auto md:w-auto w-full py-2.5 px-6 shadow-md hover:shadow-lg flex items-center justify-center gap-2" 
          onClick={onRun}
        >
          <BarChart3 size={18} /> Run Report
        </button>
      </div>

      {/* Stats Summary */}
      {(summary.cash_in_afn !== undefined || summary.cash_out_afn !== undefined) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500 flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Cash In (AFN)</span>
            <strong className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{currency(summary.cash_in_afn)}</strong>
          </div>
          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-rose-500 flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Cash Out (AFN)</span>
            <strong className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">{currency(summary.cash_out_afn)}</strong>
          </div>
          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-indigo-500 flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Net AFN Balance</span>
            <strong className={`text-xl font-bold font-mono ${summary.afn_balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>{currency(summary.afn_balance)}</strong>
          </div>
          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-blue-500 flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Net USD Balance</span>
            <strong className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{currency(summary.usd_balance, 'USD')}</strong>
          </div>
        </div>
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={rows}
        keyField="id"
        headerContent={headerContent}
        emptyTitle="No transactions in this report"
        emptyDescription="Run a report to see transaction rows here."
      />
    </div>
  );
}
