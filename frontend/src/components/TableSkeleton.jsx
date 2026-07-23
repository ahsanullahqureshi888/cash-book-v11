import React from 'react';

export default function TableSkeleton({ rows = 6, columns = 7, title = "Loading Ledger Data..." }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-44"></div>
          <div className="h-4 bg-amber-100 dark:bg-amber-900/30 rounded-full w-20"></div>
        </div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-28"></div>
      </div>

      {/* Table headers skeleton */}
      <div className="grid grid-cols-7 gap-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3">
        {Array.from({ length: columns }).map((_, idx) => (
          <div key={`th-${idx}`} className="h-3 bg-slate-200 dark:bg-slate-700/80 rounded w-3/4"></div>
        ))}
      </div>

      {/* Table rows skeleton */}
      <div className="space-y-3 pt-1">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={`tr-${rIdx}`} className="grid grid-cols-7 gap-3 py-2.5 px-3 border-b border-slate-100 dark:border-slate-800/40 items-center">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={`td-${rIdx}-${cIdx}`}
                className={`h-4 bg-slate-200 dark:bg-slate-800 rounded ${cIdx === 2 ? 'w-full' : 'w-2/3'}`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
