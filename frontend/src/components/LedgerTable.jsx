import { useEffect, useMemo, useState } from 'react';
import { currency } from '../utils/format';
import DateDisplay from './DateDisplay';
import DataTable from './DataTable';

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
    { key: 'index', label: 'SN', align: 'center', render: (row, i, offset) => offset + i + 1, className: 'col-sn text-center text-slate-500 font-mono text-xs w-[40px] min-w-[45px] px-3 whitespace-nowrap' },
    { key: 'date', label: 'Date', align: 'center', render: (row) => <DateDisplay value={row.date} format={dateDisplayFormat} />, className: 'col-date text-center whitespace-nowrap min-w-[125px] px-4' },
    { 
      key: 'tx_detail', 
      label: 'TX / Detail', 
      align: 'left', 
      render: (row) => (
        <div className="flex flex-col min-w-0 py-0.5">
          <span title={row.transaction_no} className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400 tracking-tight whitespace-nowrap truncate block">
            {row.transaction_no || '-'}
          </span>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px] block" title={unescapeText(row.detail)}>
            {unescapeText(row.detail) || '-'}
          </span>
        </div>
      ), 
      className: 'col-detail min-w-[220px] px-4' 
    },
    { key: 'cash_in_afn', label: 'Cash In', align: 'right', render: (row) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs whitespace-nowrap tabular-nums block px-1">{row.cash_in_afn ? currency(row.cash_in_afn) : '-'}</span>, className: 'col-cash-in text-right whitespace-nowrap min-w-[140px] px-4' },
    { key: 'cash_out_afn', label: 'Cash Out', align: 'right', render: (row) => <span className="font-mono text-rose-600 dark:text-rose-400 font-bold text-xs whitespace-nowrap tabular-nums block px-1">{row.cash_out_afn ? currency(row.cash_out_afn) : '-'}</span>, className: 'col-cash-out text-right whitespace-nowrap min-w-[140px] px-4' },
    { key: 'balance', label: 'Balance', align: 'right', render: (row) => <span className={`font-mono font-black text-xs whitespace-nowrap tabular-nums block px-1 ${row.balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{currency(row.balance)}</span>, className: 'col-balance text-right whitespace-nowrap min-w-[145px] px-4' },
    { key: 'usd_in', label: 'USD In', align: 'right', render: (row) => <span className="font-mono text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap tabular-nums block px-1">{row.usd_in ? currency(row.usd_in, 'USD') : '-'}</span>, className: 'col-usd-in text-right whitespace-nowrap min-w-[110px] px-3' },
    { key: 'usd_out', label: 'USD Out', align: 'right', render: (row) => <span className="font-mono text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap tabular-nums block px-1">{row.usd_out ? currency(row.usd_out, 'USD') : '-'}</span>, className: 'col-usd-out text-right whitespace-nowrap min-w-[110px] px-3' },
    { key: 'exchange_rate', label: 'Rate', align: 'right', render: (row) => <span className="text-xs font-mono text-slate-500 whitespace-nowrap block px-1">{row.exchange_rate || '-'}</span>, className: 'col-rate text-right whitespace-nowrap min-w-[80px] px-3' },
    { key: 'note', label: 'Note', align: 'left', render: (row) => <span className="text-xs text-slate-500 truncate max-w-[130px] block" title={unescapeText(row.note)}>{unescapeText(row.note) || '-'}</span>, className: 'col-note min-w-[130px] px-4' },
    { 
      key: 'actions', 
      label: 'Actions', 
      align: 'right',
      className: 'col-actions text-right min-w-[100px] px-4 sticky right-0 bg-white dark:bg-zinc-900 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)]',
      render: (row) => (
        <button type="button" className="px-3 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap" onClick={() => onReceipt(row)}>Receipt</button>
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

  const renderMobileCard = (row, index, offset) => {
    if (row.isOpeningBalance) {
      return (
        <div key={row.id || `op-${index}`} className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/50 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-1 mb-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">Previous Month Closing / Opening Balance</span>
          <div className="flex items-center justify-between font-mono">
            <span className="text-xs text-slate-500 font-sans font-bold">Balance</span>
            <strong className="text-sm font-black text-slate-900 dark:text-white">{currency(row.balance)}</strong>
          </div>
        </div>
      );
    }

    const cleanDetail = unescapeText(row.detail);
    const cleanNote = unescapeText(row.note);

    return (
      <div key={row.id || `row-${index}`} className="glass-card p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs mb-3">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
              {row.transaction_no || `SN-${offset + index + 1}`}
            </span>
            <DateDisplay value={row.date} format={dateDisplayFormat} />
          </div>
          {onReceipt && (
            <button
              type="button"
              className="px-2.5 py-1 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              onClick={() => onReceipt(row)}
            >
              Receipt
            </button>
          )}
        </div>

        {/* Transaction Detail */}
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug break-words">
            {cleanDetail || 'Standard Ledger Voucher'}
          </p>
          {cleanNote && <p className="text-[11px] text-slate-400 mt-0.5 italic">{cleanNote}</p>}
        </div>

        {/* Amount Breakdown & Balance */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50/70 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs font-mono">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cash In / Out</span>
            {row.cash_in_afn ? (
              <strong className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                +{currency(row.cash_in_afn)}
              </strong>
            ) : row.cash_out_afn ? (
              <strong className="text-xs font-black text-rose-600 dark:text-rose-400 block mt-0.5">
                -{currency(row.cash_out_afn)}
              </strong>
            ) : (
              <span className="text-slate-400 text-xs">-</span>
            )}
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Running Balance</span>
            <strong className={`text-xs font-black block mt-0.5 ${row.balance >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
              {currency(row.balance)}
            </strong>
          </div>
        </div>
      </div>
    );
  };

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
      renderMobileCard={renderMobileCard}
      emptyTitle="No ledger entries found"
      emptyDescription="Create transactions to populate this ledger."
      minWidthClass="min-w-[1280px]"
    />
  );
}
