import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  UserPlus, 
  Users, 
  ScrollText, 
  Edit, 
  Trash2, 
  Plus, 
  Download, 
  X,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import DataTable from '../components/DataTable';
import { currency } from '../utils/format';

export default function Accounts({ 
  accounts = [], 
  form, 
  setForm, 
  onSave, 
  onEdit, 
  onDelete, 
  search = '', 
  setSearch 
}) {
  const { t } = useTranslation();
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm({
      name: '',
      account_type: 'customer',
      phone: '',
      address: '',
      opening_balance_afn: '',
      opening_balance_usd: '',
      note: ''
    });
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch = !search || `${account.name} ${account.phone} ${account.account_type}`.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedTypeFilter === 'all' || account.account_type?.toLowerCase() === selectedTypeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [accounts, search, selectedTypeFilter]);

  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'customer':
        return 'badge-blue';
      case 'supplier':
        return 'badge-purple';
      case 'worker':
        return 'badge-emerald';
      case 'factory':
        return 'badge-amber';
      case 'expense':
        return 'badge-rose';
      default:
        return 'badge-slate';
    }
  };

  const columns = useMemo(() => [
    { 
      key: 'name', 
      label: t('Account Info'), 
      sortable: true,
      render: (row) => (
        <div className="account-info-cell">
          <strong className="account-name">{row.name}</strong>
          {row.address && <span className="account-subtext">{row.address}</span>}
        </div>
      ),
      className: 'col-account-info'
    },
    { 
      key: 'account_type', 
      label: t('Type'), 
      sortable: true,
      render: (row) => (
        <span className={`account-type-badge ${getTypeBadgeClass(row.account_type)}`}>
          {row.account_type}
        </span>
      ),
      className: 'col-account-type'
    },
    { 
      key: 'phone', 
      label: t('Phone'), 
      render: (row) => <span className="mono-text">{row.phone || '-'}</span>, 
      className: 'col-phone' 
    },
    { 
      key: 'opening_balance_afn', 
      label: t('Opening AFN'), 
      sortable: true,
      render: (row) => (
        <span className="mono-text amount-positive">
          {currency(row.opening_balance_afn || 0)}
        </span>
      ), 
      className: 'col-amount text-right' 
    },
    { 
      key: 'opening_balance_usd', 
      label: t('Opening USD'), 
      sortable: true,
      render: (row) => (
        <span className="mono-text amount-neutral">
          {currency(row.opening_balance_usd || 0, 'USD')}
        </span>
      ), 
      className: 'col-amount text-right' 
    },
    { 
      key: 'actions', 
      label: t('Actions'), 
      className: 'col-actions text-right',
      render: (row) => (
        <div className="table-actions">
          <NavLink 
            to={`/ledger?account=${row.id}`} 
            className="action-icon-btn" 
            title={t('View Ledger')}
            aria-label={t('View Ledger')}
          >
            <ScrollText size={16} />
          </NavLink>
          <button 
            type="button" 
            className="action-icon-btn" 
            onClick={() => onEdit(row)}
            title={t('Edit Account')}
            aria-label={t('Edit Account')}
          >
            <Edit size={16} />
          </button>
          <button 
            type="button" 
            className="action-icon-btn action-icon-btn--danger" 
            onClick={() => onDelete(row)}
            title={t('Delete Account')}
            aria-label={t('Delete Account')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ], [onEdit, onDelete, t]);

  const headerContent = (
    <div className="account-directory-header">
      <div className="directory-title-area">
        <div className="title-icon-badge">
          <Users size={18} />
        </div>
        <div>
          <h3 className="directory-title">{t('Account Directory')}</h3>
          <span className="directory-count">{filteredAccounts.length} {t('records')}</span>
        </div>
      </div>

      <div className="directory-controls">
        <div className="search-field">
          <Search size={16} className="search-icon" />
          <input 
            type="search" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder={t('Search accounts...')} 
            className="search-input"
          />
          {search && (
            <button type="button" className="search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-select-wrap">
          <Filter size={15} className="filter-icon" />
          <select 
            value={selectedTypeFilter} 
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="filter-select"
            aria-label="Filter accounts by type"
          >
            <option value="all">{t('All Types')}</option>
            <option value="customer">{t('Customer')}</option>
            <option value="supplier">{t('Supplier')}</option>
            <option value="worker">{t('Worker')}</option>
            <option value="factory">{t('Factory')}</option>
            <option value="expense">{t('Expense')}</option>
            <option value="other">{t('Other')}</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderMobileCard = (row) => (
    <div key={row.id} className="account-mobile-card">
      <div className="account-mobile-card__header">
        <div>
          <strong className="account-mobile-card__name">{row.name}</strong>
          {row.address && <p className="account-mobile-card__address">{row.address}</p>}
        </div>
        <span className={`account-type-badge ${getTypeBadgeClass(row.account_type)}`}>
          {row.account_type}
        </span>
      </div>

      <div className="account-mobile-card__body">
        <div className="account-mobile-card__row">
          <span>{t('Phone')}:</span>
          <strong className="mono-text">{row.phone || '-'}</strong>
        </div>
        <div className="account-mobile-card__row">
          <span>{t('Opening AFN')}:</span>
          <strong className="mono-text amount-positive">{currency(row.opening_balance_afn || 0)}</strong>
        </div>
        <div className="account-mobile-card__row">
          <span>{t('Opening USD')}:</span>
          <strong className="mono-text amount-neutral">{currency(row.opening_balance_usd || 0, 'USD')}</strong>
        </div>
      </div>

      <div className="account-mobile-card__footer">
        <NavLink to={`/ledger?account=${row.id}`} className="ghost-btn icon-btn-text">
          <ScrollText size={15} />
          <span>{t('Ledger')}</span>
        </NavLink>
        <button type="button" className="ghost-btn icon-btn-text" onClick={() => onEdit(row)}>
          <Edit size={15} />
          <span>{t('Edit')}</span>
        </button>
        <button type="button" className="ghost-btn icon-btn-text danger-text" onClick={() => onDelete(row)}>
          <Trash2 size={15} />
          <span>{t('Delete')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="accounts-page">
      {/* 1. PAGE HEADER */}
      <header className="accounts-page-header">
        <div>
          <span className="eyebrow">{t('Financial Records')}</span>
          <h1 className="page-title">{t('Accounts Management')}</h1>
          <p className="page-description">
            {t('Manage customers, suppliers, workers, factory accounts, and expenses.')}
          </p>
        </div>
      </header>

      {/* 2. TWO-COLUMN BALANCED LAYOUT */}
      <div className="accounts-layout">
        {/* LEFT FORM CARD */}
        <div className="account-form-card">
          <div className="account-form-card__header">
            <div className="form-title-badge">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="form-title">{form.id ? t('Edit Account') : t('Add New Account')}</h3>
              <p className="form-subtext">{t('Fill out account details below.')}</p>
            </div>
          </div>
          
          <form className="account-form" onSubmit={onSave}>
            <div className="form-field">
              <label className="field-label">{t('ACCOUNT NAME')}</label>
              <input 
                autoFocus 
                type="text" 
                value={form.name || ''} 
                onChange={(e) => update('name', e.target.value)} 
                placeholder={t('Full name or company')} 
                required 
                dir="auto" 
                className="form-control" 
              />
            </div>
            
            <div className="form-field">
              <label className="field-label">{t('ACCOUNT TYPE')}</label>
              <select 
                value={form.account_type || 'customer'} 
                onChange={(e) => update('account_type', e.target.value)} 
                className="form-select"
              >
                <option value="customer">{t('Customer')}</option>
                <option value="supplier">{t('Supplier')}</option>
                <option value="worker">{t('Worker')}</option>
                <option value="factory">{t('Factory')}</option>
                <option value="expense">{t('Expense')}</option>
                <option value="other">{t('Other')}</option>
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label className="field-label">{t('PHONE')}</label>
                <input 
                  type="text" 
                  value={form.phone || ''} 
                  onChange={(e) => update('phone', e.target.value)} 
                  placeholder={t('Phone number')} 
                  className="form-control" 
                />
              </div>
              <div className="form-field">
                <label className="field-label">{t('ADDRESS')}</label>
                <input 
                  type="text" 
                  value={form.address || ''} 
                  onChange={(e) => update('address', e.target.value)} 
                  placeholder={t('Address')} 
                  dir="auto" 
                  className="form-control" 
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-field">
                <label className="field-label">{t('OPENING AFN')}</label>
                <input 
                  type="number" 
                  value={form.opening_balance_afn ?? ''} 
                  onChange={(e) => update('opening_balance_afn', e.target.value)} 
                  placeholder="0.00" 
                  step="0.01" 
                  className="form-control mono-input" 
                />
              </div>
              <div className="form-field">
                <label className="field-label">{t('OPENING USD')}</label>
                <input 
                  type="number" 
                  value={form.opening_balance_usd ?? ''} 
                  onChange={(e) => update('opening_balance_usd', e.target.value)} 
                  placeholder="0.00" 
                  step="0.01" 
                  className="form-control mono-input" 
                />
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">{t('NOTES')}</label>
              <input 
                type="text" 
                value={form.note || ''} 
                onChange={(e) => update('note', e.target.value)} 
                placeholder={t('Optional note')} 
                dir="auto" 
                className="form-control" 
              />
            </div>

            <div className="account-form-actions">
              {form.id ? (
                <button type="button" className="ghost-btn action-btn-cancel" onClick={resetForm}>
                  {t('Cancel Edit')}
                </button>
              ) : (
                <button type="button" className="ghost-btn action-btn-cancel" onClick={resetForm}>
                  {t('Clear')}
                </button>
              )}
              <button className="primary-btn action-btn-submit" type="submit">
                {form.id ? t('Save Changes') : t('Create Account')}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT DIRECTORY CARD */}
        <div className="account-directory-card">
          <DataTable
            columns={columns}
            data={filteredAccounts}
            keyField="id"
            headerContent={headerContent}
            renderMobileCard={renderMobileCard}
            emptyTitle={t('No accounts found')}
            emptyDescription={t('Create a customer, supplier, worker, or expense account to see it here.')}
          />
        </div>
      </div>
    </div>
  );
}
