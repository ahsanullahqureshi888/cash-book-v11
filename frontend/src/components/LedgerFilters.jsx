import React, { useState } from 'react';
import { useTenant } from '../context/CompanyContext';

export function LedgerFilters({ onFilterChange }) {
  const { activeCompany } = useTenant();
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('ALL');
  const [dateRange, setDateRange] = useState('THIS_MONTH');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleApplyFilters = (newFilters) => {
    if (onFilterChange) {
      onFilterChange({
        search: newFilters.search !== undefined ? newFilters.search : search,
        account: newFilters.account !== undefined ? newFilters.account : selectedAccount,
        dateRange: newFilters.dateRange !== undefined ? newFilters.dateRange : dateRange,
      });
    }
  };

  const accounts = activeCompany?.accounts || ['Export Account', 'Import Account', 'Demurrage Account', 'General Ledger'];

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
        {/* Keyword Search */}
        <div className="relative w-full md:w-96">
          <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions, accounts, notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleApplyFilters({ search: e.target.value });
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-xs font-semibold transition-all ${
            isFilterOpen || selectedAccount !== 'ALL' || dateRange !== 'ALL_TIME'
              ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300'
              : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 hover:bg-slate-50'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
        </button>
      </div>

      {/* Expandable Filter Drawer */}
      {isFilterOpen && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter by Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                handleApplyFilters({ account: e.target.value });
              }}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="ALL">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Time Period</label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                handleApplyFilters({ dateRange: e.target.value });
              }}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="ALL_TIME">All Time</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setSelectedAccount('ALL');
                setDateRange('ALL_TIME');
                handleApplyFilters({ search: '', account: 'ALL', dateRange: 'ALL_TIME' });
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LedgerFilters;
