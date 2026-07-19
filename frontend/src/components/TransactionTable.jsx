import { memo, useMemo } from 'react';
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
    if (isOpening) return <span className="category-badge badge-other">opening</span>;
    const cat = String(category || 'other').toLowerCase();
    if (cat === 'salary') return <span className="category-badge badge-salary">Salary</span>;
    if (cat === 'rent') return <span className="category-badge badge-rent">Rent</span>;
    if (cat.includes('expense')) {
      return <span className="category-badge badge-expense">{cat.replaceAll('_', ' ')}</span>;
    }
    return <span className="category-badge badge-other">{cat.replaceAll('_', ' ')}</span>;
  };

  const columns = useMemo(() => [
    { key: 'index', label: 'SN', render: (row, i, offset) => row.isOpeningBalance ? 'BF' : offset + i + 1, className: 'table-col-sn' },
    { key: 'date', label: 'Date', render: (row) => <DateDisplay value={row.date} format={dateDisplayFormat} />, className: 'table-col-date' },
    { key: 'transaction_no', label: 'TX No', render: (row) => <span title={row.transaction_no} className="text-zinc-500 text-xs font-mono">{row.transaction_no || '-'}</span>, className: 'table-col-ref' },
    { key: 'account_name', label: 'Account', render: (row) => <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{row.account_name}</strong>, className: 'table-col-account' },
    { key: 'detail', label: 'Detail', render: (row) => <span className="text-zinc-600 dark:text-zinc-400 text-xs">{row.detail}</span>, className: 'table-col-desc' },
    { key: 'category', label: 'Category', render: (row) => renderCategoryBadge(row.category, row.isOpeningBalance), className: 'table-col-category' },
    { key: 'cash_in_afn', label: 'Cash In AFN', render: (row) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{row.cash_in_afn ? currency(row.cash_in_afn) : '-'}</span>, className: 'table-col-cashin' },
    { key: 'cash_out_afn', label: 'Cash Out AFN', render: (row) => <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{row.cash_out_afn ? currency(row.cash_out_afn) : '-'}</span>, className: 'table-col-cashout' },
    { key: 'balance', label: 'Balance', render: (row) => <span className={`font-mono font-bold ${row.runningBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{currency(row.runningBalance)}</span>, className: 'table-col-balance' },
    { key: 'usd_in', label: 'USD In', render: (row) => <span className="font-mono text-zinc-700 dark:text-zinc-300">{row.usd_in ? currency(row.usd_in, 'USD') : '-'}</span>, className: 'table-col-usdin' },
    { key: 'usd_out', label: 'USD Out', render: (row) => <span className="font-mono text-zinc-700 dark:text-zinc-300">{row.usd_out ? currency(row.usd_out, 'USD') : '-'}</span>, className: 'table-col-usdout' },
    { key: 'exchange_rate', label: 'Rate', render: (row) => <span className="text-xs font-mono text-zinc-500">{row.exchange_rate || '-'}</span>, className: 'table-col-rate' },
    { key: 'note', label: 'Note', render: (row) => <span className="text-xs text-zinc-500 truncate max-w-[100px] block" title={row.note}>{row.note || '-'}</span>, className: 'table-col-note' },
    { 
      key: 'actions', 
      label: 'Actions', 
      className: 'table-col-actions',
      render: (row) => row.isOpeningBalance ? (
        <span className="text-xs text-zinc-400 italic">Opening</span>
      ) : (
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors" onClick={() => onEdit(row)}>Edit</button>
          <button type="button" className="text-xs font-medium text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors" onClick={() => onReceipt(row)}>Receipt</button>
          <button type="button" className="text-xs font-medium text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 transition-colors" onClick={() => onDelete(row.id)}>Delete</button>
        </div>
      )
    }
  ], [dateDisplayFormat, onEdit, onReceipt, onDelete]);

  const renderMobileCard = (row, i, offset) => {
    if (row.isOpeningBalance) {
      return (
        <div key={row.id || `open-${i}`} className="mobile-transaction-card opening-balance glass-card p-4 rounded-xl border-l-4 border-l-indigo-500 mb-3 bg-indigo-50/20 dark:bg-indigo-900/10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">Previous Month Closing</span>
            <span className="text-xs font-mono text-zinc-500">BF</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-zinc-500">Running Balance</span>
            <strong className={`font-mono text-sm ${row.runningBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
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
      <div key={row.id || i} className={`mobile-transaction-card glass-card p-4 rounded-xl mb-3 border-l-4 ${isCashIn ? 'border-l-emerald-500' : 'border-l-rose-500'}`} style={{ border: '1px solid var(--border)', borderLeftWidth: '4px' }}>
        {/* Card Header */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500"><DateDisplay value={row.date} format={dateDisplayFormat} /></span>
            <span className="text-[10px] font-mono text-zinc-400">TX: {row.transaction_no || '-'}</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCashIn ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'}`}>
            {isCashIn ? 'IN' : 'OUT'}
          </span>
        </div>

        {/* Card Body */}
        <div className="flex flex-col gap-1 my-3">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-xs text-zinc-500">Account:</span>
            <strong className="text-xs text-zinc-900 dark:text-zinc-100">{row.account_name}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-xs text-zinc-500">Category:</span>
            <span className="text-xs text-zinc-700 dark:text-zinc-300">{renderCategoryBadge(row.category, false)}</span>
          </div>
          {row.detail && (
            <p className="text-xs text-zinc-650 dark:text-zinc-350 mt-2 bg-black/5 dark:bg-white/5 p-2 rounded-lg italic">
              {row.detail}
            </p>
          )}
        </div>

        {/* Card Value */}
        <div className="flex justify-between items-end border-t border-zinc-200/50 dark:border-zinc-800/50 pt-3 mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500">Running Balance</span>
            <strong className={`font-mono text-sm ${row.runningBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
              {currency(row.runningBalance)}
            </strong>
          </div>
          <div className="flex flex-col items-end">
            <strong className={`font-mono text-base ${isCashIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {currency(amount)}
            </strong>
            {usdAmount > 0 && (
              <small className="text-[10px] font-mono text-zinc-500">
                {currency(usdAmount, 'USD')} @ {row.exchange_rate}
              </small>
            )}
          </div>
        </div>

        {/* Actions Tray */}
        <div className="flex justify-end gap-3 mt-3 pt-2 border-t border-zinc-200/20 dark:border-zinc-800/20">
          <button 
            type="button" 
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            onClick={() => onEdit(row)}
          >
            Edit
          </button>
          <button 
            type="button" 
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            onClick={() => onReceipt(row)}
          >
            Receipt
          </button>
          <button 
            type="button" 
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
            onClick={() => onDelete(row.id)}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  const headerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white drop-shadow-sm flex items-center gap-2">
          Live Ledger
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {totalRows.toLocaleString('en-US')} {totalRows === 1 ? 'record' : 'records'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden md:inline-block">
          {fullscreen ? 'Scroll horizontally to review every column' : 'Open a focused table workspace'}
        </span>
        <button
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/50 hover:bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all"
          type="button"
          onClick={onToggleFullscreen}
        >
          {fullscreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>
      </div>
    </div>
  );

  return (
    <div ref={tableRef} className={fullscreen ? 'fixed inset-4 z-50 overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col' : ''}>
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
        rowClassName={(row) => row.isOpeningBalance ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}
        renderMobileCard={renderMobileCard}
      />
    </div>
  );
}

export default memo(TransactionTable);
