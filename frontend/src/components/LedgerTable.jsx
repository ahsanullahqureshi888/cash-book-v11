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
    { key: 'index', label: 'SN', align: 'center', render: (row, i, offset) => offset + i + 1, className: 'col-sn text-center text-slate-500 font-mono text-xs' },
    { key: 'date', label: 'Date', align: 'center', render: (row) => <DateDisplay value={row.date} format={dateDisplayFormat} />, className: 'col-date text-center whitespace-nowrap' },
    { key: 'transaction_no', label: 'TX No', align: 'center', render: (row) => <span title={row.transaction_no} className="text-slate-500 text-xs font-mono">{row.transaction_no || '-'}</span>, className: 'col-txno text-center' },
    { key: 'detail', label: 'Detail', align: 'left', render: (row) => <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">{row.detail}</span>, className: 'col-detail min-w-[180px]' },
    { key: 'cash_in_afn', label: 'Cash In', align: 'right', render: (row) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{row.cash_in_afn ? currency(row.cash_in_afn) : '-'}</span>, className: 'col-cash-in text-right' },
    { key: 'cash_out_afn', label: 'Cash Out', align: 'right', render: (row) => <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{row.cash_out_afn ? currency(row.cash_out_afn) : '-'}</span>, className: 'col-cash-out text-right' },
    { key: 'balance', label: 'Balance', align: 'right', render: (row) => <span className={`font-mono font-bold ${row.balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{currency(row.balance)}</span>, className: 'col-balance text-right' },
    { key: 'usd_in', label: 'USD In', align: 'right', render: (row) => <span className="font-mono text-slate-700 dark:text-slate-300">{row.usd_in ? currency(row.usd_in, 'USD') : '-'}</span>, className: 'col-usd-in text-right' },
    { key: 'usd_out', label: 'USD Out', align: 'right', render: (row) => <span className="font-mono text-slate-700 dark:text-slate-300">{row.usd_out ? currency(row.usd_out, 'USD') : '-'}</span>, className: 'col-usd-out text-right' },
    { key: 'exchange_rate', label: 'Rate', align: 'right', render: (row) => <span className="text-xs font-mono text-slate-500">{row.exchange_rate || '-'}</span>, className: 'col-rate text-right' },
    { key: 'note', label: 'Note', align: 'left', render: (row) => <span className="text-xs text-slate-500 truncate max-w-[110px] block" title={row.note}>{row.note || '-'}</span>, className: 'col-note' },
    { 
      key: 'actions', 
      label: 'Actions', 
      align: 'right',
      className: 'col-actions text-right',
      render: (row) => (
        <button type="button" className="receipt-btn" onClick={() => onReceipt(row)}>Receipt</button>
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
