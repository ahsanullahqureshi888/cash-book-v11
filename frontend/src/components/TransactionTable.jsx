import { memo, useMemo } from 'react';
import { SquarePen, Receipt, Trash2 } from 'lucide-react';
import { currency } from '../utils/format';
import DateDisplay from './DateDisplay';
import DataTable from './DataTable';

function TransactionTable({ 
  rows, 
  rowOffset, 
  page, 
  pageCount, 
  totalRows, 
  dateDisplayFormat, 
  onPageChange, 
  onEdit, 
  onDelete, 
  onReceipt, 
  onToggleFullscreen, 
  fullscreen, 
  tableRef,
  isLoading 
}) {

  const renderCategoryBadge = (category, isOpening) => {
    if (isOpening) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700">
          opening
        </span>
      );
    }
    const cat = String(category || 'other').toLowerCase();
    let badgeStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    if (cat === 'salary') {
      badgeStyle = 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200 border-blue-300 dark:border-blue-700';
    } else if (cat === 'rent') {
      badgeStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-700';
    } else if (cat.includes('expense') || cat.includes('factory')) {
      badgeStyle = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-700';
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${badgeStyle}`}>
        {cat.replaceAll('_', ' ')}
      </span>
    );
  };

  const columns = useMemo(() => [
    { key: 'index', label: 'SN', style: { width: '3.5%' }, render: (row, i, offset) => row.isOpeningBalance ? 'BF' : offset + i + 1, className: 'table-col-sn font-mono text-slate-500 dark:text-slate-400 font-bold text-center' },
    { key: 'date', label: 'DATE', style: { width: '8.5%' }, render: (row) => <span className="text-xs text-slate-800 dark:text-slate-200 font-bold whitespace-nowrap"><DateDisplay value={row.date} format={dateDisplayFormat} /></span>, className: 'table-col-date' },
    { 
      key: 'account_name', 
      label: 'REF / ACCOUNT', 
      style: { width: '15.5%' },
      render: (row) => (
        <div className="flex flex-col justify-center min-w-0">
          <span title={row.transaction_no} className="text-[10px] font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap block leading-tight font-semibold">
            {row.transaction_no || '-'}
          </span>
          <span title={row.account_name} className="text-xs font-black text-slate-900 dark:text-slate-100 truncate block max-w-full leading-tight">
            {row.account_name}
          </span>
        </div>
      ), 
      className: 'table-col-account' 
    },
    { key: 'detail', label: 'DETAIL', style: { width: '19%' }, render: (row) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate block max-w-full" title={row.detail}>{row.detail}</span>, className: 'table-col-desc' },
    { key: 'category', label: 'CATEGORY', style: { width: '7.5%' }, render: (row) => renderCategoryBadge(row.category, row.isOpeningBalance), className: 'table-col-category' },
    { key: 'cash_in_afn', label: 'CASH IN AFN', align: 'right', style: { width: '9%' }, render: (row) => <span className="font-mono text-xs tabular-nums text-emerald-600 dark:text-emerald-400 font-extrabold whitespace-nowrap">{row.cash_in_afn ? currency(row.cash_in_afn) : '-'}</span>, className: 'table-col-cashin' },
    { key: 'cash_out_afn', label: 'CASH OUT AFN', align: 'right', style: { width: '9%' }, render: (row) => <span className="font-mono text-xs tabular-nums text-rose-600 dark:text-rose-400 font-extrabold whitespace-nowrap">{row.cash_out_afn ? currency(row.cash_out_afn) : '-'}</span>, className: 'table-col-cashout' },
    { key: 'balance', label: 'BALANCE', align: 'right', style: { width: '9.5%' }, render: (row) => <span className={`font-mono text-xs tabular-nums font-black whitespace-nowrap ${row.runningBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{currency(row.runningBalance)}</span>, className: 'table-col-balance' },
    { key: 'usd_in', label: 'USD IN', align: 'right', style: { width: '6%' }, render: (row) => <span className="font-mono text-xs tabular-nums text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">{row.usd_in ? currency(row.usd_in, 'USD') : '-'}</span>, className: 'table-col-usdin' },
    { key: 'usd_out', label: 'USD OUT', align: 'right', style: { width: '6%' }, render: (row) => <span className="font-mono text-xs tabular-nums text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">{row.usd_out ? currency(row.usd_out, 'USD') : '-'}</span>, className: 'table-col-usdout' },
    { key: 'exchange_rate', label: 'RATE', align: 'right', style: { width: '3.5%' }, render: (row) => <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.exchange_rate || '-'}</span>, className: 'table-col-rate' },
    { key: 'note', label: 'NOTE', style: { width: '5.5%' }, render: (row) => <span className="text-xs text-slate-500 dark:text-slate-400 truncate block max-w-full" title={row.note}>{row.note || '-'}</span>, className: 'table-col-note' },
    { 
      key: 'actions', 
      label: 'ACTIONS', 
      align: 'right',
      style: { width: '3.5%' },
      className: 'table-col-actions text-right',
      render: (row) => row.isOpeningBalance ? (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold italic">BF</span>
      ) : (
        <div className="flex items-center justify-end gap-1">
          <button 
            type="button" 
            title="Edit Transaction"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors" 
            onClick={() => onEdit(row)}
          >
            <SquarePen size={14} />
          </button>
          <button 
            type="button" 
            title="Print Receipt"
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-colors" 
            onClick={() => onReceipt(row)}
          >
            <Receipt size={14} />
          </button>
          <button 
            type="button" 
            title="Delete Transaction"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 transition-colors" 
            onClick={() => onDelete(row.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ], [dateDisplayFormat, onEdit, onReceipt, onDelete]);

  const renderMobileCard = (row, i, offset) => {
    if (row.isOpeningBalance) {
      return (
        <div key={row.id || `open-${i}`} className="mobile-transaction-card opening-balance p-4 rounded-xl border-l-4 border-l-indigo-500 mb-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">Previous Month Closing</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">BF</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Running Balance</span>
            <strong className={`font-mono text-sm font-black ${row.runningBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {currency(row.runningBalance)}
            </strong>
          </div>
        </div>
      );
    }

    const isCashIn = row.transaction_type === 'cash_in';
    const amount = isCashIn ? row.cash_in_afn : row.cash_out_afn;
    const usdAmount = isCashIn ? row.usd_in : row.usd_out;

    return (
      <div key={row.id || i} className={`mobile-transaction-card p-4 rounded-xl mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${isCashIn ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
        {/* Card Header */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300"><DateDisplay value={row.date} format={dateDisplayFormat} /></span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-medium">TX: {row.transaction_no || '-'}</span>
          </div>
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${isCashIn ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'}`}>
            {isCashIn ? 'IN' : 'OUT'}
          </span>
        </div>

        {/* Card Body */}
        <div className="flex flex-col gap-1.5 my-3">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-xs text-slate-500 dark:text-slate-400">Account:</span>
            <strong className="text-xs text-slate-900 dark:text-slate-100 font-bold">{row.account_name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-xs text-slate-500 dark:text-slate-400">Category:</span>
            <span className="text-xs">{renderCategoryBadge(row.category, false)}</span>
          </div>
          {row.detail && (
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
              {row.detail}
            </p>
          )}
        </div>

        {/* Card Value */}
        <div className="flex justify-between items-end border-t border-slate-200/80 dark:border-slate-800 pt-3 mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Running Balance</span>
            <strong className={`font-mono text-sm font-black ${row.runningBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {currency(row.runningBalance)}
            </strong>
          </div>
          <div className="flex flex-col items-end">
            <strong className={`font-mono text-base font-extrabold ${isCashIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {currency(amount)}
            </strong>
            {usdAmount > 0 && (
              <small className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                {currency(usdAmount, 'USD')} @ {row.exchange_rate}
              </small>
            )}
          </div>
        </div>

        {/* Actions Tray */}
        <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button 
            type="button" 
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            onClick={() => onEdit(row)}
          >
            Edit
          </button>
          <button 
            type="button" 
            className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            onClick={() => onReceipt(row)}
          >
            Receipt
          </button>
          <button 
            type="button" 
            className="text-xs font-bold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
            onClick={() => onDelete(row.id)}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const headerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          Live Ledger
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
          {totalRows.toLocaleString('en-US')} {totalRows === 1 ? 'record' : 'records'} available in ledger
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:inline-block font-medium">
          {fullscreen ? 'Scroll horizontally to review every column' : 'Open a focused table workspace'}
        </span>
        <button
          className="px-4 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-xs transition-all"
          type="button"
          onClick={onToggleFullscreen}
        >
          {fullscreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>
      </div>
    </div>
  );

  return (
    <div ref={tableRef} className={fullscreen ? 'fixed inset-4 z-50 overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col' : ''}>
      <DataTable
        className={fullscreen ? 'h-full shadow-none border-none rounded-none' : ''}
        columns={columns}
        data={rows}
        keyField="id"
        isLoading={isLoading}
        page={page}
        pageCount={pageCount}
        totalRows={totalRows}
        rowOffset={rowOffset}
        onPageChange={onPageChange}
        headerContent={headerContent}
        rowClassName={(row) => row.isOpeningBalance ? 'bg-indigo-50/60 dark:bg-indigo-950/40' : ''}
        renderMobileCard={renderMobileCard}
      />
    </div>
  );
}

export default memo(TransactionTable);

