import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { useTranslation } from 'react-i18next';
import { Building2, Plus, CheckCircle2 } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export default function AddCompanyModal({ isOpen = true, onClose }) {
  const { t } = useTranslation();
  const { addCompany, switchCompany } = useCompany();

  const [form, setForm] = useState({
    name: '',
    shortName: '',
    code: '',
    tagline: '',
    currency: 'AFN',
    defaultBranch: 'Main Branch',
    taxId: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !prev.shortName) {
        next.shortName = value.slice(0, 16);
      }
      if (field === 'shortName' && !prev.code) {
        next.code = value.replace(/[^a border-zA-Z0-9]+/g, '').slice(0, 4).toUpperCase();
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Company Name is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const created = addCompany({
        name: form.name.trim(),
        shortName: form.shortName.trim() || form.name.trim(),
        code: form.code.trim() || 'CO',
        tagline: form.tagline.trim() || 'Business Accounting Profile',
        currency: form.currency,
        defaultBranch: form.defaultBranch.trim() || 'Main Branch',
        branches: [form.defaultBranch.trim() || 'Main Branch'],
        taxId: form.taxId.trim() || 'N/A'
      });

      if (created && created.id) {
        switchCompany(created.id);
      }

      setSaving(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create new company.');
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Add New Company / Organization') || 'Add New Company / Organization'}
      maxWidth="580px"
      preventClose={saving}
      loading={saving}
      footer={
        <>
          <button
            type="button"
            className="ghost-btn modal-btn-cancel"
            onClick={onClose}
            disabled={saving}
          >
            {t('Cancel')}
          </button>
          <button
            type="submit"
            form="addCompanyForm"
            className="primary-btn modal-btn-save flex items-center gap-1.5"
            disabled={saving}
          >
            <Plus size={16} />
            <span>{saving ? t('Creating...') : t('Create & Switch Profile')}</span>
          </button>
        </>
      }
    >
      <form id="addCompanyForm" className="space-y-4" onSubmit={handleSubmit}>
        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">New Multi-Tenant Profile</h4>
            <p className="text-[11px] text-blue-700 dark:text-blue-300">
              Create an isolated company cashbook profile with its own currency, branches, and accounts.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-200">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Company / Organization Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. KABUL LOGISTICS & TRADE LTD"
              className="form-control text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Short Display Name *
              </label>
              <input
                type="text"
                required
                value={form.shortName}
                onChange={(e) => update('shortName', e.target.value)}
                placeholder="e.g. KABUL LOGISTICS"
                className="form-control text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company Code (4 letters)
              </label>
              <input
                type="text"
                maxLength={6}
                value={form.code}
                onChange={(e) => update('code', e.target.value.toUpperCase())}
                placeholder="e.g. KLT"
                className="form-control text-xs font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary Currency *
              </label>
              <select
                value={form.currency}
                onChange={(e) => update('currency', e.target.value)}
                className="form-select text-xs font-bold"
              >
                <option value="AFN">AFN - Afghan Afghani</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="PKR">PKR - Pakistani Rupee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Default Branch Name *
              </label>
              <input
                type="text"
                required
                value={form.defaultBranch}
                onChange={(e) => update('defaultBranch', e.target.value)}
                placeholder="e.g. Main Head Office"
                className="form-control text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Business Tagline / Subtitle
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => update('tagline', e.target.value)}
              placeholder="e.g. Import & Export Freight Services"
              className="form-control text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tax / Registration ID (Optional)
            </label>
            <input
              type="text"
              value={form.taxId}
              onChange={(e) => update('taxId', e.target.value)}
              placeholder="e.g. AFN-998234-KL"
              className="form-control text-xs font-mono"
            />
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
