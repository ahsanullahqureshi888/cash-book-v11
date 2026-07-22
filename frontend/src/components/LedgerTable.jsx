import { useEffect, useMemo, useState } from 'react';
import { currency } from '../utils/format';
import DateDisplay from './DateDisplay';
import DataTable from './DataTable';

const LEDGER_PAGE_SIZE = 50;

export default function LedgerTable({ rows, dateDisplayFormat, onReceipt }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / LEDGER_PAGE_SIZE));
  const pageStart = (page - 1) * LEDGER_PAGE_SIZE;
  const visibleRows = useMemo(() => rows.slice(pageStart, pageStart + LEDGER_PAGE_SIZE), [rows, pageStart]);

  useEffect(() => {
    setPage(1);
  }, [rows]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const columns = useMemo(() => [
    { key: 'index', label: 'SN', align: 'center', width: '4%', render: (row, i, offset) => offset + i + 1, className: 'col-sn text-center text-slate-500 font-mono text-xs' },
    { key: 'date', label: 'Date', align: 'center', width: '10%', render: (row) => <DateDisplay value={row.date} format={dateDisplayFormat} />, className: 'col-date text-center whitespace-nowrap' },
    { 
      key: 'tx_detail', 
      label: 'TX / Detail', 
      align: 'left', 
      width: '24%',
      render: (row) => (
        <div className="flex flex-col min-w-0">
          <span title={row.transaction_no} className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400 tracking-tight">
            {row.transaction_no || '-'}
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={row.detail}>
            {row.detail || '-'}
          </span>
        </div>
      ), 
      className: 'col-detail' 
    },
    { key: 'cash_in_afn', label: 'Cash In', align: 'right', width: '10%', render: (row) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs whitespace-nowrap tabular-nums">{row.cash_in_afn ? currency(row.cash_in_afn) : '-'}</span>, className: 'col-cash-in text-right' },
    { key: 'cash_out_afn', label: 'Cash Out', align: 'right', width: '10%', render: (row) => <span className="font-mono text-rose-600 dark:text-rose-400 font-bold text-xs whitespace-nowrap tabular-nums">{row.cash_out_afn ? currency(row.cash_out_afn) : '-'}</span>, className: 'col-cash-out text-right' },
    { key: 'balance', label: 'Balance', align: 'right', width: '11%', render: (row) => <span className={`font-mono font-black text-xs whitespace-nowrap tabular-nums ${row.balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{currency(row.balance)}</span>, className: 'col-balance text-right' },
    { key: 'usd_in', label: 'USD In', align: 'right', width: '8%', render: (row) => <span className="font-mono text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap tabular-nums">{row.usd_in ? currency(row.usd_in, 'USD') : '-'}</span>, className: 'col-usd-in text-right' },
    { key: 'usd_out', label: 'USD Out', align: 'right', width: '8%', render: (row) => <span className="font-mono text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap tabular-nums">{row.usd_out ? currency(row.usd_out, 'USD') : '-'}</span>, className: 'col-usd-out text-right' },
    { key: 'exchange_rate', label: 'Rate', align: 'right', width: '5%', render: (row) => <span className="text-xs font-mono text-slate-500 whitespace-nowrap">{row.exchange_rate || '-'}</span>, className: 'col-rate text-right' },
    { key: 'note', label: 'Note', align: 'left', width: '6%', render: (row) => <span className="text-xs text-slate-500 truncate max-w-[80px] block" title={row.note}>{row.note || '-'}</span>, className: 'col-note' },
    { 
      key: 'actions', 
      label: 'Actions', 
      align: 'right',
      width: '4%',
      className: 'col-actions text-right',
      render: (row) => (
        <button type="button" className="receipt-btn px-2 py-1 text-[11px]" onClick={() => onReceipt(row)}>Receipt</button>
      )
    }
  ], [dateDisplayFormat, onReceipt]);

  const headerContent = (
    <div className="table-card-header flex items-center justify-between">
      <h3 className="table-card-title text-base font-bold text-slate-900 dark:text-white">Ledger Entries</h3>
      <span className="record-count-badge">
        {rows.length} {rows.length === 1 ? 'record' : 'records'}
      </span>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={visibleRows}
      keyField="id"
      page={page}
      pageCount={pageCount}
      totalRows={rows.length}
      rowOffset={pageStart}
      onPageChange={setPage}
      headerContent={headerContent}
      emptyTitle="No ledger entries found"
      emptyDescription="Create transactions to populate this ledger."
    />
  );
}
