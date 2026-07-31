import React, { useState, useRef, useCallback } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  Building2,
  Layers,
  Database
} from 'lucide-react';
import BaseModal from './BaseModal';
import { api } from '../services/api';
import { useToast } from './ToastProvider';

export default function ExcelImportModal({ isOpen, onClose, onSuccess }) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState(null);

  const validateAndSetFile = (file) => {
    if (!file) return;
    setError('');
    setImportResult(null);

    const fileName = file.name || '';
    const isExcel = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');

    if (!isExcel) {
      setError('Invalid file type. Please upload a valid Excel Master file (.xlsx or .xls).');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setIsDragging(true);
  }, [uploading]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  }, [uploading]);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setError('');
    setImportResult(null);

    try {
      const result = await api.importMasterExcel(selectedFile);
      setImportResult(result);
      showToast('Ledger data imported successfully.', 'success');
      
      if (onSuccess) {
        onSuccess(result);
      }

      // Auto close after 2.5s to let user view success summary
      setTimeout(() => {
        if (onClose) onClose();
      }, 2500);
    } catch (err) {
      console.error('Failed to import Master Excel:', err);
      const errMsg = err.message || 'Failed to import Master Excel ledger. Please check file format.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setError('');
    setImportResult(null);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModalClose = () => {
    if (uploading) return;
    resetState();
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Import Master Excel Ledger"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6 text-slate-900 dark:text-slate-100">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Informational Header */}
        <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex items-start gap-3">
          <FileSpreadsheet className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-blue-900 dark:text-blue-200">
              Sky Ariana Ltd — Master Ledger Importer
            </p>
            <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
              Upload your multi-sheet master spreadsheet (.xlsx / .xls). All 40+ sheets will be automatically parsed into accounts and transactions.
            </p>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl transition-all p-8 sm:p-10 flex flex-col items-center justify-center cursor-pointer text-center relative overflow-hidden ${
            uploading
              ? 'opacity-75 cursor-not-allowed border-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : isDragging
              ? 'border-blue-500 bg-blue-100/70 dark:bg-blue-950/60 scale-[1.01]'
              : error
              ? 'border-rose-400 bg-rose-50/40 dark:bg-rose-950/20'
              : selectedFile
              ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 hover:border-blue-500'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-3 py-2">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Processing historical records from Excel...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Parsing sheets and creating transactions. Please do not close this window...
              </p>
            </div>
          ) : selectedFile ? (
            <div className="flex flex-col items-center space-y-3 py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <FileCheck className="w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for master import
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetState();
                }}
                className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold underline pt-1"
              >
                Choose a different file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 py-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Drag & drop the Master Ledger .xlsx file here, or <span className="text-blue-600 dark:text-blue-400 underline">click to browse</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Strictly accepts Excel spreadsheets (.xlsx, .xls)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Import Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Success Result Banner */}
        {importResult && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-emerald-800 dark:text-emerald-200 text-xs space-y-2 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="font-bold text-sm">Ledger data imported successfully!</p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/60 text-center font-mono">
              <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="text-[10px] text-slate-500 uppercase font-sans">Sheets</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{importResult.sheets_processed || 0}</div>
              </div>
              <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="text-[10px] text-slate-500 uppercase font-sans">Accounts</div>
                <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{importResult.created_accounts || 0}</div>
              </div>
              <div className="bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="text-[10px] text-slate-500 uppercase font-sans">Transactions</div>
                <div className="font-bold text-sm text-blue-600 dark:text-blue-400">{importResult.imported_transactions || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleModalClose}
            disabled={uploading}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Importing...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" /> Import Excel Master
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
