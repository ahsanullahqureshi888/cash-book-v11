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
    { key: 'index', label: 'SN', align: 'center', render: (row, i, offset) => offset + i + 1, className: 'col-sn text-center text-slate-500 font-mono text-xs w-[4%] min-w-[45px] px-3 whitespace-nowrap' },
    { key: 'date', label: 'Date', align: 'center', render: (row) => <DateDisplay value={row.date} format={dateDisplayFormat} />, className: 'col-date text-center whitespace-nowrap w-[10%] min-w-[110px] px-3' },
    { 
      key: 'tx_detail', 
      label: 'TX / Detail', 
      align: 'left', 
      render: (row) => (
        <div className="flex flex-col min-w-0 py-0.5">
          <span title={row.transaction_no} className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400 tracking-tight whitespace-nowrap truncate block">
            {row.transaction_no || '-'}
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px] block" title={row.detail}>
            {row.detail || '-'}
          </span>
        </div>
      ), 
      className: 'col-detail w-[21%] min-w-[210px] px-3' 
    },
    { key: 'cash_in_afn', label: 'Cash In', align: 'right', render: (row) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs whitespace-nowrap tabular-nums">{row.cash_in_afn ? currency(row.cash_in_afn) : '-'}</span>, className: 'col-cash-in text-right whitespace-nowrap w-[11%] min-w-[130px] px-3' },
    { key: 'cash_out_afn', label: 'Cash Out', align: 'right', render: (row) => <span className="font-mono text-rose-600 dark:text-rose-400 font-bold text-xs whitespace-nowrap tabular-nums">{row.cash_out_afn ? currency(row.cash_out_afn) : '-'}</span>, className: 'col-cash-out text-right whitespace-nowrap w-[11%] min-w-[130px] px-3' },
    { key: 'balance', label: 'Balance', align: 'right', render: (row) => <span className={`font-mono font-black text-xs whitespace-nowrap tabular-nums ${row.balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{currency(row.balance)}</span>, className: 'col-balance text-right whitespace-nowrap w-[12%] min-w-[135px] px-3' },
    { key: 'usd_in', label: 'USD In', align: 'right', render: (row) => <span className="font-mono text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap tabular-nums">{row.usd_in ? currency(row.usd_in, 'USD') : '-'}</span>, className: 'col-usd-in text-right whitespace-nowrap w-[8%] min-w-[100px] px-3' },
    { key: 'usd_out', label: 'USD Out', align: 'right', render: (row) => <span className="font-mono text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap tabular-nums">{row.usd_out ? currency(row.usd_out, 'USD') : '-'}</span>, className: 'col-usd-out text-right whitespace-nowrap w-[8%] min-w-[100px] px-3' },
    { key: 'exchange_rate', label: 'Rate', align: 'right', render: (row) => <span className="text-xs font-mono text-slate-500 whitespace-nowrap">{row.exchange_rate || '-'}</span>, className: 'col-rate text-right whitespace-nowrap w-[5%] min-w-[65px] px-2' },
    { key: 'note', label: 'Note', align: 'left', render: (row) => <span className="text-xs text-slate-500 truncate max-w-[110px] block" title={row.note}>{row.note || '-'}</span>, className: 'col-note w-[9%] min-w-[110px] px-3' },
    { 
      key: 'actions', 
      label: 'Actions', 
      align: 'right',
      className: 'col-actions text-right w-[7%] min-w-[95px] px-3 sticky right-0 bg-white dark:bg-zinc-900 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)]',
      render: (row) => (
        <button type="button" className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap" onClick={() => onReceipt(row)}>Receipt</button>
      )
    }
  ], [dateDisplayFormat, onReceipt]);

  const headerContent = (
    <div className="flex items-center justify-between gap-3 w-full pb-0.5">
      <div className="flex items-center gap-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Ledger Entries</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60">
          {rows.length} {rows.length === 1 ? 'record' : 'records'}
        </span>
      </div>
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
      minWidthClass="min-w-[1125px]"
    />
  );
}
