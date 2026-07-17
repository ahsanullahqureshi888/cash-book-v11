import { ChevronRight, Search, Plus, Filter, Users } from 'lucide-react';
import LedgerTable from '../components/LedgerTable';

export default function AccountLedger(props) {
  const visibleAccounts = props.accounts || [];

  return (
    <div className="flex flex-col gap-6 w-full pb-8 h-[calc(100vh-100px)]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Account Ledger</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage customer and company ledgers</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold transition-all shadow-sm"
            onClick={props.onPrint}
          >
            Print Ledger
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-600 rounded-xl text-sm font-semibold transition-all shadow-sm"
            onClick={props.onExport}
          >
            Export Ledger
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        
        {/* Left Panel: Accounts List */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 overflow-hidden">
          {/* Create Account Card */}
          <div className="glass-card p-4 rounded-2xl border border-white/20 dark:border-zinc-800/50 shrink-0">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              <Plus size={16} className="text-indigo-500" /> Create Account
            </h3>
            <form className="flex flex-col gap-3" onSubmit={props.onCreateAccount}>
              <input 
                type="text" 
                value={props.accountName} 
                onChange={(e) => props.setAccountName(e.target.value)} 
                placeholder="Customer / Company Name" 
                required 
                dir="auto" 
                className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input 
                type="number" 
                value={props.openingBalance} 
                onChange={(e) => props.setOpeningBalance(e.target.value)} 
                placeholder="Opening Balance AFN" 
                step="0.01" 
                className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="primary-btn w-full mt-1" type="submit">Add Account</button>
            </form>
          </div>

          {/* Search & List */}
          <div className="glass-card flex flex-col flex-1 rounded-2xl border border-white/20 dark:border-zinc-800/50 overflow-hidden">
            <div className="p-4 border-b border-white/10 dark:border-zinc-800/50 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="search" 
                  value={props.search} 
                  onChange={(e) => props.setSearch(e.target.value)} 
                  placeholder="Search accounts..." 
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {!visibleAccounts.length && (
                <div className="p-8 flex flex-col items-center justify-center text-center text-zinc-500 dark:text-zinc-400">
                  <Users size={32} className="mb-2 opacity-50" />
                  <span className="text-sm">No accounts found.</span>
                </div>
              )}
              {visibleAccounts.map((account) => {
                const isActive = account.name === props.selectedAccountName;
                return (
                  <button
                    key={account.id}
                    onClick={() => props.onSelectAccount(account)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl mb-1 text-left transition-all ${
                      isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 border shadow-sm' 
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex flex-col overflow-hidden">
                      <strong className={`truncate text-sm ${isActive ? 'text-indigo-700 dark:text-indigo-300 font-bold' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {account.name}
                      </strong>
                      <span className={`text-xs font-mono mt-0.5 ${isActive ? 'text-indigo-600/80 dark:text-indigo-400/80' : 'text-zinc-500'}`}>
                        AFN {Number(account.balance || account.opening_balance_afn || 0).toLocaleString('en-US')}
                      </span>
                    </div>
                    <ChevronRight size={16} className={isActive ? 'text-indigo-500' : 'text-zinc-300 dark:text-zinc-600'} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Ledger details */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="glass-card flex flex-col h-full rounded-2xl border border-white/20 dark:border-zinc-800/50 overflow-hidden">
            {/* Ledger Summary Header */}
            <div className="p-5 border-b border-white/10 dark:border-zinc-800/50 bg-white/30 dark:bg-black/10 shrink-0">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                {props.ledgerTitle}
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col bg-white/50 dark:bg-zinc-900/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Opening Balance</span>
                  <span className="font-mono text-zinc-900 dark:text-white font-semibold mt-1 text-sm">{props.ledgerSummary?.opening || '-'}</span>
                </div>
                <div className="flex flex-col bg-white/50 dark:bg-zinc-900/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Debit</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-1 text-sm">{props.ledgerSummary?.debit || '-'}</span>
                </div>
                <div className="flex flex-col bg-white/50 dark:bg-zinc-900/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Credit</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold mt-1 text-sm">{props.ledgerSummary?.credit || '-'}</span>
                </div>
                <div className="flex flex-col bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900/30">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">Final Balance</span>
                  <span className="font-mono text-indigo-700 dark:text-indigo-300 font-bold mt-1 text-base">{props.ledgerSummary?.final || '-'}</span>
                </div>
              </div>
            </div>
            
            {/* Filters Toolbar Placeholder */}
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center gap-3 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/30 overflow-x-auto">
               <button className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700">
                 <Filter size={14} /> Filter Dates
               </button>
               {/* Placeholders for requested filters that aren't wired up yet */}
               <select className="text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 outline-none text-zinc-600 dark:text-zinc-300">
                 <option value="all">All Branches</option>
               </select>
               <select className="text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 outline-none text-zinc-600 dark:text-zinc-300">
                 <option value="all">All Currencies</option>
               </select>
            </div>

            {/* Ledger Table */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
              {props.selectedAccountName ? (
                <LedgerTable 
                  rows={props.rows} 
                  dateDisplayFormat={props.dateDisplayFormat} 
                  onReceipt={props.onReceipt} 
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-zinc-500 dark:text-zinc-400">
                  <div className="w-16 h-16 mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Users size={24} className="opacity-50" />
                  </div>
                  <h4 className="text-zinc-900 dark:text-zinc-100 font-semibold mb-1">No Account Selected</h4>
                  <p className="text-sm max-w-sm">Select an account from the left panel to view its complete ledger history.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
