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
      maxWidth="600px"
      preventClose={saving}
      loading={saving}
    >
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <QuickAddField label="Employee Name" style={{ gridColumn: 'span 2' }}>
          <input autoFocus value={form.full_name} onChange={(event) => update('full_name', event.target.value)} placeholder="Enter employee name" required />
        </QuickAddField>
        <QuickAddField label="Father Name">
          <input value={form.father_name} onChange={(event) => update('father_name', event.target.value)} placeholder="Enter father name" />
        </QuickAddField>
        <QuickAddField label="Phone Number">
          <input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="Enter phone number" />
        </QuickAddField>
        <QuickAddField label="Position / Job Title">
          <input value={form.position} onChange={(event) => update('position', event.target.value)} placeholder="e.g. Operator" required />
        </QuickAddField>
        <QuickAddField label="Department">
          <input value={form.department} onChange={(event) => update('department', event.target.value)} placeholder="e.g. Production" />
        </QuickAddField>
        <QuickAddField label="Joining Date">
          <input type="date" value={form.joining_date} onChange={(event) => update('joining_date', event.target.value)} required />
        </QuickAddField>
        <QuickAddField label="Monthly Salary">
          <span className="quick-add-salary-control" style={{ display: 'flex', gap: '8px' }}>
            <input type="number" min="0" step="0.01" value={form.monthly_salary} onChange={(event) => update('monthly_salary', event.target.value)} placeholder="0.00" required style={{ flex: 1 }} />
            <select value={form.currency} onChange={(event) => update('currency', event.target.value)} style={{ width: '80px' }}>
              <option value="AFN">AFN</option>
              <option value="USD">USD</option>
            </select>
          </span>
        </QuickAddField>
        <QuickAddField label="Notes / Remarks" style={{ gridColumn: 'span 2' }}>
          <textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Add optional employee context..." rows={3} />
        </QuickAddField>

        {error && (
          <div style={{ gridColumn: 'span 2', color: 'var(--danger)', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div className="quick-add-actions" style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button type="button" className="ghost-btn" onClick={onClose} disabled={saving}>{t('Cancel')}</button>
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? t('Saving...') : t('Save & Select Employee') || 'Save & Select Employee'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
