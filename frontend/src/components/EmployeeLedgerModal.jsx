import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpenText,
  Calendar,
  DollarSign,
  Download,
  FileSpreadsheet,
  PlusCircle,
  Printer,
  X,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Building2,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import BaseModal from './BaseModal';
import { api } from '../services/api';
import { currency as formatCurrency, dateLabel, csvCell } from '../utils/format';

export default function EmployeeLedgerModal({
  employee,
  onClose,
  onOpenPaySalary,
  onUpdateEmployee,
  currentUser
}) {
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(employee?.currency || 'AFN');
  
  // Adjustment Modal state
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjForm, setAdjForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    period: new Date().toISOString().slice(0, 7),
    amount: '',
    currency: employee?.currency || 'AFN',
    adjustment_type: 'bonus',
    reason: '',
    notes: ''
  });
  const [adjSaving, setAdjSaving] = useState(false);
  const [adjError, setAdjError] = useState('');

  // Set Joining Date state
  const [showSetJoiningDate, setShowSetJoiningDate] = useState(false);
  const [joiningDateInput, setJoiningDateInput] = useState('');
  const [joiningDateSaving, setJoiningDateSaving] = useState(false);

  useEffect(() => {
    if (employee?.id) {
      loadLedger();
    }
  }, [employee?.id, fromDate, toDate, selectedCurrency]);

  async function loadLedger() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getEmployeeSalaryLedger(employee.id, {
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        currency: selectedCurrency || undefined
      });
      setLedgerData(data);
    } catch (err) {
      setError(err.message || 'Failed to load employee salary ledger');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAdjustment(e) {
    e.preventDefault();
    if (!adjForm.amount || Number(adjForm.amount) <= 0) {
      setAdjError('Please enter a valid positive amount.');
      return;
    }
    if (!adjForm.reason.trim()) {
      setAdjError('Reason is required.');
      return;
    }
    setAdjSaving(true);
    setAdjError('');
    try {
      await api.createEmployeeSalaryAdjustment(employee.id, {
        ...adjForm,
        amount: Number(adjForm.amount)
      });
      setShowAdjustmentModal(false);
      setAdjForm({
        date: new Date().toISOString().slice(0, 10),
        period: new Date().toISOString().slice(0, 7),
        amount: '',
        currency: employee?.currency || 'AFN',
        adjustment_type: 'bonus',
        reason: '',
        notes: ''
      });
      await loadLedger();
    } catch (err) {
      setAdjError(err.message || 'Failed to add adjustment');
    } finally {
      setAdjSaving(false);
    }
  }

  async function handleSaveJoiningDate(e) {
    e.preventDefault();
    if (!joiningDateInput) return;
    setJoiningDateSaving(true);
    try {
      await api.updateEmployee(employee.id, { joining_date: joiningDateInput });
      if (onUpdateEmployee) {
        onUpdateEmployee({ ...employee, joining_date: joiningDateInput });
      }
      setShowSetJoiningDate(false);
      await loadLedger();
    } catch (err) {
      alert(err.message || 'Failed to save joining date');
    } finally {
      setJoiningDateSaving(false);
    }
  }

  function exportCsv() {
    if (!ledgerData?.entries?.length) return;
    const headers = [
      'Date',
      'Payroll Period',
      'Entry Type',
      'Description',
      'Salary Accrued',
      'Payment',
      'Adjustment',
      'Running Balance',
      'Currency',
      'Reference'
    ];
    const rows = ledgerData.entries.map((entry) => [
      csvCell(entry.date),
      csvCell(entry.period),
      csvCell(entry.entry_type),
      csvCell(entry.description),
      csvCell(entry.debit || 0),
      csvCell(entry.credit || 0),
      csvCell(entry.adjustment || 0),
      csvCell(entry.running_balance || 0),
      csvCell(entry.currency),
      csvCell(entry.reference || '')
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${employee.full_name}_Salary_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrint() {
    if (!ledgerData) return;
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const rowsHtml = (ledgerData.entries || []).map((e) => `
      <tr>
        <td>${e.date}</td>
        <td>${e.period}</td>
        <td><span class="badge ${e.entry_type}">${e.entry_type.replace('_', ' ')}</span></td>
        <td>${e.description}</td>
        <td style="text-align:right">${e.debit ? e.debit.toLocaleString() : '-'}</td>
        <td style="text-align:right">${e.credit ? e.credit.toLocaleString() : '-'}</td>
        <td style="text-align:right">${e.running_balance.toLocaleString()} ${e.currency}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Ledger - ${employee.full_name}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 20px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; }
          .sub { color: #64748b; font-size: 14px; margin-top: 4px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; borderRadius: 6px; }
          .card-title { font-size: 12px; color: #64748b; text-transform: uppercase; }
          .card-val { font-size: 18px; font-weight: bold; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px; }
          th { background: #f1f5f9; text-align: left; }
          .badge { padding: 2px 6px; border-radius: 4px; font-size: 11px; text-transform: capitalize; font-weight: 600; }
          .salary_accrual { background: #dbeafe; color: #1e40af; }
          .salary_payment { background: #dcfce7; color: #166534; }
          .bonus { background: #ecfdf5; color: #047857; }
          .deduction { background: #ffe4e6; color: #9f1239; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${employee.full_name} (${employee.employee_code})</div>
            <div class="sub">${employee.position || 'Employee'} • ${employee.department || 'General'}</div>
            <div class="sub">Joining Date: ${employee.joining_date ? employee.joining_date : 'Not set (Carry forward disabled)'}</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:bold; font-size:16px;">Employee Salary Ledger Report</div>
            <div class="sub">Printed: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="card">
            <div class="card-title">Total Accrued</div>
            <div class="card-val">${ledgerData.summary.total_accrued.toLocaleString()} ${selectedCurrency}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Paid</div>
            <div class="card-val">${ledgerData.summary.total_paid.toLocaleString()} ${selectedCurrency}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Adjustments</div>
            <div class="card-val">${ledgerData.summary.total_adjustments.toLocaleString()} ${selectedCurrency}</div>
          </div>
          <div class="card">
            <div class="card-title">Outstanding Balance</div>
            <div class="card-val">${ledgerData.summary.outstanding_balance.toLocaleString()} ${selectedCurrency}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Period</th>
              <th>Type</th>
              <th>Description</th>
              <th style="text-align:right">Accrued</th>
              <th style="text-align:right">Paid</th>
              <th style="text-align:right">Running Balance</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 300);
  }

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'salary_accrual':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'salary_payment':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'bonus':
        return 'bg-teal-500/10 text-teal-300 border-teal-500/20';
      case 'deduction':
      case 'advance':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'adjustment':
      case 'reversal':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    }
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title=""
      maxWidth="max-w-6xl"
    >
      <div className="space-y-6 text-slate-100">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-500/20 overflow-hidden">
              {employee.avatar_url ? (
                <img src={employee.avatar_url} alt={employee.full_name} className="w-full h-full object-cover" />
              ) : (
                employee.full_name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white tracking-tight">{employee.full_name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {employee.employee_code}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mt-1">
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-blue-400" /> {employee.position || 'Employee'}</span>
                {employee.department && <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-indigo-400" /> {employee.department}</span>}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  {employee.joining_date ? `Joined: ${dateLabel(employee.joining_date)}` : 'No Joining Date'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenPaySalary && onOpenPaySalary(employee)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" /> Pay Salary
            </button>
            <button
              onClick={() => setShowAdjustmentModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" /> Add Adjustment
            </button>
            <button
              onClick={handlePrint}
              disabled={loading || !ledgerData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all disabled:opacity-50"
              title="Print Ledger"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={exportCsv}
              disabled={loading || !ledgerData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all disabled:opacity-50"
              title="Export CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Warning / Notice Banner if no joining date */}
        {ledgerData && !ledgerData.policy.carry_forward_enabled && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Joining date not set — historical carry forward is disabled.</p>
                <p className="text-xs text-amber-400/80 mt-0.5">Only current month's salary remaining is displayed. Previous unpaid months are ignored.</p>
              </div>
            </div>
            {!showSetJoiningDate ? (
              <button
                onClick={() => {
                  setJoiningDateInput(new Date().toISOString().slice(0, 10));
                  setShowSetJoiningDate(true);
                }}
                className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold rounded-lg border border-amber-500/40 transition-all whitespace-nowrap"
              >
                Set Joining Date
              </button>
            ) : (
              <form onSubmit={handleSaveJoiningDate} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={joiningDateInput}
                  onChange={(e) => setJoiningDateInput(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-900 border border-amber-500/50 rounded-lg text-white"
                  required
                />
                <button
                  type="submit"
                  disabled={joiningDateSaving}
                  className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowSetJoiningDate(false)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}

        {/* Summary Cards */}
        {ledgerData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
                <span>Total Accrued</span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">
                {formatCurrency(ledgerData.summary.total_accrued)} <span className="text-sm font-normal text-slate-400">{ledgerData.employee.currency}</span>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
                <span>Total Paid</span>
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-2">
                {formatCurrency(ledgerData.summary.total_paid)} <span className="text-sm font-normal text-slate-400">{ledgerData.employee.currency}</span>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
                <span>Total Adjustments</span>
                <PlusCircle className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-purple-300 mt-2">
                {formatCurrency(ledgerData.summary.total_adjustments)} <span className="text-sm font-normal text-slate-400">{ledgerData.employee.currency}</span>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
                <span>{ledgerData.policy.carry_forward_enabled ? 'Outstanding Balance' : 'Current Month Remaining'}</span>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mt-2">
                {formatCurrency(ledgerData.summary.outstanding_balance < 0 ? Math.abs(ledgerData.summary.outstanding_balance) : ledgerData.summary.outstanding_balance)}
                <span className="text-sm font-normal text-slate-400 ml-1">{ledgerData.employee.currency}</span>
              </div>
              {ledgerData.summary.outstanding_balance < 0 && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Employee advance / overpayment
                </span>
              )}
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium">From:</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium">To:</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(''); setToDate(''); }}
                className="text-xs text-blue-400 hover:underline"
              >
                Clear Dates
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Currency:</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="AFN">AFN (Afghan Afghani)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="Toman">Toman (Iranian Toman)</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm">Calculating real-time salary ledger...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-center">
            {error}
          </div>
        ) : !ledgerData?.entries?.length ? (
          <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/30">
            <BookOpenText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">No ledger entries found</p>
            <p className="text-xs text-slate-500 mt-1">Adjust filters or create a salary accrual/payment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Period</th>
                  <th className="p-3.5">Entry Type</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5 text-right">Accrued (Debit)</th>
                  <th className="p-3.5 text-right">Payment (Credit)</th>
                  <th className="p-3.5 text-right">Running Balance</th>
                  <th className="p-3.5 text-center">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ledgerData.entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-medium text-slate-200 whitespace-nowrap">{dateLabel(entry.date)}</td>
                    <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">{entry.period}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold capitalize ${getBadgeStyle(entry.entry_type)}`}>
                        {entry.entry_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-xs truncate" title={entry.description}>{entry.description}</td>
                    <td className="p-3.5 text-right font-medium text-blue-400 whitespace-nowrap">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                    </td>
                    <td className="p-3.5 text-right font-medium text-emerald-400 whitespace-nowrap">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                    </td>
                    <td className={`p-3.5 text-right font-bold whitespace-nowrap ${entry.running_balance < 0 ? 'text-amber-400' : 'text-slate-100'}`}>
                      {formatCurrency(entry.running_balance)} <span className="text-[10px] font-normal text-slate-400">{entry.currency}</span>
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-500 text-[11px]">{entry.reference || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Adjustment Sub-Modal */}
      {showAdjustmentModal && (
        <BaseModal
          isOpen={true}
          onClose={() => setShowAdjustmentModal(false)}
          title="Add Salary Adjustment"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddAdjustment} className="space-y-4 text-slate-100">
            {adjError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
                {adjError}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={adjForm.date}
                  onChange={(e) => setAdjForm({ ...adjForm, date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Period (YYYY-MM)</label>
                <input
                  type="month"
                  value={adjForm.period}
                  onChange={(e) => setAdjForm({ ...adjForm, period: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Adjustment Type</label>
              <select
                value={adjForm.adjustment_type}
                onChange={(e) => setAdjForm({ ...adjForm, adjustment_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium"
              >
                <option value="bonus">Bonus (+ Accrued)</option>
                <option value="deduction">Deduction (- Balance)</option>
                <option value="advance">Advance Payment (- Balance)</option>
                <option value="adjustment">Manual Adjustment</option>
                <option value="reversal">Reversal Entry</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Amount</label>
                <input
                  type="number"
                  step="any"
                  value={adjForm.amount}
                  onChange={(e) => setAdjForm({ ...adjForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Currency</label>
                <select
                  value={adjForm.currency}
                  onChange={(e) => setAdjForm({ ...adjForm, currency: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-medium"
                >
                  <option value="AFN">AFN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Reason / Description</label>
              <input
                type="text"
                value={adjForm.reason}
                onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                placeholder="e.g. Eid Festival Bonus"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Notes (Optional)</label>
              <textarea
                value={adjForm.notes}
                onChange={(e) => setAdjForm({ ...adjForm, notes: e.target.value })}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdjustmentModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-medium rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjSaving}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-500 disabled:opacity-50"
              >
                {adjSaving ? 'Saving...' : 'Save Adjustment'}
              </button>
            </div>
          </form>
        </BaseModal>
      )}
    </BaseModal>
  );
}
