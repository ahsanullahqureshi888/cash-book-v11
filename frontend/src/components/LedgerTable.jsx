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
    { key: 'index', label: 'SN', render: (row, i, offset) => offset + i + 1, className: 'w-12 text-zinc-500 font-mono text-xs' },
    { key: 'date', label: 'Date', render: (row) => <DateDisplay value={row.date} format={dateDisplayFormat} />, className: 'w-24 whitespace-nowrap' },
    { key: 'transaction_no', label: 'TX No', render: (row) => <span title={row.transaction_no} className="text-zinc-500 text-xs font-mono">{row.transaction_no || '-'}</span>, className: 'w-20' },
    { key: 'detail', label: 'Detail', render: (row) => <span className="text-zinc-600 dark:text-zinc-400 text-xs">{row.detail}</span>, className: 'min-w-[150px]' },
    { key: 'cash_in_afn', label: 'Cash In', align: 'right', render: (row) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{row.cash_in_afn ? currency(row.cash_in_afn) : '-'}</span>, className: 'w-24 text-right' },
    { key: 'cash_out_afn', label: 'Cash Out', align: 'right', render: (row) => <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{row.cash_out_afn ? currency(row.cash_out_afn) : '-'}</span>, className: 'w-24 text-right' },
    { key: 'balance', label: 'Balance', align: 'right', render: (row) => <span className={`font-mono font-bold ${row.balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{currency(row.balance)}</span>, className: 'w-28 text-right' },
    { key: 'usd_in', label: 'USD In', align: 'right', render: (row) => <span className="font-mono text-zinc-700 dark:text-zinc-300">{row.usd_in ? currency(row.usd_in, 'USD') : '-'}</span>, className: 'w-24 text-right' },
    { key: 'usd_out', label: 'USD Out', align: 'right', render: (row) => <span className="font-mono text-zinc-700 dark:text-zinc-300">{row.usd_out ? currency(row.usd_out, 'USD') : '-'}</span>, className: 'w-24 text-right' },
    { key: 'exchange_rate', label: 'Rate', align: 'right', render: (row) => <span className="text-xs font-mono text-zinc-500">{row.exchange_rate || '-'}</span>, className: 'w-20 text-right' },
    { key: 'note', label: 'Note', render: (row) => <span className="text-xs text-zinc-500 truncate max-w-[100px] block" title={row.note}>{row.note || '-'}</span>, className: 'w-32' },
    { 
      key: 'actions', 
      label: 'Actions', 
      align: 'right',
      className: 'w-20 text-right',
      render: (row) => (
        <button type="button" className="text-xs font-medium text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors" onClick={() => onReceipt(row)}>Receipt</button>
      )
    }
  ], [dateDisplayFormat, onReceipt]);

  const headerContent = (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Ledger Entries</h3>
      <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-3 py-1 text-xs font-bold rounded-full">
        {rows.length} records
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
      emptyTitle="No entries found"
      emptyDescription="This account has no ledger entries yet."
    />
  );
}
