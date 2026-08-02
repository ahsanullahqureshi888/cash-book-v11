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
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Receipt,
  CheckCircle2,
  ListFilter,
  UsersRound,
  Users,
  RefreshCw
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import SimpleCashChart from '../components/SimpleCashChart';
import { currency, signedCurrency, dateLabel } from '../utils/format';

const companyFallback = 'Cashbook Of All Companies';

function getInitials(name) {
  if (!name) return 'AQ';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function MetricCard({ title, value, icon: Icon, color, subtext }) {
  const colorStyles = {
    emerald: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    rose: { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
    blue: { bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    violet: { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' }
  };
  const currentStyle = colorStyles[color] || colorStyles.blue;

  return (
    <div className="glass-card p-3.5 sm:p-5 rounded-2xl flex flex-col gap-1 border border-slate-200/60 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${currentStyle.bg} flex items-center justify-center shrink-0`}>
          <Icon size={15} />
        </div>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">{title}</span>
      </div>
      <div className="mt-0.5">
        <strong className="text-base sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white tabular-nums truncate block">{value}</strong>
        {subtext && <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
}

function QuickActions({ activeTransactionType, setActiveTransactionType, onNavigate, onPrint, onBackup }) {
  return (
    <div className="glass-card dashboard-actions-card">
      <div className="actions-header">
        <span className="actions-title">Quick Actions & Shortcuts</span>
      </div>
      <div className="actions-buttons-grid">
        <button
          type="button"
          className={`btn-action btn-action-cash-in ${activeTransactionType === 'cash_in' ? 'active' : ''}`}
          onClick={() => {
            setActiveTransactionType(activeTransactionType === 'cash_in' ? null : 'cash_in');
            onNavigate('cashbook');
          }}
        >
          <ArrowDownLeft size={16} /> <span>Add Cash In</span>
        </button>

        <button
          type="button"
          className={`btn-action btn-action-cash-out ${activeTransactionType === 'cash_out' ? 'active' : ''}`}
          onClick={() => {
            setActiveTransactionType(activeTransactionType === 'cash_out' ? null : 'cash_out');
            onNavigate('cashbook');
          }}
        >
          <ArrowUpRight size={16} /> <span>Add Cash Out</span>
        </button>

        <button
          type="button"
          className="btn-action bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 font-bold"
          onClick={() => onNavigate('employees')}
        >
          <UsersRound size={16} className="text-indigo-600 dark:text-indigo-400" /> <span>Employees & Salaries</span>
        </button>

        <button
          type="button"
          className="btn-action"
          onClick={() => onNavigate('accounts')}
        >
          <Users size={16} /> <span>Accounts</span>
        </button>

        <button
          type="button"
          className="btn-action"
          onClick={() => onNavigate('ledger')}
        >
          <Landmark size={16} /> <span>Account Ledger</span>
        </button>

        <button
          type="button"
          className="btn-action"
          onClick={() => onNavigate('converter')}
        >
          <RefreshCw size={16} /> <span>Currency Converter</span>
        </button>

        <button
          type="button"
          className="btn-action"
          onClick={() => onNavigate('reports')}
        >
          <FileText size={16} /> <span>Financial Reports</span>
        </button>

        <button
          type="button"
          className="btn-action"
          onClick={onPrint}
        >
          <Printer size={16} /> <span>Print View</span>
        </button>

        <button
          type="button"
          className="btn-action"
          onClick={onBackup}
        >
          <DatabaseBackup size={16} /> <span>Backup Data</span>
        </button>
      </div>
    </div>
  );
}

export default function Dashboard({
  summary = {},
  latestTransactions = [],
  transactions = [],
  onNavigate,
  onBackup,
  onRestore,
  onPrint,
  activeTransactionType,
  setActiveTransactionType,
  isLoading,
  currentUser,
  companyName
}) {
  const [selectedBranch, setSelectedBranch] = useState('consolidated');
  const displayCompanyName = companyName || companyFallback;
  const userName = currentUser?.full_name || currentUser?.username || 'Ahsanullah';
  const userInitials = getInitials(userName);
  const greeting = getGreeting();

  // Sort newest transactions first
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return sortedTransactions.slice(0, 8);
  }, [sortedTransactions]);

  // Calculations using backend summary with fallback
  const cashInAfn = Number(summary.cash_in_afn || summary.total_cash_in || 0);
  const cashOutAfn = Number(summary.cash_out_afn || summary.total_cash_out || 0);
  const currentBalance = summary.afn_balance !== undefined ? Number(summary.afn_balance) : (cashInAfn - cashOutAfn);
  const totalTxCount = transactions.length || summary.today_transactions || 0;

  const todayCount = useMemo(() => {
    if (summary?.today_transactions) return summary.today_transactions;
    const todayStr = new Date().toISOString().split('T')[0];
    return (transactions || []).filter(t => (t.date || t.created_at || '').startsWith(todayStr)).length;
  }, [summary?.today_transactions, transactions]);

  const monthCount = useMemo(() => {
    if (summary?.monthly_transactions) return summary.monthly_transactions;
    const monthStr = new Date().toISOString().slice(0, 7);
    return (transactions || []).filter(t => (t.date || t.created_at || '').startsWith(monthStr)).length;
  }, [summary?.monthly_transactions, transactions]);

  return (
    <div className="dashboard-page flex flex-col gap-4 sm:gap-6 w-full pb-28 sm:pb-8">
      {/* 1. Compact Welcome Banner */}
      <div className="dashboard-welcome-card glass-card p-3 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="welcome-avatar-block flex items-center gap-3">
          <div className="welcome-avatar w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-sm shrink-0">
            {userInitials}
          </div>
          <div className="welcome-info min-w-0">
            <p className="text-[11px] text-slate-500 font-medium leading-none">{greeting},</p>
            <h2 className="welcome-greeting text-sm sm:text-lg font-black text-slate-900 dark:text-white truncate">{userName}</h2>
            <p className="welcome-subtext text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <span className="truncate">{displayCompanyName}</span> &bull; <span className="status-badge-inline text-[10px] text-emerald-600 font-bold">Up to date</span>
            </p>
          </div>
        </div>

        <div className="welcome-stats flex items-center gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
          <div className="stat-pill px-2.5 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs">
            <CalendarDays size={13} className="text-indigo-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-slate-400">Today</span>
              <strong className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{todayCount} entries</strong>
            </div>
          </div>
          <div className="stat-pill px-2.5 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs">
            <CalendarRange size={13} className="text-indigo-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-slate-400">This Month</span>
              <strong className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{monthCount} entries</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary 4-Card Responsive Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <MetricCard
          title="Total Cash In (AFN)"
          value={currency(cashInAfn, 'AFN')}
          icon={ArrowDownLeft}
          color="emerald"
          subtext={`${totalTxCount} total transactions`}
        />
        <MetricCard
          title="Total Cash Out (AFN)"
          value={currency(cashOutAfn, 'AFN')}
          icon={ArrowUpRight}
          color="rose"
          subtext="Verified accurate balance"
        />
        <MetricCard
          title="Current AFN Balance"
          value={currency(currentBalance, 'AFN')}
          icon={WalletCards}
          color="blue"
          subtext={currentBalance >= 0 ? "Positive Net Balance" : "Negative Net Balance"}
        />
        <MetricCard
          title="Total Transactions"
          value={totalTxCount}
          icon={TrendingUp}
          color="violet"
          subtext="Recorded in database"
        />
      </div>

      {/* 3. Quick Action Buttons */}
      <QuickActions
        activeTransactionType={activeTransactionType}
        setActiveTransactionType={setActiveTransactionType}
        onNavigate={onNavigate}
        onPrint={onPrint}
        onBackup={onBackup}
      />

      {/* 4. Recent Transactions & Cashflow Split */}
      <div className="dashboard-main-split">
        {/* Recent Transactions Card */}
        <div className="recent-transactions-card">
          <div className="card-header flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="card-title">Recent Transactions</h3>
              <span className="record-count-badge">{recentTransactions.length} items</span>
            </div>
            <NavLink to="/cashbook" className="view-all-link">
              <span>View all</span>
              <ArrowRight size={14} />
            </NavLink>
          </div>

          {/* Desktop Table View */}
          <div className="recent-table-wrapper">
            <table className="recent-transactions-table">
              <thead>
                <tr>
                  <th>Account Name</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => {
                  const isCashIn = tx.transaction_type === 'cash_in';
                  const amount = isCashIn ? tx.cash_in_afn : tx.cash_out_afn;
                  return (
                    <tr key={tx.id}>
                      <td className="account-cell">
                        <strong className="account-name">{tx.account_name || 'General'}</strong>
                        {tx.detail && <span className="account-detail">{tx.detail}</span>}
                      </td>
                      <td className="date-cell">{dateLabel(tx.date)}</td>
                      <td>
                        <span className={`badge-type ${isCashIn ? 'badge-cash-in' : 'badge-cash-out'}`}>
                          {isCashIn ? 'Cash In' : 'Cash Out'}
                        </span>
                      </td>
                      <td className={`amount-cell text-right ${isCashIn ? 'amount-in' : 'amount-out'}`}>
                        {signedCurrency(amount, tx.transaction_type)}
                      </td>
                      <td>
                        <span className="badge-status">
                          <CheckCircle2 size={12} />
                          <span>Completed</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-state-cell">
                      No transactions recorded yet. Click "Add Cash In" or "Add Cash Out" to create an entry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (<760px) */}
          <div className="recent-mobile-cards">
            {recentTransactions.map((tx) => {
              const isCashIn = tx.transaction_type === 'cash_in';
              const amount = isCashIn ? tx.cash_in_afn : tx.cash_out_afn;
              return (
                <div key={tx.id} className="mobile-tx-card">
                  <div className="mobile-tx-header">
                    <strong>{tx.account_name || 'General'}</strong>
                    <span className={`badge-type ${isCashIn ? 'badge-cash-in' : 'badge-cash-out'}`}>
                      {isCashIn ? 'Cash In' : 'Cash Out'}
                    </span>
                  </div>
                  <div className="mobile-tx-body">
                    <span>{dateLabel(tx.date)}</span>
                    <strong className={isCashIn ? 'amount-in' : 'amount-out'}>
                      {signedCurrency(amount, tx.transaction_type)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chronological Cash Flow Chart */}
        <div className="glass-card cash-flow-chart-card">
          <div className="card-header">
            <h3 className="card-title">Chronological Cash Flow</h3>
          </div>
          <div className="chart-body">
            <SimpleCashChart transactions={sortedTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
