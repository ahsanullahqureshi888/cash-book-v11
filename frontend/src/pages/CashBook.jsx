import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Search, SlidersHorizontal, ArrowLeftRight, CalendarDays, Wallet, Hash } from 'lucide-react';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';
import DateField from '../components/DateField';
import ExportButton from '../components/ExportButton';
import { currency } from '../utils/format';

export default function CashBook(props) {
  const { activeTransactionType, setActiveTransactionType, summary, transactions } = props;
  const isCashIn = activeTransactionType !== 'cash_out';
  const [showFilters, setShowFilters] = useState(false);

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTxs = (transactions || []).filter(t => (t.date || '').startsWith(today));
    
    let cashIn = 0;
    let cashOut = 0;
    todayTxs.forEach(t => {
      if (t.transaction_type === 'cash_in') cashIn += Number(t.cash_in_afn || 0);
      else if (t.transaction_type === 'cash_out') cashOut += Number(t.cash_out_afn || 0);
    });

    return {
      cashIn,
      cashOut,
      count: todayTxs.length
    };
  }, [transactions]);

  const activeFormProps = isCashIn
    ? {
      title: 'Cash In Entry',
      type: 'cash_in',
      form: props.cashInForm,
      setForm: props.setCashInForm,
      saving: props.savingType === 'cash_in',
      onSubmit: props.onCashInSubmit,
      onClear: props.onClearCashIn,
      message: props.cashInMessage,
      onAccountNameChange: props.onCashInAccountChange,
      onAccountSelect: props.onCashInAccountSelect
    }
    : {
      title: 'Cash Out Entry',
      type: 'cash_out',
      form: props.cashOutForm,
      setForm: props.setCashOutForm,
      saving: props.savingType === 'cash_out',
      onSubmit: props.onCashOutSubmit,
      onClear: props.onClearCashOut,
      message: props.cashOutMessage,
      selectedEmployee: props.selectedEmployee,
      selectedEmployeeSalary: props.selectedEmployeeSalary,
      onAccountNameChange: props.onCashOutAccountChange,
      onAccountSelect: props.onCashOutAccountSelect
    };

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Cash Book</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage and track daily transactions</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold transition-all shadow-sm"
            onClick={props.onPrint}
          >
            Print
          </button>
          <ExportButton
            path="/api/transactions/export"
            filename="cash-book-export.csv"
            label="Export CSV"
            className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold transition-all shadow-sm"
          />
          <button
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 shadow-sm ${
              activeTransactionType === 'cash_in'
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/40'
            }`}
            onClick={() => setActiveTransactionType(activeTransactionType === 'cash_in' ? null : 'cash_in')}
          >
            <ArrowDownLeft size={16} /> Cash In
          </button>
          <button
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 shadow-sm ${
              activeTransactionType === 'cash_out'
                ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-900/40'
            }`}
            onClick={() => setActiveTransactionType(activeTransactionType === 'cash_out' ? null : 'cash_out')}
          >
            <ArrowUpRight size={16} /> Cash Out
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border-emerald-200 dark:border-emerald-900/30">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Wallet size={14} className="text-emerald-500" /> AFN Balance
          </div>
          <strong className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
            {currency(summary?.afn_balance || 0, 'AFN')}
          </strong>
        </div>
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1 border-indigo-200 dark:border-indigo-900/30">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Wallet size={14} className="text-indigo-500" /> USD Balance
          </div>
          <strong className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
            {currency(summary?.usd_balance || 0, 'USD')}
          </strong>
        </div>
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <CalendarDays size={14} /> Today
            </div>
            <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Hash size={10} /> {todayStats.count} entries
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase">In</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{currency(todayStats.cashIn)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-zinc-500 uppercase">Out</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">{currency(todayStats.cashOut)}</span>
            </div>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-1">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ArrowLeftRight size={14} /> Month Net Movement
          </div>
          <strong className={`text-xl font-bold font-mono ${(summary?.afn_balance || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {currency(summary?.monthly_revenue || 0)}
          </strong>
        </div>
      </div>

      {/* Forms Area */}
      {activeTransactionType && (
        <section className={`glass-card p-6 rounded-2xl border-2 transition-colors ${isCashIn ? 'border-emerald-500/20 shadow-emerald-500/5' : 'border-rose-500/20 shadow-rose-500/5'}`}>
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                {isCashIn ? <ArrowDownLeft className="text-emerald-500" /> : <ArrowUpRight className="text-rose-500" />}
                {isCashIn ? 'Cash In Entry' : 'Cash Out Entry'}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {isCashIn ? 'Record incoming AFN/USD funds with linked account details.' : 'Record outgoing funds, salary payments, and expense routing.'}
              </p>
            </div>
            <button 
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-semibold"
              onClick={() => setActiveTransactionType(null)}
            >
              Close
            </button>
          </header>
          <TransactionForm
            {...activeFormProps}
            dateDisplayFormat={props.dateDisplayFormat}
            accounts={props.accounts}
            employees={props.employees}
            onQuickAddEmployee={props.onQuickAddEmployee}
            language={props.language}
          />
        </section>
      )}

      {/* Main Table Area */}
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col border border-white/20 dark:border-zinc-800/50">
        
        {/* Table Toolbar & Filters */}
        <div className="p-4 border-b border-white/10 dark:border-zinc-800/50 bg-white/30 dark:bg-black/10 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="search" 
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                placeholder="Search transactions..."
                value={props.search}
                onChange={(e) => props.setSearch(e.target.value)}
              />
            </div>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${showFilters ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-white/10 dark:border-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">From Date</label>
                <DateField value={props.startDate} onChange={(e) => props.setStartDate(e.target.value)} displayFormat={props.dateDisplayFormat} className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-lg text-sm px-3 py-2" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">To Date</label>
                <DateField value={props.endDate} onChange={(e) => props.setEndDate(e.target.value)} displayFormat={props.dateDisplayFormat} className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-lg text-sm px-3 py-2" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Type</label>
                <select value={props.typeFilter} onChange={(e) => props.setTypeFilter(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="all">All Types</option>
                  <option value="cash_in">Cash In</option>
                  <option value="cash_out">Cash Out</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Category</label>
                <select value={props.categoryFilter} onChange={(e) => props.setCategoryFilter(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="all">All Categories</option>
                  <option value="salary">Salary</option>
                  <option value="rent">Rent</option>
                  <option value="factory_expense">Factory Expense</option>
                  <option value="home_expense">Home Expense</option>
                  <option value="bottles_account">Bottles Account</option>
                  <option value="office_expense">Office Expense</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase">Account</label>
                <input type="text" value={props.accountFilter} onChange={(e) => props.setAccountFilter(e.target.value)} placeholder="Filter account..." className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-full flex justify-end mt-2">
                <button 
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors px-3 py-1.5"
                  type="button" 
                  onClick={props.onClearFilters}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table Content */}
        <TransactionTable 
          rows={props.rows} 
          rowOffset={props.rowOffset} 
          page={props.page} 
          pageCount={props.pageCount} 
          totalRows={props.totalRows} 
          dateDisplayFormat={props.dateDisplayFormat} 
          onPageChange={props.onPageChange} 
          onEdit={props.onEditTransaction} 
          onDelete={props.onDeleteTransaction} 
          onReceipt={props.onReceipt} 
          onToggleFullscreen={props.onToggleFullscreen} 
          fullscreen={props.fullscreen} 
          tableRef={props.tableRef} 
          isLoading={props.isLoading} 
        />
        
        {/* Table Footer Totals */}
        {!props.isLoading && props.rows.length > 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-xs font-semibold uppercase">Total Cash In</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{props.totals.cashIn}</strong>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 text-xs font-semibold uppercase">Total Cash Out</span>
              <strong className="text-rose-600 dark:text-rose-400 font-mono">{props.totals.cashOut}</strong>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 text-xs font-semibold uppercase">Total USD In</span>
              <strong className="text-zinc-700 dark:text-zinc-300 font-mono">{props.totals.usdIn}</strong>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-500 text-xs font-semibold uppercase">Total USD Out</span>
              <strong className="text-zinc-700 dark:text-zinc-300 font-mono">{props.totals.usdOut}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
