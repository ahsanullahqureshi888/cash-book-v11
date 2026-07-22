import React from 'react';

/**
 * Premium Skeleton Loader for accounting tables using Tailwind animate-pulse.
 */
export default function TableSkeleton({ rows = 6, cols = 8 }) {
  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 animate-pulse">
      {/* Table Header Skeleton */}
      <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        {Array.from({ length: cols }).map((_, idx) => (
          <div key={idx} className="h-3.5 bg-slate-300 dark:bg-slate-700 rounded w-16" />
        ))}
      </div>

      {/* Table Row Skeletons */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-4 py-3.5 flex items-center justify-between gap-4">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-6" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-32" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-28" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
