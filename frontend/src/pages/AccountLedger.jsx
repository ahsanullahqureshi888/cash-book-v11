import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  Search,
  Plus,
  Filter,
  Users,
  Printer,
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  Scale,
  X,
  Building2,
  User,
  RotateCcw
} from 'lucide-react';
import LedgerTable from '../components/LedgerTable';

export default function AccountLedger(props) {
  const visibleAccounts = props.accounts || [];

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('all');

  // Filter rows based on date range & currency
  const filteredRows = useMemo(() => {
    let list = props.rows || [];
    if (fromDate) {
      list = list.filter((r) => r.isOpeningBalance || (r.date && r.date >= fromDate));
    }
    if (toDate) {
      list = list.filter((r) => r.isOpeningBalance || (r.date && r.date <= toDate));
    }
    if (currencyFilter === 'afn') {
      list = list.filter((r) => r.isOpeningBalance || (r.cash_in_afn > 0 || r.cash_out_afn > 0));
    } else if (currencyFilter === 'usd') {
      list = list.filter((r) => r.isOpeningBalance || (r.usd_in > 0 || r.usd_out > 0));
    }
    return list;
  }, [props.rows, fromDate, toDate, currencyFilter]);

  const hasFilters = Boolean(fromDate || toDate || currencyFilter !== 'all');

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setCurrencyFilter('all');
  };

  return (
    <div className="account-ledger-page space-y-6">
      {/* 1. PAGE HEADER */}
      <header className="account-ledger-header flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Ledger</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {visibleAccounts.length} {visibleAccounts.length === 1 ? 'Account' : 'Accounts'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage customer, vendor, and company account statements and running balances
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-2"
            onClick={props.onPrint}
          >
            <Printer size={15} />
            <span>Print Ledger</span>
          </button>
          <button
            type="button"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            onClick={props.onExport}
          >
            <Download size={15} />
            <span>Export Ledger</span>
          </button>
        </div>
      </header>

      {/* 2. TWO-COLUMN RESPONSIVE LAYOUT */}
      <div className="account-ledger-layout grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Accounts Sidebar */}
        <aside className="ledger-left-panel lg:col-span-4 xl:col-span-3 space-y-4">
          
          {/* Collapsible Create Account Card */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Plus size={15} className="text-amber-500" />
                <span>Create New Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                {showCreateForm ? 'Hide' : '+ Add'}
              </button>
            </div>

            {showCreateForm && (
              <form className="create-account-form mt-4 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800" onSubmit={props.onCreateAccount}>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={props.accountName}
                    onChange={(e) => props.setAccountName(e.target.value)}
                    placeholder="Customer / Company Name"
                    required
                    dir="auto"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Opening Balance (AFN)
                  </label>
                  <input
                    type="number"
                    value={props.openingBalance}
                    onChange={(e) => props.setOpeningBalance(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all"
                >
                  Save Account
                </button>
              </form>
            )}
          </div>

          {/* Search + Accounts List Card */}
          <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col max-h-[640px]">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  value={props.search}
                  onChange={(e) => props.setSearch(e.target.value)}
                  placeholder="Search accounts..."
                  className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-all"
                />
                {props.search && (
                  <button
                    type="button"
                    onClick={() => props.setSearch('')}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-100/60 dark:divide-slate-800/40 max-h-[560px]">
              {!visibleAccounts.length ? (
                <div className="py-10 px-4 text-center text-slate-400 space-y-2">
                  <Users className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-xs font-semibold">No accounts found</p>
                </div>
              ) : (
                visibleAccounts.map((account) => {
                  const isActive = account.name === props.selectedAccountName;
                  const bal = Number(account.balance || account.opening_balance_afn || 0);
                  const isNegative = bal < 0;

                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => props.onSelectAccount(account)}
                      className={`w-full p-3 text-left rounded-xl transition-all flex items-center justify-between gap-2 border ${
                        isActive
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 dark:border-amber-500/40 shadow-xs'
                          : 'bg-transparent border-transparent hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {account.account_type === 'company' || account.account_type === 'factory' ? (
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <strong className={`text-xs font-bold truncate block ${isActive ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-white'}`}>
                            {account.name}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-sans">Balance:</span>
                          <span className={`font-bold ${isNegative ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            AFN {bal.toLocaleString('en-US')}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={15} className={`shrink-0 transition-transform ${isActive ? 'text-amber-500 translate-x-0.5' : 'text-slate-400'}`} />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Ledger Details & Table */}
        <main className="ledger-right-panel lg:col-span-8 xl:col-span-9 space-y-5 min-w-0">
          <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm space-y-4">
            
            {/* LEDGER SUMMARY HEADER & STATS */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {props.selectedAccountName ? `${props.selectedAccountName} Statement` : 'Account Ledger Statement'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time transaction history and running financial balance
                  </p>
                </div>
                {props.selectedAccountName && (
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Account
                  </span>
                )}
              </div>
              
              {/* 4 STAT CARDS IN 1 ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Opening Balance */}
                <div className="p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Opening Balance</span>
                    <Wallet className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    {props.ledgerSummary?.opening || 'AFN 0.00'}
                  </div>
                </div>

                {/* Total Cash In (Debit) */}
                <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Debit (In)</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-base font-extrabold font-mono text-emerald-700 dark:text-emerald-300">
                    {props.ledgerSummary?.debit || 'AFN 0.00'}
                  </div>
                </div>

                {/* Total Cash Out (Credit) */}
                <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/60 dark:border-rose-800/40 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-rose-700 dark:text-rose-300">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Credit (Out)</span>
                    <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div className="text-base font-extrabold font-mono text-rose-700 dark:text-rose-300">
                    {props.ledgerSummary?.credit || 'AFN 0.00'}
                  </div>
                </div>

                {/* Final Balance */}
                <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-300/60 dark:border-amber-700/60 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Final Net Balance</span>
                    <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-base font-black font-mono text-amber-900 dark:text-amber-200">
                    {props.ledgerSummary?.final || 'AFN 0.00'}
                  </div>
                </div>
              </div>
            </div>

            {/* FILTER TOOLBAR */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Filter size={13} className="text-slate-500" />
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Filters:</span>
                </div>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  title="From Date"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  title="To Date"
                />

                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                  aria-label="Filter by currency"
                >
                  <option value="all">All Currencies</option>
                  <option value="afn">AFN Transactions</option>
                  <option value="usd">USD Transactions</option>
                </select>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                )}
              </div>
            </div>

            {/* LEDGER TABLE AREA */}
            <div className="p-5 pt-1">
              {props.selectedAccountName ? (
                <LedgerTable
                  rows={filteredRows}
                  dateDisplayFormat={props.dateDisplayFormat}
                  onReceipt={props.onReceipt}
                />
              ) : (
                <div className="py-20 text-center text-slate-400 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Users size={28} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Account Selected</h4>
                  <p className="text-xs max-w-sm mx-auto text-slate-500 dark:text-slate-400">
                    Select an account from the left list to view its complete ledger history and transactions.
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}

