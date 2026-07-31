import React, { useState } from 'react';
import { useTenant } from '../context/CompanyContext';
import { api } from '../services/api';

export function LedgerHeader() {
  const { activeCompany, activeBranch, switchBranch } = useTenant();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/export/csv', {
        params: { branch: activeBranch },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data || response]));
      const link = document.createElement('a');
      link.href = url;
      const cleanBranch = activeBranch ? activeBranch.replace(/[^a-z0-9]/gi, '_') : 'consolidated';
      const fileName = `${activeCompany?.id || 'tenant'}_${cleanBranch}_ledger.csv`;
      link.setAttribute('download', fileName.toLowerCase());
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("CSV Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const branches = activeCompany?.branches || ['All Branches (Consolidated)', 'Main Branch'];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
      {/* Branch Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
        {branches.map((branch) => (
          <button
            key={branch}
            onClick={() => switchBranch(branch)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeBranch === branch
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {branch}
          </button>
        ))}
      </div>

      {/* Export Action */}
      <button
        onClick={handleExportCSV}
        disabled={isExporting}
        className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{isExporting ? 'Generating Spreadsheet...' : 'Export CSV'}</span>
      </button>
    </div>
  );
}

export default LedgerHeader;
