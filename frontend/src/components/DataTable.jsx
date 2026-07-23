import { memo } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import TableSkeleton from './TableSkeleton';

function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  isLoading = false,
  loadingRowCount = 5,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your filters or search terms.',
  page = 1,
  pageCount = 1,
  totalRows = 0,
  rowOffset = 0,
  onPageChange,
  onSort,
  sortConfig,
  className = '',
  rowClassName,
  headerContent = null,
  renderMobileCard = null,
  minWidthClass = 'min-w-[1000px]'
}) {
  if (isLoading && data.length === 0) {
    return <TableSkeleton rows={loadingRowCount} columns={columns.length || 7} />;
  }

  return (
    <div className={`table-card ${className}`}>
      {headerContent && (
        <div className="card-header border-b border-slate-200/80 dark:border-slate-800 pb-4 mb-4">
          {headerContent}
        </div>
      )}
      
      {/* Mobile Cards Container */}
      {renderMobileCard && (
        <div className="mobile-cards-wrapper block md:hidden">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, rIdx) => (
              <div key={`mob-skel-${rIdx}`} className="mobile-transaction-card p-4 rounded-xl mb-3 animate-pulse bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
              </div>
            ))
          ) : data.length === 0 ? (
            <div className="empty-state flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="empty-state-illustration mb-4 text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 p-5 rounded-full shadow-inner inline-flex border border-indigo-200 dark:border-indigo-800">
                <SearchX size={36} />
              </div>
              <h4 className="text-slate-900 dark:text-slate-100 font-bold text-lg">{emptyTitle}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2 mx-auto leading-relaxed font-medium">
                {emptyDescription}
              </p>
            </div>
          ) : (
            data.map((row, rowIndex) => renderMobileCard(row, rowIndex, rowOffset))
          )}
        </div>
      )}

      <div className={`table-wrapper overflow-x-auto w-full rounded-xl border border-slate-200/80 dark:border-slate-800 ${renderMobileCard ? 'hidden md:block' : ''}`}>
        <table className={`accounting-table w-full ${minWidthClass} text-left border-collapse`}>
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const isCurrentSort = sortConfig?.key === col.key;
                return (
                  <th
                    key={col.key || idx}
                    className={`${col.className || ''} ${col.sortable ? 'p-0' : 'py-2.5 px-3.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap'}`}
                    style={col.style}
                    aria-sort={col.sortable && isCurrentSort ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => onSort?.(col.key)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'inherit',
                          font: 'inherit',
                          padding: '8px 12px',
                          width: '100%',
                          textAlign: col.align === 'right' ? 'right' : 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        {col.label}
                        <span style={{ display: 'inline-flex', opacity: isCurrentSort ? 1 : 0.3 }} aria-hidden="true">
                          {isCurrentSort && sortConfig.direction === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                        </span>
                      </button>
                    ) : (
                      <div className={col.align === 'right' ? 'text-right' : ''}>
                        {col.label}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
            {isLoading ? (
              Array.from({ length: loadingRowCount }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="skeleton-row border-b border-slate-100 dark:border-slate-800/40">
                  {columns.map((col, cIdx) => (
                    <td key={`skel-${rIdx}-${cIdx}`} className={col.className} style={{ padding: '8px 12px' }}>
                      <div className="skeleton-box animate-pulse rounded bg-slate-200 dark:bg-slate-800 h-4 w-full opacity-50" style={{ maxWidth: col.skeletonWidth || '100%' }}></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="empty-state-illustration mb-4 text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 p-5 rounded-full shadow-inner inline-flex border border-indigo-200 dark:border-indigo-800">
                      <SearchX size={36} />
                    </div>
                    <h4 className="text-slate-900 dark:text-slate-100 font-bold text-lg">{emptyTitle}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-2 mx-auto leading-relaxed font-medium">
                      {emptyDescription}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const keyVal = Reflect.get(row, keyField);
                const stableKey = (keyVal !== undefined && keyVal !== null) ? keyVal : `row-${rowIndex}`;
                
                if (row.isOpeningBalance) {
                  const isLedgerTable = columns.length === 11 || columns.length === 12 || columns.some((c) => c.key === 'balance');
                  const isTxTable = columns.length === 14;
                  
                  if (isTxTable) {
                    return (
                      <tr
                        key={stableKey}
                        className="opening-balance-row bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-200/80 dark:border-indigo-900/60 font-bold"
                        style={{ height: '38px' }}
                      >
                        <td colSpan={6} className="py-2 px-3 text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider whitespace-nowrap">
                          Previous month closing
                        </td>
                        <td className="py-2 px-3 text-xs text-right text-slate-400 font-mono whitespace-nowrap">-</td>
                        <td className="py-2 px-3 text-xs text-right text-slate-400 font-mono whitespace-nowrap">-</td>
                        <td className="py-2 px-3 text-xs text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {columns[8]?.render ? columns[8].render(row, rowIndex, rowOffset) : '-'}
                        </td>
                        <td className="py-2 px-3 text-xs text-right text-slate-400 font-mono whitespace-nowrap">-</td>
                        <td className="py-2 px-3 text-xs text-right text-slate-400 font-mono whitespace-nowrap">-</td>
                        <td className="py-2 px-3 text-xs text-right text-slate-400 font-mono whitespace-nowrap">-</td>
                        <td className="py-2 px-3 text-xs text-slate-400 whitespace-nowrap">-</td>
                        <td className="py-2 px-3 text-xs text-right text-slate-500 font-bold italic whitespace-nowrap">Opening</td>
                      </tr>
                    );
                  } else if (isLedgerTable) {
                    const balanceColIdx = columns.findIndex((c) => c.key === 'balance');
                    const spanBefore = balanceColIdx > 0 ? balanceColIdx : 5;
                    const spanAfter = Math.max(0, columns.length - spanBefore - 1);
                    return (
                      <tr
                        key={stableKey}
                        className="opening-balance-row bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-200/80 dark:border-indigo-900/60 font-bold"
                        style={{ height: '38px' }}
                      >
                        <td colSpan={spanBefore} className="py-2 px-3 text-xs font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider whitespace-nowrap">
                          Previous month closing / Opening Balance
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {balanceColIdx !== -1 && columns[balanceColIdx]?.render ? columns[balanceColIdx].render(row, rowIndex, rowOffset) : '-'}
                        </td>
                        {Array.from({ length: spanAfter }).map((_, aIdx) => (
                          <td key={`op-after-${aIdx}`} className="py-2 px-3 text-xs text-right text-slate-400 font-mono whitespace-nowrap">
                            {aIdx === spanAfter - 1 ? <span className="italic font-bold">Opening</span> : '-'}
                          </td>
                        ))}
                      </tr>
                    );
                  }
                }

                return (
                  <tr
                    key={stableKey}
                    className={`even:bg-slate-50/40 dark:even:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-200/60 dark:border-slate-800/60 ${typeof rowClassName === 'function' ? rowClassName(row) : rowClassName || ''}`}
                    dir={row.dir || 'auto'}
                  >
                    {columns.map((col, colIndex) => (
                      <td key={col.key || colIndex} className={`${col.className || ''} py-2.5 px-3.5 text-xs text-slate-700 dark:text-slate-200 ${col.align === 'right' ? 'text-right tabular-nums' : ''} whitespace-nowrap`} style={col.style}>
                        {col.render ? col.render(row, rowIndex, rowOffset) : Reflect.get(row, col.key)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalRows > 0 && !isLoading && onPageChange && (
        <div className="table-pagination flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 border-t border-slate-200/80 dark:border-slate-800 pt-4 mt-2 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          <span className="whitespace-nowrap font-medium">{'Showing '}{rowOffset + 1} to {Math.min(rowOffset + data.length, totalRows)} of {totalRows.toLocaleString('en-US')} entries</span>
          <div className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              className="ghost-btn flex items-center gap-1 disabled:opacity-50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <strong className="text-slate-800 dark:text-slate-200 font-mono text-xs px-2 font-bold">{'Page '}{page} of {pageCount}</strong>
            <button
              className="ghost-btn flex items-center gap-1 disabled:opacity-50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              type="button"
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
            >
              {'Next '} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(DataTable);
