import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Search, SlidersHorizontal, ArrowLeftRight, CalendarDays, Wallet, Hash, Printer, Download, Filter } from 'lucide-react';
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

  const afnBal = summary?.afn_balance || 0;
  const usdBal = summary?.usd_balance || 0;
  const monthNet = summary?.monthly_revenue || 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full pb-28 sm:pb-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60 dark:bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
              Professional Business Management
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>Cash Book</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              All Branches (Consolidated)
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Manage and track daily transactions with real-time financial balances
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button 
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-xs"
            onClick={props.onPrint}
          >
            <Printer size={15} />
            Print
          </button>
          <ExportButton
            path="/api/transactions/export"
            filename="cash-book-export.csv"
            label="Export CSV"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
          />
          <button
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-extrabold transition-all duration-200 shadow-sm ${
              activeTransactionType === 'cash_in'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/80'
            }`}
            onClick={() => setActiveTransactionType(activeTransactionType === 'cash_in' ? null : 'cash_in')}
          >
            <ArrowDownLeft size={15} /> Cash In
          </button>
          <button
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-extrabold transition-all duration-200 shadow-sm ${
              activeTransactionType === 'cash_out'
                ? 'bg-rose-600 text-white border-rose-600 shadow-rose-500/20'
                : 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/80'
            }`}
            onClick={() => setActiveTransactionType(activeTransactionType === 'cash_out' ? null : 'cash_out')}
          >
            <ArrowUpRight size={15} /> Cash Out
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* AFN Balance */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              AFN Balance
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-3">
            <strong className={`text-base sm:text-xl font-black font-mono truncate block ${afnBal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {currency(afnBal, 'AFN')}
            </strong>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 block">
              {afnBal >= 0 ? 'Net positive cash reserve' : 'Deficit balance'}
            </span>
          </div>
        </div>

        {/* USD Balance */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              USD Balance
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-3">
            <strong className={`text-base sm:text-xl font-black font-mono truncate block ${usdBal >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {currency(usdBal, 'USD')}
            </strong>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 block">
              Foreign currency reserve
            </span>
          </div>
        </div>

        {/* Today Card */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <CalendarDays size={15} className="text-amber-500" /> Today
            </div>
            <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              #{todayStats.count} TX
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <div className="flex flex-col">
              <span className="text-[9.5px] text-slate-400 dark:text-slate-500 uppercase font-bold">Cash In</span>
              <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">{currency(todayStats.cashIn)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9.5px] text-slate-400 dark:text-slate-500 uppercase font-bold">Cash Out</span>
              <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400 text-xs sm:text-sm">{currency(todayStats.cashOut)}</span>
            </div>
          </div>
        </div>

        {/* Month Net Card */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Month Net
            </span>
            <div className={`p-2 rounded-xl ${monthNet >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'}`}>
              <ArrowLeftRight size={16} />
            </div>
          </div>
          <div className="mt-3">
            <strong className={`text-base sm:text-xl font-black font-mono truncate block ${monthNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {currency(monthNet)}
            </strong>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 block">
              {monthNet >= 0 ? 'Positive net monthly cash flow' : 'Negative monthly net flow'}
            </span>
          </div>
        </div>
      </div>

      {/* Forms Area */}
      {activeTransactionType && (
        <section className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 transition-colors shadow-lg ${isCashIn ? 'border-emerald-500/30' : 'border-rose-500/30'}`}>
          <header className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                {isCashIn ? <ArrowDownLeft className="text-emerald-500" /> : <ArrowUpRight className="text-rose-500" />}
                {isCashIn ? 'Cash In Entry' : 'Cash Out Entry'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {isCashIn ? 'Record incoming AFN/USD funds with linked account details.' : 'Record outgoing funds, salary payments, and expense routing.'}
              </p>
            </div>
            <button 
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors"
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
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden flex flex-col border border-slate-200/90 dark:border-slate-800 shadow-sm">
        
        {/* Table Toolbar & Filters */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="search" 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-750 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all shadow-xs"
                placeholder="Search transactions, accounts, notes..."
                value={props.search}
                onChange={(e) => props.setSearch(e.target.value)}
              />
            </div>
            <button 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${showFilters ? 'bg-amber-500 text-white border-amber-500 shadow-amber-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">From Date</label>
                <DateField value={props.startDate} onChange={(e) => props.setStartDate(e.target.value)} displayFormat={props.dateDisplayFormat} className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-900 dark:text-slate-100" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Date</label>
                <DateField value={props.endDate} onChange={(e) => props.setEndDate(e.target.value)} displayFormat={props.dateDisplayFormat} className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-900 dark:text-slate-100" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</label>
                <select value={props.typeFilter} onChange={(e) => props.setTypeFilter(e.target.value)} className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="all">All Types</option>
                  <option value="cash_in">Cash In</option>
                  <option value="cash_out">Cash Out</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
                <select value={props.categoryFilter} onChange={(e) => props.setCategoryFilter(e.target.value)} className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500">
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
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account</label>
                <input type="text" value={props.accountFilter} onChange={(e) => props.setAccountFilter(e.target.value)} placeholder="Filter account..." className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="col-span-full flex justify-end mt-2">
                <button 
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-1.5"
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
          <div className="totals-footer border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 text-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Cash In</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-base font-extrabold">{props.totals.cashIn}</strong>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Cash Out</span>
              <strong className="text-rose-600 dark:text-rose-400 font-mono text-base font-extrabold">{props.totals.cashOut}</strong>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total USD In</span>
              <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-base font-extrabold">{props.totals.usdIn}</strong>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total USD Out</span>
              <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-base font-extrabold">{props.totals.usdOut}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
