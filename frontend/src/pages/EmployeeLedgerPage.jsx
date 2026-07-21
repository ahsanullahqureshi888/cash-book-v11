import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
  Search,
  RefreshCw,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { currency as formatCurrency, dateLabel, csvCell } from '../utils/format';
import BaseModal from '../components/BaseModal';

export default function EmployeeLedgerPage({ currentUser, companyName = 'Cashbook Of All companies', companyLogo = '' }) {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('oldest'); // 'oldest' | 'newest'
  const [selectedCurrency, setSelectedCurrency] = useState('AFN');
  const [page, setPage] = useState(1);
  const pageSize = 100;

  // Adjustment Modal state
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjForm, setAdjForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    period: new Date().toISOString().slice(0, 7),
    amount: '',
    currency: 'AFN',
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

  // Pay Salary Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMonth, setPayMonth] = useState(new Date().getMonth() + 1);
  const [payYear, setPayYear] = useState(new Date().getFullYear());
  const [payMethod, setPayMethod] = useState('cash');
  const [payNotes, setPayNotes] = useState('');
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    if (employeeId) {
      loadEmployeeAndLedger();
    }
  }, [employeeId, fromDate, toDate, selectedCurrency, page]);

  async function loadEmployeeAndLedger() {
    setLoading(true);
    setError('');
    try {
      const [empList, ledger] = await Promise.all([
        api.getEmployees(),
        api.getEmployeeSalaryLedger(employeeId, {
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
          currency: selectedCurrency || undefined,
          page,
          page_size: pageSize
        })
      ]);
      const currentEmp = empList.find((e) => String(e.id) === String(employeeId));
      if (!currentEmp && !ledger.employee) {
        throw new Error('Employee not found');
      }
      setEmployee(currentEmp || ledger.employee);
      setSelectedCurrency(currentEmp?.currency || ledger.employee?.currency || 'AFN');
      setAdjForm((prev) => ({ ...prev, currency: currentEmp?.currency || ledger.employee?.currency || 'AFN' }));
      setLedgerData(ledger);
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
      await api.createEmployeeSalaryAdjustment(employeeId, {
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
      await loadEmployeeAndLedger();
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
      await api.updateEmployee(employeeId, { joining_date: joiningDateInput });
      setShowSetJoiningDate(false);
      await loadEmployeeAndLedger();
    } catch (err) {
      alert(err.message || 'Failed to save joining date');
    } finally {
      setJoiningDateSaving(false);
    }
  }

  async function handlePaySalary(e) {
    e.preventDefault();
    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      setPayError('Please enter a valid positive amount.');
      return;
    }
    setPaySaving(true);
    setPayError('');
    try {
      await api.createSalaryPayment({
        employee_id: Number(employeeId),
        month: Number(payMonth),
        year: Number(payYear),
        amount: amt,
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: payMethod,
        notes: payNotes
      });
      setShowPayModal(false);
      setPayAmount('');
      setPayNotes('');
      await loadEmployeeAndLedger();
    } catch (err) {
      setPayError(err.message || 'Failed to save salary payment');
    } finally {
      setPaySaving(false);
    }
  }

  // Filtered & sorted entries
  const displayedEntries = useMemo(() => {
    if (!ledgerData?.entries) return [];
    let list = [...ledgerData.entries];

    if (periodFilter.trim()) {
      list = list.filter((e) => String(e.period || '').toLowerCase().includes(periodFilter.trim().toLowerCase()));
    }
    if (entryTypeFilter !== 'all') {
      list = list.filter((e) => e.entry_type === entryTypeFilter);
    }

    if (sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return list;
  }, [ledgerData?.entries, periodFilter, entryTypeFilter, sortOrder]);

  function exportCsv() {
    if (!displayedEntries.length) return;
    const headers = [
      'Date',
      'Payroll Period',
      'Entry Type',
      'Description',
      'Salary Accrued',
      'Payment',
      'Bonus',
      'Deduction',
      'Adjustment',
      'Running Balance',
      'Currency',
      'Reference'
    ];
    const rows = displayedEntries.map((entry) => [
      csvCell(entry.date),
      csvCell(entry.period),
      csvCell(entry.entry_type),
      csvCell(entry.description),
      csvCell(entry.salary_accrued || entry.debit || 0),
      csvCell(entry.payment || entry.credit || 0),
      csvCell(entry.bonus || 0),
      csvCell(entry.deduction || 0),
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
    link.setAttribute('download', `${employee?.full_name || 'Employee'}_Salary_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrint() {
    if (!ledgerData || !employee) return;
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    const rowsHtml = displayedEntries.map((e) => `
      <tr>
        <td>${e.date}</td>
        <td>${e.period}</td>
        <td><span class="badge ${e.entry_type}">${e.entry_type.replace('_', ' ')}</span></td>
        <td>${e.description}</td>
        <td style="text-align:right">${(e.salary_accrued || e.debit) ? (e.salary_accrued || e.debit).toLocaleString() : '-'}</td>
        <td style="text-align:right">${(e.payment || e.credit) ? (e.payment || e.credit).toLocaleString() : '-'}</td>
        <td style="text-align:right">${e.bonus ? e.bonus.toLocaleString() : '-'}</td>
        <td style="text-align:right">${e.deduction ? e.deduction.toLocaleString() : '-'}</td>
        <td style="text-align:right">${e.adjustment ? e.adjustment.toLocaleString() : '-'}</td>
        <td style="text-align:right; font-weight:bold">${e.running_balance.toLocaleString()} ${e.currency}</td>
      </tr>
    `).join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Ledger - ${employee.full_name}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; }
          .sub { color: #64748b; font-size: 14px; margin-top: 4px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; }
          .card-title { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
          .card-val { font-size: 18px; font-weight: bold; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; }
          th { background: #f1f5f9; text-align: left; }
          .badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: capitalize; font-weight: 600; }
          .salary_accrual { background: #dbeafe; color: #1e40af; }
          .salary_payment { background: #dcfce7; color: #166534; }
          .bonus { background: #ecfdf5; color: #047857; }
          .deduction { background: #ffe4e6; color: #9f1239; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 15px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${companyName}</div>
            <div class="sub">Employee Salary Ledger</div>
            <div style="margin-top: 10px; font-size: 16px; font-weight: 600;">${employee.full_name} (${employee.employee_code || 'EMP'})</div>
            <div class="sub">${employee.position || 'Employee'} • ${employee.department || 'General'}</div>
            <div class="sub">Joining Date: ${employee.joining_date ? employee.joining_date : 'Not set (Carry forward disabled)'}</div>
          </div>
          <div style="text-align:right">
            <div class="sub">Generated Date: ${new Date().toLocaleDateString()}</div>
            <div class="sub">Currency: ${selectedCurrency}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="card">
            <div class="card-title">Total Accrued</div>
            <div class="card-val">${(ledgerData.summary.total_accrued || 0).toLocaleString()} ${selectedCurrency}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Paid</div>
            <div class="card-val">${(ledgerData.summary.total_paid || 0).toLocaleString()} ${selectedCurrency}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Adjustments</div>
            <div class="card-val">${(ledgerData.summary.total_adjustments || 0).toLocaleString()} ${selectedCurrency}</div>
          </div>
          <div class="card">
            <div class="card-title">Outstanding Balance</div>
            <div class="card-val">${(ledgerData.summary.outstanding_balance || 0).toLocaleString()} ${selectedCurrency}</div>
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
              <th style="text-align:right">Payment</th>
              <th style="text-align:right">Bonus</th>
              <th style="text-align:right">Deduction</th>
              <th style="text-align:right">Adjustment</th>
              <th style="text-align:right">Running Balance</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div>Prepared by: ${currentUser?.full_name || 'Administrator'}</div>
          <div>Cashbook Accounting System</div>
        </div>
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

  if (loading && !ledgerData) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-slate-100">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-800 rounded-xl w-48"></div>
          <div className="h-32 bg-slate-800 rounded-2xl w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-24 bg-slate-800 rounded-xl"></div>
            <div className="h-24 bg-slate-800 rounded-xl"></div>
            <div className="h-24 bg-slate-800 rounded-xl"></div>
            <div className="h-24 bg-slate-800 rounded-xl"></div>
          </div>
          <div className="h-64 bg-slate-800 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-slate-100">
        <button
          onClick={() => navigate('/salary')}
          className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employees
        </button>
        <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-rose-300">{error || 'Employee not found'}</h2>
          <button
            onClick={loadEmployeeAndLedger}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm rounded-xl"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-slate-100 space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/salary')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employees
        </button>
        <span className="text-xs text-slate-400">Employee Salary Ledger</span>
      </div>

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-500/20 overflow-hidden">
            {employee.avatar_url ? (
              <img src={employee.avatar_url} alt={employee.full_name} className="w-full h-full object-cover" />
            ) : (
              employee.full_name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{employee.full_name}</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {employee.employee_code || `EMP-${employee.id}`}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                employee.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
              }`}>
                {employee.status || 'active'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-blue-400" /> {employee.position || 'Position not set'}</span>
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-indigo-400" /> {employee.department || 'General'}</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                {employee.joining_date ? `Joined: ${dateLabel(employee.joining_date)}` : 'Joining Date Not Set'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setPayAmount(String(ledgerData?.summary?.outstanding_balance || employee.monthly_salary || ''));
              setShowPayModal(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" /> Pay Salary
          </button>
          <button
            onClick={() => setShowAdjustmentModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-2"
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

      {/* Notice Banner if Joining Date missing */}
      {ledgerData && !ledgerData.policy.carry_forward_enabled && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-300 shadow-md">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Joining date not set — historical salary carry forward is disabled.</p>
              <p className="text-xs text-amber-400/80 mt-0.5">Only the current month's salary remaining is displayed. Historical unpaid balances are omitted until a Joining Date is assigned.</p>
            </div>
          </div>
          {!showSetJoiningDate ? (
            <button
              onClick={() => {
                setJoiningDateInput(new Date().toISOString().slice(0, 10));
                setShowSetJoiningDate(true);
              }}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold rounded-xl border border-amber-500/40 transition-all whitespace-nowrap"
            >
              Set Joining Date
            </button>
          ) : (
            <form onSubmit={handleSaveJoiningDate} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={joiningDateInput}
                onChange={(e) => setJoiningDateInput(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-900 border border-amber-500/50 rounded-xl text-white focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={joiningDateSaving}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-all"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowSetJoiningDate(false)}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}

      {/* Summary KPI Cards */}
      {ledgerData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Salary Accrued</div>
            <div className="text-2xl font-bold text-white mt-1">
              {formatCurrency(ledgerData.summary.total_accrued || 0, selectedCurrency)}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Since {employee.joining_date ? dateLabel(employee.joining_date) : 'current month'}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Paid</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {formatCurrency(ledgerData.summary.total_paid || 0, selectedCurrency)}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total disbursements</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Outstanding Balance</div>
            <div className={`text-2xl font-bold mt-1 ${
              (ledgerData.summary.outstanding_balance || 0) > 0 ? 'text-amber-400' : 'text-slate-200'
            }`}>
              {formatCurrency(ledgerData.summary.outstanding_balance || 0, selectedCurrency)}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <BookOpenText className="w-3.5 h-3.5 text-amber-400" />
              <span>Running unpaid balance</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Month Remaining</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">
              {formatCurrency(ledgerData.summary.current_month_remaining || 0, selectedCurrency)}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Active period balance</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Filter className="w-4 h-4 text-blue-400" /> Filters:
          </div>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            title="From Date"
          />
          <span className="text-xs text-slate-500">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            title="To Date"
          />

          <select
            value={entryTypeFilter}
            onChange={(e) => setEntryTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Entry Types</option>
            <option value="salary_accrual">Salary Accrual</option>
            <option value="salary_payment">Salary Payment</option>
            <option value="bonus">Bonus</option>
            <option value="deduction">Deduction</option>
            <option value="advance">Advance</option>
            <option value="adjustment">Adjustment</option>
            <option value="reversal">Reversal</option>
          </select>

          <input
            type="text"
            placeholder="Period (e.g. 2026-07)"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 w-36"
          />
        </div>

        <div className="flex items-center gap-3 justify-between md:justify-end">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="oldest">Sort: Oldest First</option>
            <option value="newest">Sort: Newest First</option>
          </select>

          <button
            onClick={() => {
              setFromDate('');
              setToDate('');
              setPeriodFilter('');
              setEntryTypeFilter('all');
              setSortOrder('oldest');
            }}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
        {/* Desktop Table (> 760px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-700/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4">Entry Type</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Accrued</th>
                <th className="py-3.5 px-4 text-right">Payment</th>
                <th className="py-3.5 px-4 text-right">Bonus</th>
                <th className="py-3.5 px-4 text-right">Deduction</th>
                <th className="py-3.5 px-4 text-right">Adjustment</th>
                <th className="py-3.5 px-4 text-right">Running Balance</th>
                <th className="py-3.5 px-4 text-center">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {displayedEntries.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-500">
                    No ledger entries found matching your filters.
                  </td>
                </tr>
              ) : (
                displayedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-300 whitespace-nowrap">
                      {dateLabel(entry.date)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {entry.period}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getBadgeStyle(entry.entry_type)}`}>
                        {entry.entry_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 max-w-xs truncate" title={entry.description}>
                      {entry.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-blue-400">
                      {(entry.salary_accrued || entry.debit) ? formatCurrency(entry.salary_accrued || entry.debit, entry.currency) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-emerald-400">
                      {(entry.payment || entry.credit) ? formatCurrency(entry.payment || entry.credit, entry.currency) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-teal-300">
                      {entry.bonus ? formatCurrency(entry.bonus, entry.currency) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">
                      {entry.deduction ? formatCurrency(entry.deduction, entry.currency) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-300">
                      {entry.adjustment ? (entry.adjustment > 0 ? `+${formatCurrency(entry.adjustment, entry.currency)}` : formatCurrency(entry.adjustment, entry.currency)) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      {formatCurrency(entry.running_balance, entry.currency)}
                    </td>
                    <td className="py-3 px-4 text-center text-[10px] text-slate-400 font-mono">
                      {entry.reference || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Ledger Cards (< 760px) */}
        <div className="md:hidden divide-y divide-slate-800/80">
          {displayedEntries.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              No ledger entries found matching your filters.
            </div>
          ) : (
            displayedEntries.map((entry) => (
              <div key={entry.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{dateLabel(entry.date)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getBadgeStyle(entry.entry_type)}`}>
                    {entry.entry_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm font-medium text-slate-200">{entry.description}</div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/40">
                  <div>
                    <span className="text-slate-400">Period: </span>
                    <span className="font-mono text-slate-300">{entry.period}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Balance: </span>
                    <span className="font-mono font-bold text-white">{formatCurrency(entry.running_balance, entry.currency)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  {(entry.salary_accrued || entry.debit) > 0 && <span className="text-blue-400">Accrued: +{formatCurrency(entry.salary_accrued || entry.debit, entry.currency)}</span>}
                  {(entry.payment || entry.credit) > 0 && <span className="text-emerald-400">Paid: -{formatCurrency(entry.payment || entry.credit, entry.currency)}</span>}
                  {entry.bonus > 0 && <span className="text-teal-300">Bonus: +{formatCurrency(entry.bonus, entry.currency)}</span>}
                  {entry.deduction > 0 && <span className="text-rose-400">Deduction: -{formatCurrency(entry.deduction, entry.currency)}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Adjustment Modal */}
      {showAdjustmentModal && (
        <BaseModal
          isOpen={showAdjustmentModal}
          onClose={() => setShowAdjustmentModal(false)}
          title={`Add Salary Adjustment - ${employee.full_name}`}
        >
          <form onSubmit={handleAddAdjustment} className="space-y-4 text-slate-100">
            {adjError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                {adjError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Adjustment Type</label>
              <select
                value={adjForm.adjustment_type}
                onChange={(e) => setAdjForm({ ...adjForm, adjustment_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="bonus">Bonus (+ Increases Balance)</option>
                <option value="deduction">Deduction (- Reduces Balance)</option>
                <option value="advance">Advance (- Salary Advance Taken)</option>
                <option value="adjustment">Positive Adjustment (+ Credit)</option>
                <option value="reversal">Reversal / Correction</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={adjForm.date}
                  onChange={(e) => setAdjForm({ ...adjForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Payroll Period</label>
                <input
                  type="month"
                  value={adjForm.period}
                  onChange={(e) => setAdjForm({ ...adjForm, period: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={adjForm.amount}
                  onChange={(e) => setAdjForm({ ...adjForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Currency</label>
                <select
                  value={adjForm.currency}
                  onChange={(e) => setAdjForm({ ...adjForm, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="AFN">AFN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Reason / Description</label>
              <input
                type="text"
                placeholder="e.g. Eid Performance Bonus"
                value={adjForm.reason}
                onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Notes (Optional)</label>
              <textarea
                rows="2"
                placeholder="Additional audit details..."
                value={adjForm.notes}
                onChange={(e) => setAdjForm({ ...adjForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdjustmentModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adjSaving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20"
              >
                {adjSaving ? 'Saving...' : 'Post Adjustment'}
              </button>
            </div>
          </form>
        </BaseModal>
      )}

      {/* Pay Salary Modal */}
      {showPayModal && (
        <BaseModal
          isOpen={showPayModal}
          onClose={() => setShowPayModal(false)}
          title={`Pay Salary - ${employee.full_name}`}
        >
          <form onSubmit={handlePaySalary} className="space-y-4 text-slate-100">
            {payError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                {payError}
              </div>
            )}

            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">Total Outstanding Balance:</div>
              <div className="text-xl font-bold text-amber-400">
                {formatCurrency(ledgerData?.summary?.outstanding_balance || 0, selectedCurrency)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Month</label>
                <select
                  value={payMonth}
                  onChange={(e) => setPayMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {new Date(2026, m - 1, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Year</label>
                <input
                  type="number"
                  value={payYear}
                  onChange={(e) => setPayYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Amount ({selectedCurrency})</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="hawala">Hawala / Agent</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Notes / Receipt Detail</label>
              <textarea
                rows="2"
                placeholder="Notes for salary payment..."
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={paySaving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/20"
              >
                {paySaving ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        </BaseModal>
      )}
    </div>
  );
}
