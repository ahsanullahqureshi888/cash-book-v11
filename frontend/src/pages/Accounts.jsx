import { useMemo } from 'react';
import { currency } from '../utils/format';
import { Search, UserPlus, Users } from 'lucide-react';
import DataTable from '../components/DataTable';

export default function Accounts({ accounts, form, setForm, onSave, onEdit, onDelete, search, setSearch }) {
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const visible = accounts.filter((account) => !search || `${account.name} ${account.phone} ${account.account_type}`.toLowerCase().includes(search.toLowerCase()));

  const columns = useMemo(() => [
    { 
      key: 'name', 
      label: 'Account Info', 
      render: (row) => (
        <div className="flex flex-col">
          <strong className="text-zinc-900 dark:text-white font-semibold">{row.name}</strong>
          {row.address && <span className="text-xs text-zinc-500 mt-0.5">{row.address}</span>}
        </div>
      ),
      className: 'w-64'
    },
    { 
      key: 'account_type', 
      label: 'Type', 
      render: (row) => (
        <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
          {row.account_type}
        </span>
      ),
      className: 'w-32'
    },
    { key: 'phone', label: 'Phone', render: (row) => <span className="text-zinc-600 dark:text-zinc-400 font-mono text-sm">{row.phone || '-'}</span>, className: 'w-32' },
    { key: 'opening_balance_afn', label: 'Opening AFN', render: (row) => <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{currency(row.opening_balance_afn)}</span>, className: 'w-32 text-right' },
    { key: 'opening_balance_usd', label: 'Opening USD', render: (row) => <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">{currency(row.opening_balance_usd, 'USD')}</span>, className: 'w-32 text-right' },
    { 
      key: 'actions', 
      label: 'Actions', 
      className: 'w-32 text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-3">
          <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors" onClick={() => onEdit(row)}>Edit</button>
          <button type="button" className="text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 transition-colors" onClick={() => onDelete(row)}>Delete</button>
        </div>
      )
    }
  ], [onEdit, onDelete]);

  const headerContent = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl">
          <Users size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Account Directory</h3>
      </div>
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
        <input 
          type="search" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search accounts..." 
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Accounts Management</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage customers, suppliers, workers, and expenses</p>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Form Panel */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="glass-card p-6 rounded-2xl border-2 border-indigo-500/10 shadow-indigo-500/5">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-5 flex items-center gap-2">
              <UserPlus size={18} className="text-indigo-500" />
              {form.id ? 'Edit Account' : 'Add New Account'}
            </h3>
            
            <form className="flex flex-col gap-4" onSubmit={onSave}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Account Name</label>
                <input autoFocus type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Full name or company" required dir="auto" className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Account Type</label>
                <select value={form.account_type} onChange={(e) => update('account_type', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm">
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                  <option value="worker">Worker</option>
                  <option value="factory">Factory</option>
                  <option value="expense">Expense</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contact Info</label>
                <input type="text" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Phone number" className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm mb-2" />
                <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Address" dir="auto" className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Opening AFN</label>
                  <input type="number" value={form.opening_balance_afn} onChange={(e) => update('opening_balance_afn', e.target.value)} placeholder="0.00" step="0.01" className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Opening USD</label>
                  <input type="number" value={form.opening_balance_usd} onChange={(e) => update('opening_balance_usd', e.target.value)} placeholder="0.00" step="0.01" className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Notes</label>
                <input type="text" value={form.note} onChange={(e) => update('note', e.target.value)} placeholder="Optional note" dir="auto" className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
              </div>

              <div className="flex items-center gap-2 mt-2">
                {form.id && (
                  <button type="button" className="ghost-btn flex-1 py-2.5" onClick={() => setForm({ name: '', account_type: 'customer', phone: '', address: '', opening_balance_afn: '', opening_balance_usd: '', note: '' })}>
                    Cancel Edit
                  </button>
                )}
                <button className="primary-btn flex-1 py-2.5 shadow-md hover:shadow-lg transition-all" type="submit">
                  {form.id ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Table Panel */}
        <div className="flex-1 min-w-0">
          <DataTable
            columns={columns}
            data={visible}
            keyField="id"
            headerContent={headerContent}
            emptyTitle="No accounts found"
            emptyDescription="Create a customer, supplier, worker, or expense account to see it here."
          />
        </div>

      </div>
    </div>
  );
}
