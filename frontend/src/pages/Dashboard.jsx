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
  ListFilter
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import SimpleCashChart from '../components/SimpleCashChart';
import { currency, dateLabel } from '../utils/format';

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

function MetricCard({ title, value, icon: Icon, color, subtext, trendData }) {
  const colorStyles = {
    emerald: {
      bg: 'rgba(5, 150, 105, 0.12)',
      text: '#059669',
      border: 'rgba(5, 150, 105, 0.2)',
      glow: 'rgba(5, 150, 105, 0.15)'
    },
    rose: {
      bg: 'rgba(220, 38, 38, 0.12)',
      text: '#dc2626',
      border: 'rgba(220, 38, 38, 0.2)',
      glow: 'rgba(220, 38, 38, 0.15)'
    },
    blue: {
      bg: 'rgba(37, 99, 235, 0.12)',
      text: '#2563eb',
      border: 'rgba(37, 99, 235, 0.2)',
      glow: 'rgba(37, 99, 235, 0.15)'
    },
    violet: {
      bg: 'rgba(124, 58, 237, 0.12)',
      text: '#7c3aed',
      border: 'rgba(124, 58, 237, 0.2)',
      glow: 'rgba(124, 58, 237, 0.15)'
    }
  };

  const currentStyle = colorStyles[color] || colorStyles.blue;

  return (
    <div className="metric-card glass-card">
      <div className="metric-card-header">
        <div className="metric-card-icon" style={{ backgroundColor: currentStyle.bg, color: currentStyle.text }}>
          <Icon size={18} />
        </div>
        <span className="metric-card-label">{title}</span>
      </div>
      <div className="metric-card-body">
        <strong className="metric-card-value">{value}</strong>
        {subtext && <p className="metric-card-subtext">{subtext}</p>}
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
          className="btn-action"
          onClick={() => onNavigate('ledger')}
        >
          <Landmark size={16} /> <span>Account Ledger</span>
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
    return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return sortedTransactions.slice(0, 8);
  }, [sortedTransactions]);

  // Calculations using backend summary with fallback
  const cashInAfn = Number(summary.cash_in_afn || summary.total_cash_in || 0);
  const cashOutAfn = Number(summary.cash_out_afn || summary.total_cash_out || 0);
  const currentBalance = summary.afn_balance !== undefined ? Number(summary.afn_balance) : (cashInAfn - cashOutAfn);
  const totalTxCount = transactions.length || summary.today_transactions || 0;

  const signedCurrency = (value, type = 'cash_in') => {
    const amount = Math.abs(Number(value || 0));
    return `${type === 'cash_in' ? '+' : '-'}${currency(amount)}`;
  };

  return (
    <div className="dashboard-page">
      {/* 1. Compact Welcome Banner */}
      <div className="dashboard-welcome-card glass-card">
        <div className="welcome-avatar-block">
          <div className="welcome-avatar">
            {userInitials}
          </div>
          <div className="welcome-info">
            <h2 className="welcome-greeting">{greeting}, {userName}</h2>
            <p className="welcome-subtext">
              {displayCompanyName} &bull; <span className="status-badge-inline">Up to date</span>
            </p>
          </div>
        </div>

        <div className="welcome-stats flex items-center gap-3">
          <div className="stat-pill">
            <CalendarDays size={15} />
            <div>
              <small>Today</small>
              <strong>{summary.today_transactions || 0} entries</strong>
            </div>
          </div>
          <div className="stat-pill">
            <CalendarRange size={15} />
            <div>
              <small>This Month</small>
              <strong>{summary.monthly_transactions || 0} entries</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary 4-Card Responsive Metric Grid */}
      <div className="dashboard-metric-grid">
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
