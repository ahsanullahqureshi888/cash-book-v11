import { useState } from 'react';
import BaseModal from './BaseModal';
import { useTranslation } from 'react-i18next';

const initialEmployee = (name) => ({
  full_name: name || '',
  father_name: '',
  phone: '',
  position: '',
  department: '',
  joining_date: new Date().toLocaleDateString('en-CA'),
  monthly_salary: '',
  currency: 'AFN',
  status: 'active',
  notes: ''
});

function QuickAddField({ label, children, className = '', style = {} }) {
  return (
    <label className={`quick-add-field ${className}`.trim()} style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-soft)' }}>{label}</span>
      {children}
    </label>
  );
}

export default function QuickAddEmployeeModal({ initialName, onClose, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => initialEmployee(initialName));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, monthly_salary: Number(form.monthly_salary || 0) });
    } catch (err) {
      setError(err.message || 'Failed to save employee.');
      setSaving(false);
    }
  }

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={t('Add New Employee') || 'Add New Employee'}
      maxWidth="680px"
      preventClose={saving}
      loading={saving}
      footer={
        <>
          <button type="button" className="ghost-btn modal-btn-cancel" onClick={onClose} disabled={saving}>{t('Cancel')}</button>
          <button type="submit" form="quickAddEmployeeForm" className="primary-btn modal-btn-save" disabled={saving}>
            {saving ? t('Saving...') : t('Save & Select Employee') || 'Save & Select Employee'}
          </button>
        </>
      }
    >
      <form id="quickAddEmployeeForm" className="modal-form" onSubmit={submit}>
        <div className="employee-form-grid">
          <label className="form-field form-field--full">
            <span className="form-label">Employee Name *</span>
            <input className="form-control" autoFocus value={form.full_name} onChange={(event) => update('full_name', event.target.value)} placeholder="Enter employee name" required />
          </label>
          <label className="form-field">
            <span className="form-label">Father Name</span>
            <input className="form-control" value={form.father_name} onChange={(event) => update('father_name', event.target.value)} placeholder="Enter father name" />
          </label>
          <label className="form-field">
            <span className="form-label">Phone Number</span>
            <input className="form-control" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="Enter phone number" />
          </label>
          <label className="form-field">
            <span className="form-label">Position / Job Title *</span>
            <input className="form-control" value={form.position} onChange={(event) => update('position', event.target.value)} placeholder="e.g. Operator" required />
          </label>
          <label className="form-field">
            <span className="form-label">Department</span>
            <input className="form-control" value={form.department} onChange={(event) => update('department', event.target.value)} placeholder="e.g. Production" />
          </label>
          <label className="form-field">
            <span className="form-label">Joining Date *</span>
            <input className="form-control" type="date" value={form.joining_date} onChange={(event) => update('joining_date', event.target.value)} required />
          </label>
          <label className="form-field">
            <span className="form-label">Monthly Salary *</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="form-control" type="number" min="0" step="0.01" value={form.monthly_salary} onChange={(event) => update('monthly_salary', event.target.value)} placeholder="0.00" required style={{ flex: 1 }} />
              <select className="form-select" value={form.currency} onChange={(event) => update('currency', event.target.value)} style={{ width: '90px' }}>
                <option value="AFN">AFN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </label>
          <label className="form-field form-field--full">
            <span className="form-label">Notes / Remarks</span>
            <textarea className="form-textarea" value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Add optional employee context..." rows={2} />
          </label>
        </div>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
      </form>
    </BaseModal>
  );
}
