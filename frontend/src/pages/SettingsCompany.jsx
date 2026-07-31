import CompanyLogo from '../components/CompanyLogo';
import { api } from '../services/api';

export default function SettingsCompany(props) {
  async function onLogoFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      props.onStatus?.('Logo must be PNG, JPG, or SVG.');
      event.target.value = '';
      return;
    }

    const processUpload = async (uploadFile, fallbackDataUrl) => {
      props.onStatus?.('Uploading logo to Google Drive...');
      try {
        const res = await api.uploadMedia(uploadFile);
        if (res && res.url) {
          props.setCompanyLogo(res.url);
          props.onStatus?.('Logo uploaded to Google Drive.');
        } else {
          throw new Error('Upload returned empty response.');
        }
      } catch (err) {
        console.warn('Google Drive upload failed, using local fallback:', err);
        props.setCompanyLogo(fallbackDataUrl);
        props.onStatus?.('Logo updated (local database storage).');
      }
    };

    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = String(reader.result || '');
        await processUpload(file, dataUrl);
      };
      reader.readAsDataURL(file);
      event.target.value = '';
      return;
    }

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const fallbackDataUrl = canvas.toDataURL('image/webp', 0.86);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        props.setCompanyLogo(fallbackDataUrl);
        props.onStatus?.('Logo optimized.');
        return;
      }
      const uploadFile = new File([blob], 'company-logo.webp', { type: 'image/webp' });
      await processUpload(uploadFile, fallbackDataUrl);
    }, 'image/webp', 0.86);

    event.target.value = '';
  }

  return (
    <div className="glass-card form-card company-profile-card p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
      <div className="card-header pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">Company Branding & Contact Details</h3>
      </div>
      <div className="company-profile-layout grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="company-logo-editor p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col items-center justify-center text-center gap-2">
          <CompanyLogo logo={props.companyLogo} name={props.companyName} size="lg" />
          <div className="company-logo-caption">
            <h2 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100 tracking-tight">{props.companyName || 'BAWAR STAR PLASTIC INDUSTRY'}</h2>
            <p className="text-[10px] text-slate-500 font-medium">Enterprise Management System</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <label className="secondary-btn logo-upload-btn text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer font-bold shadow-xs">
              Upload Logo
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" hidden onChange={onLogoFile} />
            </label>
            {props.companyLogo && (
              <button className="ghost-btn text-xs px-2 py-1 text-rose-500 hover:text-rose-600 font-bold" type="button" onClick={() => props.setCompanyLogo('')}>
                Remove
              </button>
            )}
          </div>
        </div>
        <div className="settings-form md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company Name<input className="form-control text-xs mt-1" type="text" value={props.companyName} onChange={(e) => props.setCompanyName(e.target.value)} /></label>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Company Address<input className="form-control text-xs mt-1" type="text" value={props.companyAddress} onChange={(e) => props.setCompanyAddress(e.target.value)} dir="auto" /></label>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone<input className="form-control text-xs mt-1" type="text" value={props.companyPhone} onChange={(e) => props.setCompanyPhone(e.target.value)} /></label>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email<input className="form-control text-xs mt-1" type="email" value={props.companyEmail} onChange={(e) => props.setCompanyEmail(e.target.value)} /></label>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Website<input className="form-control text-xs mt-1" type="text" value={props.companyWebsite} onChange={(e) => props.setCompanyWebsite(e.target.value)} /></label>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tax Number<input className="form-control text-xs mt-1" type="text" value={props.companyTaxNumber} onChange={(e) => props.setCompanyTaxNumber(e.target.value)} /></label>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">Company License<input className="form-control text-xs mt-1" type="text" value={props.companyLicense} onChange={(e) => props.setCompanyLicense(e.target.value)} /></label>
        </div>
      </div>
    </div>
  );
}
