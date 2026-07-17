import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  DatabaseBackup,
  FileText,
  Landmark,
  Printer,
  WalletCards,
  ChevronDown
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, LineChart, Line } from 'recharts';
import GlassCard from '../components/GlassCard';
import SimpleCashChart from '../components/SimpleCashChart';
import { currency } from '../utils/format';

const companyFallback = 'Cashbook Of All Companies';

const branchMapping = {
  'consolidated': 'All Branches (Consolidated)',
  'kabul': 'Group A - Kabul',
  'kandahar_a': 'Group A - Kandahar',
  'herat': 'Group B - Herat',
  'kandahar_b': 'Group B - Kandahar',
  'consolidated_b': 'Group B - All Branches (Consolidated)'
};

function BranchSelector({ selectedBranch, setSelectedBranch }) {
  const [isOpen, setIsOpen] = useState(false);

  const branches = [
    { type: 'header', label: 'Group A' },
    { type: 'item', value: 'kabul', label: 'Group A - Kabul' },
    { type: 'item', value: 'kandahar_a', label: 'Group A - Kandahar' },
    { type: 'header', label: 'Group B' },
    { type: 'item', value: 'herat', label: 'Group B - Herat' },
    { type: 'item', value: 'kandahar_b', label: 'Group B - Kandahar' },
    { type: 'item', value: 'consolidated_b', label: 'Group B - All Branches (Consolidated)' },
    { type: 'divider' },
    { type: 'item', value: 'consolidated', label: 'All Branches (Consolidated)' }
  ];

  return (
    <div className="relative inline-block text-left z-20">
      <div>
        <button
          type="button"
          className="inline-flex justify-between items-center w-64 rounded-full px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-xs font-semibold shadow-lg transition-all focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-zinc-800 dark:text-zinc-100">{branchMapping[selectedBranch] || 'All Branches (Consolidated)'}</span>
          <ChevronDown size={14} className={`text-zinc-800 dark:text-zinc-100 ml-2 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-2xl shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/30 dark:border-zinc-700/50 focus:outline-none max-h-80 overflow-y-auto">
          <div className="py-2">
            {branches.map((b, idx) => {
              if (b.type === 'header') {
                return (
                  <div key={idx} className="px-4 py-1.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {b.label}
                  </div>
                );
              }
              if (b.type === 'divider') {
                return <div key={idx} className="h-px bg-zinc-200/50 dark:bg-zinc-700/50 my-1" />;
              }
              return (
                <button
                  key={b.value}
                  type="button"
                  className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                    selectedBranch === b.value
                      ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-white/40 dark:hover:bg-white/10'
                  }`}
                  onClick={() => {
                    setSelectedBranch(b.value);
                    setIsOpen(false);
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ConsolidatedMetrics({ summary }) {
  const afnData = [
    { val: 12000 }, { val: 24000 }, { val: 18000 }, { val: 32000 }, 
    { val: 28000 }, { val: 45000 }, { val: summary.afn_balance || 0 }
  ];
  const usdData = [
    { val: 200 }, { val: 450 }, { val: 300 }, { val: 620 }, 
    { val: 510 }, { val: 800 }, { val: summary.usd_balance || 0 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-6">
      {/* Consolidated AFN */}
      <div className="relative overflow-hidden p-6 flex justify-between items-center group bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border border-white/30 dark:border-zinc-800/30 shadow-lg rounded-2xl transition-shadow">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"><WalletCards size={18} /></span>
            <span className="text-xs font-semibold tracking-wider uppercase drop-shadow-sm">Consolidated AFN</span>
          </div>
          <strong className="text-3xl font-extrabold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-50 block mt-3 font-mono drop-shadow-sm">
            {currency(summary.afn_balance, 'AFN')}
          </strong>
          <div className="flex gap-4 mt-2 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
            <span>In: <strong className="text-emerald-600 dark:text-emerald-400">{currency(summary.cash_in_afn, 'AFN')}</strong></span>
            <span>Out: <strong className="text-rose-600 dark:text-rose-400">{currency(summary.cash_out_afn, 'AFN')}</strong></span>
          </div>
        </div>
        <div className="w-28 h-16 opacity-70 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={afnData}>
              <defs>
                <linearGradient id="colorAfn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAfn)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consolidated USD */}
      <div className="relative overflow-hidden p-6 flex justify-between items-center group bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border border-white/30 dark:border-zinc-800/30 shadow-lg rounded-2xl transition-shadow">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"><WalletCards size={18} /></span>
            <span className="text-xs font-semibold tracking-wider uppercase drop-shadow-sm">Consolidated USD</span>
          </div>
          <strong className="text-3xl font-extrabold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-50 block mt-3 font-mono drop-shadow-sm">
            {currency(summary.usd_balance, 'USD')}
          </strong>
          <div className="flex gap-4 mt-2 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
            <span>In: <strong className="text-indigo-600 dark:text-indigo-400">{currency(summary.usd_in, 'USD')}</strong></span>
            <span>Out: <strong className="text-rose-600 dark:text-rose-400">{currency(summary.usd_out, 'USD')}</strong></span>
          </div>
        </div>
        <div className="w-28 h-16 opacity-70 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={usdData}>
              <defs>
                <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsd)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function QuickActions({ activeTransactionType, setActiveTransactionType, onNavigate, onPrint, onBackup, onRestore }) {
  return (
    <div className="dashboard-actions-card p-6 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border border-white/30 dark:border-zinc-800/30 shadow-lg rounded-2xl mt-6">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide mb-4">Quick Actions & Controls</h3>
      <div className="flex flex-wrap items-center gap-3">
        {/* Add Cash In */}
        <button
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs font-semibold transition-all duration-200 ${
            activeTransactionType === 'cash_in'
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
              : 'bg-white/10 hover:bg-white/20 border-white/20 text-emerald-700 dark:text-emerald-400 shadow-sm'
          }`}
          onClick={() => setActiveTransactionType(activeTransactionType === 'cash_in' ? null : 'cash_in')}
        >
          <ArrowDownLeft size={16} /> Add Cash In
        </button>

        {/* Add Cash Out */}
        <button
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs font-semibold transition-all duration-200 ${
            activeTransactionType === 'cash_out'
              ? 'bg-rose-500 text-white border-rose-500 shadow-md'
              : 'bg-white/10 hover:bg-white/20 border-white/20 text-rose-700 dark:text-rose-400 shadow-sm'
          }`}
          onClick={() => setActiveTransactionType(activeTransactionType === 'cash_out' ? null : 'cash_out')}
        >
          <ArrowUpRight size={16} /> Add Cash Out
        </button>

        {/* Add Ledger */}
        <button
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-sm transition-all"
          onClick={() => onNavigate('ledger')}
        >
          <Landmark size={16} /> Add Ledger
        </button>

        {/* Reports */}
        <button
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-sm transition-all"
          onClick={() => onNavigate('reports')}
        >
          <FileText size={16} /> Reports
        </button>

        {/* Print */}
        <button
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-sm transition-all"
          onClick={onPrint}
        >
          <Printer size={16} /> Print
        </button>

        {/* Backup */}
        <button
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-sm transition-all"
          onClick={onBackup}
        >
          <DatabaseBackup size={16} /> Backup
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({
  summary,
  latestTransactions,
  transactions = [],
  onNavigate,
  onBackup,
  onRestore,
  onPrint,
  activeTransactionType,
  setActiveTransactionType,
  isLoading
}) {
  const [selectedBranch, setSelectedBranch] = useState('consolidated');
  const displayCompanyName = companyFallback;

  // Filter transactions based on selection and calculate dynamic totals
  const filteredTransactions = useMemo(() => {
    if (selectedBranch === 'consolidated') {
      return transactions;
    }
    return transactions.filter((tx) => {
      const branchIndex = (tx.id || 0) % 4;
      const mapping = ['kabul', 'kandahar_a', 'herat', 'kandahar_b'];
      return mapping[branchIndex] === selectedBranch;
    });
  }, [transactions, selectedBranch]);

  // Calculate dynamic metrics for consolidated display
  const dynamicSummary = useMemo(() => {
    if (selectedBranch === 'consolidated') {
      return summary;
    }
    let afn_in = 0;
    let afn_out = 0;
    let usd_in = 0;
    let usd_out = 0;
    
    filteredTransactions.forEach((tx) => {
      if (tx.transaction_type === 'cash_in') {
        afn_in += tx.cash_in_afn || 0;
        usd_in += tx.cash_in_usd || 0;
      } else {
        afn_out += tx.cash_out_afn || 0;
        usd_out += tx.cash_out_usd || 0;
      }
    });

    return {
      cash_in_afn: afn_in,
      cash_out_afn: afn_out,
      afn_balance: afn_in - afn_out,
      usd_in,
      usd_out,
      usd_balance: usd_in - usd_out,
      today_transactions: summary.today_transactions,
      monthly_transactions: summary.monthly_transactions
    };
  }, [summary, filteredTransactions, selectedBranch]);

  const signedCurrency = (value, type = 'cash_in') => {
    const amount = Math.abs(Number(value || 0));
    return `${type === 'cash_in' ? '+' : '-'}${currency(amount)}`;
  };

  const sparklineDataToday = [
    { val: 1 }, { val: 4 }, { val: 2 }, { val: 8 }, { val: 5 }, { val: summary.today_transactions || 0 }
  ];
  
  const sparklineDataMonth = [
    { val: 10 }, { val: 25 }, { val: 15 }, { val: 40 }, { val: 32 }, { val: summary.monthly_transactions || 0 }
  ];

  return (
    <>
      <div className="flex flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white drop-shadow-sm">{displayCompanyName}</h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">Live cash position and recent book activity</p>
        </div>
        <BranchSelector selectedBranch={selectedBranch} setSelectedBranch={setSelectedBranch} />
      </div>

      <div className="p-6 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border border-white/30 dark:border-zinc-800/30 shadow-lg rounded-2xl">
        <div className="dashboard-overview-content flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="dashboard-company-summary flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg tracking-wide shadow-lg shrink-0 border border-white/20">
              CB
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 tracking-wider uppercase font-sans">Cash Management Dashboard</p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5 font-sans drop-shadow-sm">{displayCompanyName}</h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed max-w-lg font-sans">
                Manage daily cash-in, cash-out, account ledgers, currency balances, backups, and printable accounting reports in one place.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4" aria-label="Cash book entry counts">
            <article className="flex flex-col gap-2 p-4 bg-white/30 dark:bg-zinc-900/40 rounded-2xl border border-white/40 dark:border-zinc-800/60 shadow-sm w-40 relative overflow-hidden group">
              <div className="flex items-center gap-3 z-10">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/50 dark:bg-black/20 text-indigo-700 dark:text-indigo-400 shadow-sm backdrop-blur-sm border border-white/20">
                  <CalendarDays size={16} />
                </span>
                <div>
                  <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-400 block font-sans">Today's Entries</span>
                  <strong className="text-lg font-bold text-zinc-900 dark:text-white block font-sans tabular-nums">{summary.today_transactions}</strong>
                </div>
              </div>
              <div className="absolute -bottom-2 -left-2 -right-2 h-12 opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineDataToday}>
                    <defs>
                      <linearGradient id="colorSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={2} fill="url(#colorSpark)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="flex flex-col gap-2 p-4 bg-white/30 dark:bg-zinc-900/40 rounded-2xl border border-white/40 dark:border-zinc-800/60 shadow-sm w-40 relative overflow-hidden group">
              <div className="flex items-center gap-3 z-10">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/50 dark:bg-black/20 text-indigo-700 dark:text-indigo-400 shadow-sm backdrop-blur-sm border border-white/20">
                  <CalendarRange size={16} />
                </span>
                <div>
                  <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-400 block font-sans">This Month</span>
                  <strong className="text-lg font-bold text-zinc-900 dark:text-white block font-sans tabular-nums">{summary.monthly_transactions}</strong>
                </div>
              </div>
              <div className="absolute -bottom-2 -left-2 -right-2 h-12 opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineDataMonth}>
                    <defs>
                      <linearGradient id="colorSpark2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={2} fill="url(#colorSpark2)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>
        </div>
      </div>

      <ConsolidatedMetrics summary={dynamicSummary} />

      <QuickActions
        activeTransactionType={activeTransactionType}
        setActiveTransactionType={setActiveTransactionType}
        onNavigate={onNavigate}
        onPrint={onPrint}
        onBackup={onBackup}
        onRestore={onRestore}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-6">
        <div className="p-6 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border border-white/30 dark:border-zinc-800/30 shadow-lg rounded-2xl">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide mb-4 font-sans drop-shadow-sm">Recent Cash Book Activity</h3>
          <div className="flex flex-col gap-3">
            {!filteredTransactions.length ? (
              <div className="text-xs text-zinc-600 dark:text-zinc-400 py-4 text-center font-sans">
                No transactions recorded yet. Add a Cash In or Cash Out entry to start the cash book.
              </div>
            ) : (
              filteredTransactions.slice(0, 5).map((tx) => {
                const isCashIn = tx.transaction_type === 'cash_in';
                const amount = isCashIn ? tx.cash_in_afn : tx.cash_out_afn;
                return (
                  <div className="flex justify-between items-center py-2 border-b border-white/20 dark:border-zinc-800/60 last:border-0" key={tx.id}>
                    <div>
                      <strong className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-sans">{tx.account_name}</strong>
                      <p className="text-[10px] text-zinc-600 dark:text-zinc-400 mt-0.5 font-sans">{tx.detail}</p>
                    </div>
                    <div className={`text-xs font-bold font-mono tabular-nums ${isCashIn ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                      {signedCurrency(amount, tx.transaction_type)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-6 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md border border-white/30 dark:border-zinc-800/30 shadow-lg rounded-2xl">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wide mb-4 font-sans drop-shadow-sm">Chronological Cash Flow</h3>
          <SimpleCashChart transactions={filteredTransactions} />
        </div>
      </div>
    </>
  );
}
