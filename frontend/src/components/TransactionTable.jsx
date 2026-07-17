import { memo } from 'react';
import { currency } from '../utils/format';
import DateDisplay from './DateDisplay';

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

  return (
    <div className={`glass-card table-card cashbook-records-card ${fullscreen ? 'table-card-fullscreen-active' : ''}`} ref={tableRef}>
      <div className="card-header records-table-header">
        <div className="records-table-heading">
          <p className="eyebrow">Live Ledger</p>
          <div className="records-table-title">
            <h3>Cash Book Records</h3>
            <span>{totalRows.toLocaleString('en-US')} {totalRows === 1 ? 'record' : 'records'}</span>
          </div>
        </div>
        <div className="records-table-actions">
          <span className="fullscreen-hint">{fullscreen ? 'Scroll horizontally to review every column' : 'Open a focused table workspace'}</span>
          <button className="ghost-btn fullscreen-toggle" type="button" onClick={onToggleFullscreen}>
            {fullscreen ? 'Exit Full Screen' : 'Full Screen'}
          </button>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="accounting-table cashbook-screen-table">
          <thead>
            <tr>
              <th className="col-index">SN</th>
              <th className="col-date">Date</th>
              <th className="col-tx">TX No</th>
              <th className="col-account">Account</th>
              <th className="col-detail">Detail</th>
              <th className="col-category">Category</th>
              <th className="col-amount">Cash In AFN</th>
              <th className="col-amount">Cash Out AFN</th>
              <th className="col-amount">Balance</th>
              <th className="col-amount">USD In</th>
              <th className="col-amount">USD Out</th>
              <th className="col-rate">Rate</th>
              <th className="col-note">Note</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="skeleton-row">
                  <td className="col-index"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '20px' }}></div></td>
                  <td className="col-date"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '70px' }}></div></td>
                  <td className="col-tx"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '50px' }}></div></td>
                  <td className="col-account"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '100px' }}></div></td>
                  <td className="col-detail"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '120px' }}></div></td>
                  <td className="col-category"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '60px' }}></div></td>
                  <td className="col-amount"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '60px', marginLeft: 'auto' }}></div></td>
                  <td className="col-amount"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '60px', marginLeft: 'auto' }}></div></td>
                  <td className="col-amount"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '75px', marginLeft: 'auto' }}></div></td>
                  <td className="col-amount"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '50px', marginLeft: 'auto' }}></div></td>
                  <td className="col-amount"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '50px', marginLeft: 'auto' }}></div></td>
                  <td className="col-rate"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '40px' }}></div></td>
                  <td className="col-note"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '80px' }}></div></td>
                  <td className="col-actions"><div className="skeleton-box animate-pulse" style={{ height: '16px', width: '120px' }}></div></td>
                </tr>
              ))
            ) : !rows.length ? (
              <tr>
                <td colSpan="14">
                  <div className="empty-state flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="empty-state-illustration mb-3 text-zinc-400 dark:text-zinc-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <h4 className="text-zinc-900 dark:text-zinc-100 font-semibold text-base">No records found</h4>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-sm mt-1 mx-auto">
                      No cash book records match the current filters. Try adjusting dates or keywords.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} dir="auto" className={row.isOpeningBalance ? 'opening-balance-row' : undefined}>
                  <td className="col-index">{row.isOpeningBalance ? 'BF' : rowOffset + index + 1}</td>
                  <td className="col-date"><DateDisplay value={row.date} format={dateDisplayFormat} /></td>
                  <td className="col-tx" title={row.transaction_no}>{row.transaction_no || '-'}</td>
                  <td className="col-account">{row.account_name}</td>
                  <td className="col-detail">{row.detail}</td>
                  <td className="col-category">
                    {renderCategoryBadge(row.category, row.isOpeningBalance)}
                  </td>
                  <td className="money-cell col-amount balance-positive">{row.cash_in_afn ? currency(row.cash_in_afn) : '-'}</td>
                  <td className="money-cell col-amount balance-negative">{row.cash_out_afn ? currency(row.cash_out_afn) : '-'}</td>
                  <td className={`money-cell col-amount ${row.runningBalance >= 0 ? 'balance-positive' : 'balance-negative'}`}>{currency(row.runningBalance)}</td>
                  <td className="money-cell col-amount">{row.usd_in ? currency(row.usd_in, 'USD') : '-'}</td>
                  <td className="money-cell col-amount">{row.usd_out ? currency(row.usd_out, 'USD') : '-'}</td>
                  <td className="col-rate">{row.exchange_rate}</td>
                  <td className="col-note">{row.note || '-'}</td>
                  <td className="col-actions">
                    {row.isOpeningBalance ? (
                      <span className="muted">Opening</span>
                    ) : (
                      <div className="row-actions">
                        <button className="ghost-btn table-action" onClick={() => onEdit(row)}>Edit</button>
                        <button className="ghost-btn table-action" onClick={() => onReceipt(row)}>Receipt</button>
                        <button className="ghost-btn table-action" onClick={() => onDelete(row.id)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {totalRows > 0 && !isLoading && (
        <div className="table-pagination" aria-label="Cash book pagination">
          <span>{rowOffset + 1}-{Math.min(rowOffset + rows.length, totalRows)} of {totalRows.toLocaleString('en-US')}</span>
          <div>
            <button className="ghost-btn" type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
            <strong>Page {page} of {pageCount}</strong>
            <button className="ghost-btn" type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(TransactionTable);
