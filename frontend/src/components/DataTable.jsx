import { memo } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';

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
  renderMobileCard = null
}) {

  return (
    <div className={`glass-card table-card ${className}`}>
      {headerContent && (
        <div className="card-header border-b border-white/10 dark:border-zinc-800/50 pb-4 mb-4">
          {headerContent}
        </div>
      )}
      
      {/* Mobile Cards Container */}
      {renderMobileCard && (
        <div className="mobile-cards-wrapper block md:hidden">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, rIdx) => (
              <div key={`mob-skel-${rIdx}`} className="mobile-transaction-card glass-card p-4 rounded-xl mb-3 animate-pulse bg-zinc-100/50 dark:bg-zinc-800/20" style={{ border: '1px solid var(--border)' }}>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-850 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-855 rounded w-full mb-2"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-860 rounded w-2/3"></div>
              </div>
            ))
          ) : data.length === 0 ? (
            <div className="empty-state flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="empty-state-illustration mb-4 text-indigo-400/80 dark:text-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-full shadow-inner inline-flex border border-indigo-100 dark:border-indigo-800/30">
                <SearchX size={36} />
              </div>
              <h4 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">{emptyTitle}</h4>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mt-2 mx-auto leading-relaxed">
                {emptyDescription}
              </p>
            </div>
          ) : (
            data.map((row, rowIndex) => renderMobileCard(row, rowIndex, rowOffset))
          )}
        </div>
      )}

      <div className={`table-wrapper overflow-x-auto ${renderMobileCard ? 'hidden md:block' : ''}`}>
        <table className="accounting-table w-full text-left border-collapse">
          <thead>
            <tr>
              {columns.map((col, idx) => {
                const isCurrentSort = sortConfig?.key === col.key;
                return (
                  <th
                    key={col.key || idx}
                    className={`${col.className || ''} ${col.sortable ? 'p-0' : 'py-3 px-4'}`}
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
                          padding: '12px 16px',
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
          <tbody>
            {isLoading ? (
              Array.from({ length: loadingRowCount }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="skeleton-row border-b border-white/5 dark:border-zinc-800/30">
                  {columns.map((col, cIdx) => (
                    <td key={`skel-${rIdx}-${cIdx}`} className={col.className} style={{ padding: '12px 16px' }}>
                      <div className="skeleton-box animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 h-4 w-full opacity-50" style={{ maxWidth: col.skeletonWidth || '100%' }}></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="empty-state-illustration mb-4 text-indigo-400/80 dark:text-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-full shadow-inner inline-flex border border-indigo-100 dark:border-indigo-800/30">
                      <SearchX size={36} />
                    </div>
                    <h4 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">{emptyTitle}</h4>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mt-2 mx-auto leading-relaxed">
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
                  const isLedgerTable = columns.length === 12;
                  const isTxTable = columns.length === 14;
                  
                  if (isTxTable) {
                    return (
                      <tr
                        key={stableKey}
                        className="opening-balance-row bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-zinc-200/50 dark:border-zinc-800/50 font-medium"
                        style={{ height: '36px' }}
                      >
                        <td colSpan={6} className="py-1 px-4 text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                          Previous month closing
                        </td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 font-mono">-</td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 font-mono">-</td>
                        <td className="py-1 px-4 text-sm text-right font-mono font-bold text-zinc-900 dark:text-white">
                          {columns[8]?.render ? columns[8].render(row, rowIndex, rowOffset) : '-'}
                        </td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 font-mono">-</td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 font-mono">-</td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 font-mono">-</td>
                        <td className="py-1 px-4 text-sm text-zinc-400">-</td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 italic">Opening</td>
                      </tr>
                    );
                  } else if (isLedgerTable) {
                    return (
                      <tr
                        key={stableKey}
                        className="opening-balance-row bg-indigo-50/40 dark:bg-indigo-950/20 border-b border-zinc-200/50 dark:border-zinc-800/50 font-medium"
                        style={{ height: '36px' }}
                      >
                        <td colSpan={4} className="py-1 px-4 text-xs font-semibold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                          Previous month closing
                        </td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 font-mono">-</td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 font-mono">-</td>
                        <td className="py-1 px-4 text-sm text-right font-mono font-bold text-zinc-900 dark:text-white">
                          {columns[6]?.render ? columns[6].render(row, rowIndex, rowOffset) : '-'}
                        </td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 font-mono">-</td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 font-mono">-</td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 font-mono">-</td>
                        <td className="py-1 px-4 text-sm text-zinc-400">-</td>
                        <td className="py-1 px-4 text-sm text-right text-zinc-400 italic">Opening</td>
                      </tr>
                    );
                  }
                }

                return (
                  <tr
                    key={stableKey}
                    className={`border-b border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${typeof rowClassName === 'function' ? rowClassName(row) : rowClassName || ''}`}
                    dir={row.dir || 'auto'}
                  >
                    {columns.map((col, colIndex) => (
                      <td key={col.key || colIndex} className={`${col.className || ''} py-4 px-4 text-sm ${col.align === 'right' ? 'text-right tabular-nums' : ''}`} style={col.style}>
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
        <div className="table-pagination flex items-center justify-between border-t border-white/10 dark:border-zinc-800/50 pt-4 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{'Showing '}{rowOffset + 1} to {Math.min(rowOffset + data.length, totalRows)} of {totalRows.toLocaleString('en-US')} entries</span>
          <div className="flex items-center gap-3">
            <button
              className="ghost-btn flex items-center gap-1 disabled:opacity-50"
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <strong className="text-zinc-700 dark:text-zinc-300">{'Page '}{page} of {pageCount}</strong>
            <button
              className="ghost-btn flex items-center gap-1 disabled:opacity-50"
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
