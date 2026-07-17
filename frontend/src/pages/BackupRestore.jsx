import { DatabaseBackup, Download, FileJson, FileSpreadsheet, HardDriveDownload, Trash2, Upload } from 'lucide-react';

export default function BackupRestore({
  onBackup,
  onImportClick,
  onImportFile,
  onCsvImportClick,
  onCsvImportFile,
  onDownloadCsvTemplate,
  onClear,
  fileRef,
  csvFileRef,
  status,
  lastBackup
}) {
  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">System Backup & Restore</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage data security, exports, and historical imports</p>
        </div>
      </header>

      {status && (
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-800 dark:text-indigo-300 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {status}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Export / Backup Panel */}
        <div className="glass-card p-6 rounded-2xl border-2 border-emerald-500/10 shadow-emerald-500/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <DatabaseBackup size={18} className="text-emerald-500" />
              Backup Data
            </h3>
            {lastBackup && (
              <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                Last: {lastBackup}
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Download a complete JSON snapshot of your database. This includes all accounts, transactions, employees, and settings. Store this securely.
            </p>
            <button 
              className="primary-btn w-full py-3.5 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base font-bold" 
              onClick={onBackup}
            >
              <Download size={18} /> Export Full JSON Backup
            </button>
          </div>
        </div>

        {/* Restore / Import Panel */}
        <div className="glass-card p-6 rounded-2xl border-2 border-indigo-500/10 shadow-indigo-500/5">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <HardDriveDownload size={18} className="text-indigo-500" />
            Restore & Import
          </h3>
          
          <div className="flex flex-col gap-4">
            {/* JSON Restore */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-1.5">
                <FileJson size={16} className="text-zinc-500" /> Restore JSON Backup
              </h4>
              <p className="text-xs text-zinc-500 mb-3">Restore the system exactly as it was when the backup was taken. This replaces current data.</p>
              <button className="ghost-btn w-full border-zinc-300 dark:border-zinc-600 font-semibold flex items-center justify-center gap-2" onClick={onImportClick}>
                <Upload size={16} /> Import JSON Backup
              </button>
            </div>

            {/* CSV Import */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-1.5">
                <FileSpreadsheet size={16} className="text-zinc-500" /> Bulk Import CSV
              </h4>
              <p className="text-xs text-zinc-500 mb-3">Import historic cash book records from Excel. Requires date, account_name, detail, and amounts.</p>
              <div className="flex gap-2">
                <button className="secondary-btn flex-1 flex items-center justify-center gap-2 text-sm" onClick={onCsvImportClick}>
                  <Upload size={16} /> Upload CSV
                </button>
                <button className="ghost-btn flex-1 flex items-center justify-center gap-2 text-sm" onClick={onDownloadCsvTemplate}>
                  <Download size={16} /> Template
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone Panel */}
        <div className="md:col-span-2 mt-4 glass-card p-6 rounded-2xl border-2 border-rose-500/20 bg-rose-50/30 dark:bg-rose-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-2">
                <Trash2 size={18} /> Danger Zone
              </h3>
              <p className="text-sm text-rose-600/80 dark:text-rose-400/80">
                Permanently delete all accounts, transactions, and settings. This cannot be undone unless you have a JSON backup.
              </p>
            </div>
            <button className="danger-btn py-2.5 px-6 shrink-0 whitespace-nowrap shadow-sm font-bold flex items-center gap-2" onClick={onClear}>
              <Trash2 size={16} /> Factory Reset Database
            </button>
          </div>
        </div>

      </div>

      {/* Hidden file inputs */}
      <input type="file" ref={fileRef} accept="application/json" hidden onChange={onImportFile} />
      <input type="file" ref={csvFileRef} accept=".csv,text/csv" hidden onChange={onCsvImportFile} />
    </div>
  );
}
