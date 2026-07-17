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
  headerContent = null
}) {

  return (
    <div className={`glass-card table-card ${className}`}>
      {headerContent && (
        <div className="card-header border-b border-white/10 dark:border-zinc-800/50 pb-4 mb-4">
          {headerContent}
        </div>
      )}
      <div className="table-wrapper overflow-x-auto">
        <table className="accounting-table w-full text-left border-collapse">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`${col.className || ''} ${col.sortable ? 'cursor-pointer select-none hover:bg-white/5 dark:hover:bg-white/5 transition-colors' : ''}`}
                  onClick={() => {
                    if (col.sortable && onSort) {
                      onSort(col.key);
                    }
                  }}
                  style={col.style}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    {col.label}
                    {col.sortable && sortConfig?.key === col.key && (
                      <span className="text-indigo-500">
                        {sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: loadingRowCount }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="skeleton-row border-b border-white/5 dark:border-zinc-800/30">
                  {columns.map((col, cIdx) => (
                    <td key={`skel-${rIdx}-${cIdx}`} className={col.className}>
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
              data.map((row, rowIndex) => (
                <tr
                  key={Reflect.get(row, keyField) || rowIndex}
                  className={`border-b border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${typeof rowClassName === 'function' ? rowClassName(row) : rowClassName || ''}`}
                  dir={row.dir || 'auto'}
                >
                  {columns.map((col, colIndex) => (
                    <td key={col.key || colIndex} className={`${col.className || ''} py-4 px-4 text-sm ${col.align === 'right' ? 'text-right tabular-nums' : ''}`} style={col.style}>
                      {col.render ? col.render(row, rowIndex, rowOffset) : Reflect.get(row, col.key)}
                    </td>
                  ))}
                </tr>
              ))
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
