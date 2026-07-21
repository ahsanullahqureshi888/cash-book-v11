import { ChevronRight, Search, Plus, Filter, Users, Printer, Download } from 'lucide-react';
import LedgerTable from '../components/LedgerTable';

export default function AccountLedger(props) {
  const visibleAccounts = props.accounts || [];

  return (
    <div className="account-ledger-page">
      {/* 1. PAGE HEADER */}
      <header className="account-ledger-header">
        <div className="account-ledger-header__title-block">
          <h2 className="account-ledger-header__title">Account Ledger</h2>
          <p className="account-ledger-header__subtitle">Manage customer and company ledgers</p>
        </div>
        <div className="account-ledger-header__actions">
          <button 
            type="button"
            className="btn-secondary"
            onClick={props.onPrint}
          >
            <Printer size={16} />
            <span>Print Ledger</span>
          </button>
          <button 
            type="button"
            className="btn-primary"
            onClick={props.onExport}
          >
            <Download size={16} />
            <span>Export Ledger</span>
          </button>
        </div>
      </header>

      {/* 2. TWO-COLUMN RESPONSIVE LAYOUT */}
      <div className="account-ledger-layout">
        
        {/* LEFT COLUMN: Account Creation & Search List */}
        <aside className="ledger-left-panel">
          {/* Create Account Card */}
          <div className="ledger-card create-account-card">
            <h3 className="ledger-card__title">
              <Plus size={16} className="title-icon" />
              <span>Create Account</span>
            </h3>
            <form className="create-account-form" onSubmit={props.onCreateAccount}>
              <div className="form-group">
                <label className="form-label">Account Name</label>
                <input 
                  type="text" 
                  value={props.accountName} 
                  onChange={(e) => props.setAccountName(e.target.value)} 
                  placeholder="Customer / Company Name" 
                  required 
                  dir="auto" 
                  className="ledger-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Opening Balance (AFN)</label>
                <input 
                  type="number" 
                  value={props.openingBalance} 
                  onChange={(e) => props.setOpeningBalance(e.target.value)} 
                  placeholder="Opening Balance AFN" 
                  step="0.01" 
                  className="ledger-input"
                />
              </div>
              <button className="btn-primary full-width mt-2" type="submit">Add Account</button>
            </form>
          </div>

          {/* Search + Accounts List Card */}
          <div className="ledger-card account-list-card">
            <div className="account-search-wrapper">
              <Search className="search-icon" size={16} />
              <input 
                type="search" 
                value={props.search} 
                onChange={(e) => props.setSearch(e.target.value)} 
                placeholder="Search accounts..." 
                className="account-search-input"
              />
            </div>

            <div className="account-list-scroll">
              {!visibleAccounts.length ? (
                <div className="account-list-empty">
                  <Users size={28} className="empty-icon" />
                  <span>No accounts found</span>
                </div>
              ) : (
                visibleAccounts.map((account) => {
                  const isActive = account.name === props.selectedAccountName;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => props.onSelectAccount(account)}
                      className={`account-item-btn ${isActive ? 'active' : ''}`}
                    >
                      <div className="account-item-info">
                        <strong className="account-item-name">{account.name}</strong>
                        <span className="account-item-balance">
                          AFN {Number(account.balance || account.opening_balance_afn || 0).toLocaleString('en-US')}
                        </span>
                      </div>
                      <ChevronRight size={16} className="account-item-arrow" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Ledger Details & Table */}
        <main className="ledger-right-panel">
          <div className="ledger-card ledger-main-card">
            
            {/* LEDGER SUMMARY HEADER */}
            <div className="ledger-summary-section">
              <div className="ledger-summary-title-row">
                <h3 className="ledger-summary-title">
                  {props.selectedAccountName ? `${props.selectedAccountName} Ledger` : 'Account Ledger Summary'}
                </h3>
                {props.selectedAccountName && (
                  <span className="account-status-badge">Active Account</span>
                )}
              </div>
              
              {/* 4 STAT CARDS IN 1 ROW */}
              <div className="ledger-stats-grid">
                <div className="ledger-stat-card">
                  <span className="stat-label">Opening Balance</span>
                  <strong className="stat-value">{props.ledgerSummary?.opening || 'AFN 0.00'}</strong>
                </div>
                <div className="ledger-stat-card debit">
                  <span className="stat-label">Total Debit</span>
                  <strong className="stat-value text-emerald">{props.ledgerSummary?.debit || 'AFN 0.00'}</strong>
                </div>
                <div className="ledger-stat-card credit">
                  <span className="stat-label">Total Credit</span>
                  <strong className="stat-value text-rose">{props.ledgerSummary?.credit || 'AFN 0.00'}</strong>
                </div>
                <div className="ledger-stat-card final">
                  <span className="stat-label">Final Balance</span>
                  <strong className="stat-value text-gold">{props.ledgerSummary?.final || 'AFN 0.00'}</strong>
                </div>
              </div>
            </div>

            {/* FILTER TOOLBAR */}
            <div className="ledger-filter-bar">
              <button type="button" className="filter-btn">
                <Filter size={14} /> 
                <span>Filter Dates</span>
              </button>
              <select className="filter-select" aria-label="Filter by branch">
                <option value="all">All Branches</option>
              </select>
              <select className="filter-select" aria-label="Filter by currency">
                <option value="all">All Currencies</option>
              </select>
            </div>

            {/* LEDGER TABLE AREA */}
            <div className="ledger-table-container">
              {props.selectedAccountName ? (
                <LedgerTable 
                  rows={props.rows} 
                  dateDisplayFormat={props.dateDisplayFormat} 
                  onReceipt={props.onReceipt} 
                />
              ) : (
                <div className="ledger-empty-state">
                  <div className="empty-state-badge">
                    <Users size={24} />
                  </div>
                  <h4>No Account Selected</h4>
                  <p>Select an account from the left panel to view its complete ledger history.</p>
                </div>
              )}
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
