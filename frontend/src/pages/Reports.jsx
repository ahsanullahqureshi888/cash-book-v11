/* eslint-disable */
import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Printer,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Layers,
  Building2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { currency, dateLabel, csvCell, todayInputValue } from '../utils/format';
import DateDisplay from '../components/DateDisplay';

function unescapeText(str) {
  if (!str || typeof str !== 'string') return String(str ?? '');
  let text = str;
  while (text.includes('&amp;')) {
    text = text.replace(/&amp;/g, '&');
  }
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function firstDayOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function Reports({
  transactions = [],
  accounts = [],
  companyName = 'CASHBOOK SYSTEM',
  companyLogo = '',
  companyAddress = '',
  companyPhone = '',
  companyEmail = '',
  currentUser,
  dateDisplayFormat = 'YYYY-MM-DD',
  currencyCode = 'AFN'
}) {
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayInputValue);
  const [selectedAccount, setSelectedAccount] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [fitToScreen, setFitToScreen] = useState(true);
  const [zoomScale, setZoomScale] = useState('88%');

  // Extract unique categories from transactions
  const categories = useMemo(() => {
    const set = new Set();
    transactions.forEach((tx) => {
      if (tx.category) set.add(unescapeText(tx.category));
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Extract unique accounts from transactions & accounts list
  const accountOptions = useMemo(() => {
    const set = new Map();
    accounts.forEach((acc) => set.set(String(acc.id), unescapeText(acc.name)));
    transactions.forEach((tx) => {
      if (tx.account_name) {
        const cleanName = unescapeText(tx.account_name);
        set.set(cleanName, cleanName);
      }
    });
    return Array.from(set.entries()).map(([val, name]) => ({ value: val, label: name }));
  }, [accounts, transactions]);

  // Filter transactions based on active parameters
  const filteredRows = useMemo(() => {
    let list = [...transactions];

    // Filter by Report Type / Date Range
    const todayStr = todayInputValue();
    if (reportType === 'daily') {
      list = list.filter((tx) => tx.date === todayStr);
    } else if (reportType === 'monthly') {
      const monthPrefix = todayStr.slice(0, 7); // e.g. "2026-07"
      list = list.filter((tx) => tx.date && tx.date.startsWith(monthPrefix));
    } else if (reportType === 'dateRange') {
      if (startDate) list = list.filter((tx) => tx.date >= startDate);
      if (endDate) list = list.filter((tx) => tx.date <= endDate);
    } else if (reportType === 'expenses') {
      list = list.filter((tx) => tx.transaction_type === 'cash_out' || (tx.category && tx.category.toLowerCase().includes('expense')));
    } else if (reportType === 'cash_in') {
      list = list.filter((tx) => tx.transaction_type === 'cash_in' || Number(tx.cash_in_afn || 0) > 0 || Number(tx.usd_in || 0) > 0);
    } else if (reportType === 'cash_out') {
      list = list.filter((tx) => tx.transaction_type === 'cash_out' || Number(tx.cash_out_afn || 0) > 0 || Number(tx.usd_out || 0) > 0);
    }

    // Filter by Account
    if (selectedAccount !== 'ALL') {
      list = list.filter((tx) => 
        String(tx.account_id) === String(selectedAccount) || 
        unescapeText(tx.account_name) === unescapeText(selectedAccount)
      );
    }

    // Filter by Category
    if (selectedCategory !== 'ALL') {
      list = list.filter((tx) => unescapeText(tx.category) === unescapeText(selectedCategory));
    }

    // Filter by Payment Method
    if (selectedPayment !== 'ALL') {
      list = list.filter((tx) => (tx.payment_method || 'cash').toLowerCase() === selectedPayment.toLowerCase());
    }

    // Filter by Keyword Search
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((tx) =>
        [tx.transaction_no, unescapeText(tx.account_name), unescapeText(tx.detail), unescapeText(tx.category), tx.payment_method, tx.reference]
          .some((val) => String(val || '').toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return list;
  }, [transactions, reportType, startDate, endDate, selectedAccount, selectedCategory, selectedPayment, search, sortOrder]);

  // Compute summary totals
  const summary = useMemo(() => {
    let cashInAfn = 0;
    let cashOutAfn = 0;
    let usdIn = 0;
    let usdOut = 0;

    filteredRows.forEach((tx) => {
      cashInAfn += Number(tx.cash_in_afn || 0);
      cashOutAfn += Number(tx.cash_out_afn || 0);
      usdIn += Number(tx.usd_in || 0);
      usdOut += Number(tx.usd_out || 0);
    });

    const afnBalance = cashInAfn - cashOutAfn;
    const usdBalance = usdIn - usdOut;

    return {
      cashInAfn,
      cashOutAfn,
      afnBalance,
      usdIn,
      usdOut,
      usdBalance,
      count: filteredRows.length
    };
  }, [filteredRows]);

  function handleResetFilters() {
    setReportType('monthly');
    setStartDate(firstDayOfMonth());
    setEndDate(todayInputValue());
    setSelectedAccount('ALL');
    setSelectedCategory('ALL');
    setSelectedPayment('ALL');
    setSearch('');
    setSortOrder('newest');
  }

  function exportCsv() {
    if (!filteredRows.length) return;
    const headers = ['S.No', 'Date', 'TX No', 'Account Name', 'Transaction Type', 'Category', 'Payment Method', 'Detail', 'Cash In (AFN)', 'Cash Out (AFN)', 'USD In', 'USD Out', 'Rate', 'Reference'];
    const body = filteredRows.map((tx, idx) => [
      idx + 1,
      csvCell(tx.date),
      csvCell(tx.transaction_no),
      csvCell(unescapeText(tx.account_name)),
      csvCell(tx.transaction_type),
      csvCell(unescapeText(tx.category || '-')),
      csvCell(tx.payment_method || 'cash'),
      csvCell(unescapeText(tx.detail)),
      csvCell(tx.cash_in_afn || 0),
      csvCell(tx.cash_out_afn || 0),
      csvCell(tx.usd_in || 0),
      csvCell(tx.usd_out || 0),
      csvCell(tx.exchange_rate || '-'),
      csvCell(tx.reference || '-')
    ]);

    const csvContent = [headers.join(','), ...body.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Financial_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportJson() {
    if (!filteredRows.length) return;
    const cleanedRows = filteredRows.map((tx) => ({
      ...tx,
      account_name: unescapeText(tx.account_name),
      detail: unescapeText(tx.detail),
      category: unescapeText(tx.category)
    }));
    const blob = new Blob([JSON.stringify({ summary, reportType, filters: { startDate, endDate, account: selectedAccount }, transactions: cleanedRows }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Financial_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    const printWin = window.open('', '_blank', 'width=1200,height=800');
    if (!printWin) return;

    const rowsHtml = filteredRows.map((tx, idx) => `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td>${dateLabel(tx.date)}</td>
        <td style="font-family:monospace;">${tx.transaction_no || '-'}</td>
        <td><strong>${unescapeText(tx.account_name)}</strong></td>
        <td>${unescapeText(tx.category || '-')}</td>
        <td>${unescapeText(tx.detail || '-')}</td>
        <td style="text-align:right;color:#059669;font-weight:bold;">${Number(tx.cash_in_afn || 0) > 0 ? currency(tx.cash_in_afn, 'AFN') : '-'}</td>
        <td style="text-align:right;color:#e11d48;font-weight:bold;">${Number(tx.cash_out_afn || 0) > 0 ? currency(tx.cash_out_afn, 'AFN') : '-'}</td>
        <td style="text-align:right;color:#2563eb;font-weight:bold;">${Number(tx.usd_in || 0) > 0 ? currency(tx.usd_in, 'USD') : Number(tx.usd_out || 0) > 0 ? `-${currency(tx.usd_out, 'USD')}` : '-'}</td>
      </tr>
    `).join('');

    const html = `
      <!doctype html>
      <html>
      <head>
        <title>Financial Report - ${companyName}</title>
        <style>
          @page { size: A4 landscape; margin: 8mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 11px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
          .logo { max-height: 48px; max-width: 140px; object-fit: contain; }
          .title { font-size: 18px; font-weight: bold; color: #1e293b; margin: 0; }
          .subtitle { font-size: 11px; color: #64748b; margin-top: 2px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; }
          .summary-card span { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; display: block; }
          .summary-card strong { font-size: 14px; font-weight: bold; font-family: monospace; display: block; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          th { background: #f1f5f9; color: #334155; font-weight: bold; text-transform: uppercase; font-size: 9px; }
          .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
          .signatures div { border-top: 1px solid #334155; padding-top: 6px; text-align: center; font-size: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${companyName} - Financial Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()} | Scope: ${reportType.toUpperCase()}</p>
          </div>
          ${companyLogo ? `<img src="${companyLogo}" class="logo" />` : ''}
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <span>Total Cash In</span>
            <strong style="color:#059669;">${currency(summary.cashInAfn, 'AFN')}</strong>
          </div>
          <div class="summary-card">
            <span>Total Cash Out</span>
            <strong style="color:#e11d48;">${currency(summary.cashOutAfn, 'AFN')}</strong>
          </div>
          <div class="summary-card">
            <span>Net AFN Balance</span>
            <strong style="color:#2563eb;">${currency(summary.afnBalance, 'AFN')}</strong>
          </div>
          <div class="summary-card">
            <span>Net USD / TX Count</span>
            <strong style="color:#4f46e5;">${currency(summary.usdBalance, 'USD')} (${summary.count} TXs)</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:30px;text-align:center;">#</th>
              <th style="width:75px;">Date</th>
              <th style="width:110px;">TX No</th>
              <th style="width:150px;">Account Name</th>
              <th style="width:90px;">Category</th>
              <th>Particulars Detail</th>
              <th style="width:95px;text-align:right;">Cash In (AFN)</th>
              <th style="width:95px;text-align:right;">Cash Out (AFN)</th>
              <th style="width:95px;text-align:right;">USD Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="signatures">
          <div>Prepared By: ${currentUser?.full_name || 'Accountant'}</div>
          <div>Audited By</div>
          <div>Manager Approval</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWin.document.write(html);
    printWin.document.close();
  }

  return (
    <div 
      className="w-full space-y-3.5 text-slate-900 dark:text-slate-100 transition-all origin-top"
      style={{ zoom: zoomScale }}
    >
      {/* 1. Header with Controls & Zoom Level Controls */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" /> 
            <span>Reports & Financial Analytics</span>
          </h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time daily, monthly, and custom date range financial summaries
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <ZoomOut className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              value={zoomScale}
              onChange={(e) => setZoomScale(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
              aria-label="Screen Zoom Level"
            >
              <option value="85%">85% (Ultra Fit)</option>
              <option value="88%">88% (Compact Fit)</option>
              <option value="95%">95% (Standard Fit)</option>
              <option value="100%">100% (Full Size)</option>
            </select>
          </div>

          {/* Fit to Screen Toggle */}
          <button
            onClick={() => setFitToScreen(!fitToScreen)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              fitToScreen
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
            title={fitToScreen ? 'Switch to Scroll View' : 'Fit Table to Screen Width'}
          >
            {fitToScreen ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span>{fitToScreen ? 'Fit Screen' : 'Scroll View'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-blue-500" /> Print
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> CSV
          </button>
          <button
            onClick={exportJson}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" /> JSON
          </button>
        </div>
      </header>

      {/* 2. Control Panel Filter Workspace */}
      <div className="w-full bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
          <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-blue-500" /> Report Criteria & Filtering
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Report Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="monthly">Monthly Report (This Month)</option>
              <option value="daily">Daily Report (Today)</option>
              <option value="dateRange">Custom Date Range</option>
              <option value="all">All Transactions (Full Ledger)</option>
              <option value="expenses">Expense Report (Cash Out)</option>
              <option value="cash_in">Income Report (Cash In)</option>
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5">Account Scoping</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Accounts (Consolidated)</option>
              {accountOptions.map((acc) => (
                <option key={acc.value} value={acc.value}>{acc.label}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5">Search Keywords</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search account, detail, TX..."
                className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-0.5">Sort Sequence</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Date Pickers for Custom Date Range */}
        {reportType === 'dateRange' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">From Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">To Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
        {/* Total Cash In */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Cash In</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
              {currency(summary.cashInAfn, 'AFN')}
            </div>
            {summary.usdIn > 0 && (
              <div className="text-[11px] font-bold text-emerald-600/80 dark:text-emerald-400/80 font-mono mt-0.5">
                + {currency(summary.usdIn, 'USD')}
              </div>
            )}
          </div>
        </div>

        {/* Total Cash Out */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Cash Out</span>
            <div className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 tabular-nums font-mono">
              {currency(summary.cashOutAfn, 'AFN')}
            </div>
            {summary.usdOut > 0 && (
              <div className="text-[11px] font-bold text-rose-600/80 dark:text-rose-400/80 font-mono mt-0.5">
                + {currency(summary.usdOut, 'USD')}
              </div>
            )}
          </div>
        </div>

        {/* Net AFN Balance */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Net AFN Balance</span>
            <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-lg sm:text-xl font-black tabular-nums font-mono ${summary.afnBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {currency(summary.afnBalance, 'AFN')}
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Net operating income
            </div>
          </div>
        </div>

        {/* Net USD Balance / Count */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Net USD / Transactions</span>
            <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums font-mono">
              {currency(summary.usdBalance, 'USD')}
            </div>
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
              {summary.count} transactions matched
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Report Table with Screen-Height Sticky Scroll */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className={`w-full max-h-[calc(100vh-320px)] min-h-[320px] overflow-y-auto ${fitToScreen ? 'overflow-x-hidden' : 'overflow-x-auto'}`}>
          <table className={fitToScreen ? "w-full table-fixed text-left border-collapse" : "w-full min-w-[1050px] text-left border-collapse"}>
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-xs">
              <tr className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                <th className={fitToScreen ? "py-2 px-2 text-center w-[3.5%]" : "py-2.5 px-3 text-center min-w-[40px]"}>#</th>
                <th className={fitToScreen ? "py-2 px-2 w-[10%]" : "py-2.5 px-3 min-w-[100px]"}>Date</th>
                <th className={fitToScreen ? "py-2 px-2 w-[12%]" : "py-2.5 px-3 min-w-[110px]"}>TX No</th>
                <th className={fitToScreen ? "py-2 px-2 w-[18%]" : "py-2.5 px-4 min-w-[180px]"}>Account Name</th>
                <th className={fitToScreen ? "py-2 px-2 w-[10%]" : "py-2.5 px-3 min-w-[100px]"}>Category</th>
                <th className={fitToScreen ? "py-2 px-2 w-[21.5%]" : "py-2.5 px-4 min-w-[200px]"}>Particulars Detail</th>
                <th className={fitToScreen ? "py-2 px-2 text-right w-[9.5%]" : "py-2.5 px-3 text-right min-w-[110px]"}>Cash In</th>
                <th className={fitToScreen ? "py-2 px-2 text-right w-[9.5%]" : "py-2.5 px-3 text-right min-w-[110px]"}>Cash Out</th>
                <th className={fitToScreen ? "py-2 px-2 text-right w-[9%]" : "py-2.5 px-3 text-right min-w-[100px]"}>USD</th>
                <th className={fitToScreen ? "py-2 px-1.5 text-center w-[6%]" : "py-2.5 px-2 text-center min-w-[70px]"}>Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-500 font-medium">
                    No transactions found matching the report criteria.
                  </td>
                </tr>
              ) : (
                filteredRows.map((tx, idx) => {
                  const cleanAccountName = unescapeText(tx.account_name);
                  const cleanDetail = unescapeText(tx.detail);
                  const cleanCategory = unescapeText(tx.category);

                  return (
                    <tr key={tx.id || idx} className="even:bg-slate-50/40 dark:even:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-200/50 dark:border-slate-800/50">
                      <td className={fitToScreen ? "py-1.5 px-2 text-center font-mono text-slate-400 text-[10.5px] font-medium" : "py-2 px-3 text-center font-mono text-slate-400 font-medium"}>
                        {idx + 1}
                      </td>
                      <td className={fitToScreen ? "py-1.5 px-2 font-bold text-slate-900 dark:text-slate-100 text-[10.5px] truncate" : "py-2 px-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap"}>
                        <DateDisplay value={tx.date} format={dateDisplayFormat} />
                      </td>
                      <td className={fitToScreen ? "py-1.5 px-2 font-mono text-slate-500 dark:text-slate-400 text-[10.5px] font-medium truncate" : "py-2 px-3 font-mono text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap"}>
                        {tx.transaction_no || '-'}
                      </td>
                      <td className={fitToScreen ? "py-1.5 px-2 font-extrabold text-slate-900 dark:text-white truncate" : "py-2 px-4 font-bold text-slate-900 dark:text-white"} title={cleanAccountName}>
                        <span className="truncate block text-[11px]">{cleanAccountName}</span>
                      </td>
                      <td className={fitToScreen ? "py-1.5 px-2 truncate" : "py-2 px-3"}>
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-block truncate max-w-full">
                          {cleanCategory ? cleanCategory.replace('_', ' ') : 'General'}
                        </span>
                      </td>
                      <td className={fitToScreen ? "py-1.5 px-2 text-slate-700 dark:text-slate-300 font-medium text-[10.5px] truncate" : "py-2 px-4 text-slate-700 dark:text-slate-300 font-medium max-w-xl"} title={cleanDetail}>
                        <span className="truncate block">{cleanDetail || '-'}</span>
                      </td>
                      <td className={fitToScreen ? "py-1.5 px-2 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-[10.5px] tabular-nums truncate" : "py-2 px-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap tabular-nums"}>
                        {Number(tx.cash_in_afn || 0) > 0 ? currency(tx.cash_in_afn, 'AFN') : '-'}
                      </td>
                      <td className={fitToScreen ? "py-1.5 px-2 text-right font-mono font-extrabold text-rose-600 dark:text-rose-400 text-[10.5px] tabular-nums truncate" : "py-2 px-3 text-right font-mono font-extrabold text-rose-600 dark:text-rose-400 whitespace-nowrap tabular-nums"}>
                        {Number(tx.cash_out_afn || 0) > 0 ? currency(tx.cash_out_afn, 'AFN') : '-'}
                      </td>
                      <td className={fitToScreen ? "py-1.5 px-2 text-right font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-[10.5px] tabular-nums truncate" : "py-2 px-3 text-right font-mono font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap tabular-nums"}>
                        {Number(tx.usd_in || 0) > 0 ? currency(tx.usd_in, 'USD') : Number(tx.usd_out || 0) > 0 ? `-${currency(tx.usd_out, 'USD')}` : '-'}
                      </td>
                      <td className={fitToScreen ? "py-1.5 px-1.5 text-center uppercase font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate" : "py-2 px-2 text-center uppercase font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap"}>
                        {tx.payment_method || 'cash'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
