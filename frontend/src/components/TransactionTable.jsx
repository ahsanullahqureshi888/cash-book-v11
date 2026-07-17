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
    { key: 'index', label: 'SN', render: (row, i, offset) => row.isOpeningBalance ? 'BF' : offset + i + 1, className: 'w-12 text-zinc-500 font-mono text-xs' },
    { key: 'date', label: 'Date', render: (row) => <DateDisplay value={row.date} format={dateDisplayFormat} />, className: 'w-24 whitespace-nowrap' },
    { key: 'transaction_no', label: 'TX No', render: (row) => <span title={row.transaction_no} className="text-zinc-500 text-xs font-mono">{row.transaction_no || '-'}</span>, className: 'w-20' },
    { key: 'account_name', label: 'Account', render: (row) => <strong className="font-semibold text-zinc-800 dark:text-zinc-200">{row.account_name}</strong>, className: 'w-40' },
    { key: 'detail', label: 'Detail', render: (row) => <span className="text-zinc-600 dark:text-zinc-400 text-xs">{row.detail}</span>, className: 'min-w-[150px]' },
    { key: 'category', label: 'Category', render: (row) => renderCategoryBadge(row.category, row.isOpeningBalance), className: 'w-24' },
    { key: 'cash_in_afn', label: 'Cash In AFN', render: (row) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{row.cash_in_afn ? currency(row.cash_in_afn) : '-'}</span>, className: 'w-28 text-right' },
    { key: 'cash_out_afn', label: 'Cash Out AFN', render: (row) => <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{row.cash_out_afn ? currency(row.cash_out_afn) : '-'}</span>, className: 'w-28 text-right' },
    { key: 'balance', label: 'Balance', render: (row) => <span className={`font-mono font-bold ${row.runningBalance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{currency(row.runningBalance)}</span>, className: 'w-28 text-right' },
    { key: 'usd_in', label: 'USD In', render: (row) => <span className="font-mono text-zinc-700 dark:text-zinc-300">{row.usd_in ? currency(row.usd_in, 'USD') : '-'}</span>, className: 'w-24 text-right' },
    { key: 'usd_out', label: 'USD Out', render: (row) => <span className="font-mono text-zinc-700 dark:text-zinc-300">{row.usd_out ? currency(row.usd_out, 'USD') : '-'}</span>, className: 'w-24 text-right' },
    { key: 'exchange_rate', label: 'Rate', render: (row) => <span className="text-xs font-mono text-zinc-500">{row.exchange_rate || '-'}</span>, className: 'w-20 text-right' },
    { key: 'note', label: 'Note', render: (row) => <span className="text-xs text-zinc-500 truncate max-w-[100px] block" title={row.note}>{row.note || '-'}</span>, className: 'w-32' },
    { 
      key: 'actions', 
      label: 'Actions', 
      className: 'w-32 text-right',
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
      />
    </div>
  );
}

export default memo(TransactionTable);
