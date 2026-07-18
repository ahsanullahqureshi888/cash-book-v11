import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  CheckCircle2,
  DatabaseBackup,
  Download,
  Factory,
  FileDown,
  LogOut,
  Moon,
  Printer,
  Settings,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Loader2
} from 'lucide-react';
import PrintDocument from './PrintDocument';

function GlassSurface({ as: Element = 'section', className = '', children }) {
  return <Element className={`preview-glass-surface ${className}`.trim()}>{children}</Element>;
}

function DashboardHeader({ report, onClose }) {
  const { t } = useTranslation();
  const now = new Date();
  return (
    <GlassSurface as="header" className="preview-dashboard-header no-print">
      <div className="preview-header-copy">
        <span className="preview-kicker">{t('print.documentStudio')}</span>
        <h1>{t('print.printPreviewCenter')}</h1>
        <p>{t('print.brandingSystemSubtitle')}</p>
      </div>
      <div className="preview-header-meta">
        <div className="system-online">
          <span aria-hidden="true" />
          <strong>{t('print.systemOnline')}</strong>
        </div>
        <div>
          <span>{t('print.currentUser')}</span>
          <strong>{report.preparedBy || 'System User'}</strong>
        </div>
        <div>
          <span>{t('print.dateLabel')}</span>
          <strong>{now.toLocaleDateString()}</strong>
        </div>
        <div>
          <span>{t('print.timeLabel')}</span>
          <strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
        </div>
        <button className="preview-icon-close" onClick={onClose} aria-label="Close print preview">
          <LogOut size={18} />
        </button>
      </div>
    </GlassSurface>
  );
}

function BusinessOverview({ report }) {
  const { t } = useTranslation();
  const cards = [
    { icon: Building2, title: t('print.companyLabel'), value: report.company.companyName || 'BAWAR STAR PLASTIC INDUSTRY' },
    { icon: Factory, title: t('print.industryLabel'), value: t('print.industryValue') },
    { icon: ShieldCheck, title: t('print.administratorLabel'), value: report.preparedBy || 'System User' },
    { icon: CheckCircle2, title: t('print.printStatusLabel'), value: t('print.printStatusValue') }
  ];

  return (
    <div className="business-overview-grid no-print">
      {cards.map(({ icon: Icon, title, value }) => (
        <GlassSurface key={title} className="business-overview-card">
          <div className="metric-icon"><Icon size={20} /></div>
          <span>{title}</span>
          <strong>{value}</strong>
        </GlassSurface>
      ))}
    </div>
  );
}

function PrintWorkspace({ report, zoom, status, error, documentRef, onRetry }) {
  const { t } = useTranslation();
  const documentReady = (status === 'ready' || status === 'printing') && report;
  return (
    <div className="print-workspace-shell">
      <div className="paper-ruler paper-ruler-top no-print" aria-hidden="true" />
      <div className="paper-ruler paper-ruler-left no-print" aria-hidden="true" />
      {status === 'loading' && (
        <div className="print-preview-state" role="status">
          <span className="print-preview-spinner" aria-hidden="true" />
          <strong>{t('print.preparingReport')}</strong>
          <p>{t('print.loadingAssets')}</p>
        </div>
      )}
      {status === 'error' && (
        <div className="print-preview-state print-preview-error" role="alert">
          <strong>{t('print.errorPreparing')}</strong>
          <p>{error}</p>
          <button className="primary-btn" type="button" onClick={onRetry}>{t('print.tryAgain')}</button>
        </div>
      )}
      {documentReady ? (
        <>
          <div className="print-margin-guide no-print" aria-hidden="true" />
          <PrintDocument report={report} documentRef={documentRef} zoom={zoom} />
        </>
      ) : null}
    </div>
  );
}

function ActionDock({ onPrint, onThemeToggle, onDownloadData, onSettings, onLogout, onClose, onDownloadPng, zoom, setZoom, printDisabled, pngLoading }) {
  const { t } = useTranslation();
  const actions = [
    { label: t('print.dockPrint'), icon: Printer, tone: 'blue', onClick: onPrint, disabled: printDisabled || pngLoading },
    { label: t('print.dockExportPdf'), icon: FileDown, tone: 'green', onClick: onPrint, disabled: printDisabled || pngLoading },
    { label: pngLoading ? (t('print.exporting') || 'Exporting...') : t('print.dockExportPng'), icon: pngLoading ? Loader2 : Download, tone: 'purple', onClick: onDownloadPng, disabled: printDisabled || pngLoading },
    { label: t('print.dockDownload'), icon: DatabaseBackup, tone: 'cyan', onClick: onDownloadData, disabled: pngLoading },
    { label: t('print.dockTheme'), icon: Moon, tone: 'glass', onClick: onThemeToggle, disabled: pngLoading },
    { label: t('print.dockSettings'), icon: Settings, tone: 'glass', onClick: onSettings, disabled: pngLoading },
    { label: t('print.dockLogout'), icon: LogOut, tone: 'red', onClick: onLogout || onClose, disabled: pngLoading }
  ];

  return (
    <GlassSurface className="floating-action-dock no-print">
      <div className="zoom-cluster">
        <button onClick={() => setZoom(Math.max(0.72, Number((zoom - 0.08).toFixed(2))))} aria-label="Zoom out"><ZoomOut size={17} /></button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(1, Number((zoom + 0.08).toFixed(2))))} aria-label="Zoom in"><ZoomIn size={17} /></button>
      </div>
      {actions.map(({ label, icon: Icon, tone, onClick, disabled }) => (
        <button key={label} className={`dock-button dock-button-${tone}`} onClick={() => onClick?.()} disabled={disabled}>
          <Icon size={18} className={Icon === Loader2 ? 'animate-spin' : ''} />
          <span>{label}</span>
        </button>
      ))}
      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </GlassSurface>
  );
}

export default function GlassPrintPreview({
  open,
  onClose,
  report,
  onPrint,
  onThemeToggle,
  onDownloadData,
  onSettings,
  onLogout,
  status,
  error,
  onRetry,
  documentRef
}) {
  const [zoom, setZoom] = useState(0.86);
  const [pngLoading, setPngLoading] = useState(false);
  const [pngError, setPngError] = useState('');

  if (!open) return null;

  const downloadPng = async () => {
    if (!documentRef?.current) return;
    setPngLoading(true);
    setPngError('');
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(documentRef.current, {
        backgroundColor: 'var(--surface, #ffffff)',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        cacheBust: true
      });
      
      const link = document.createElement('a');
      const companyNameClean = (report?.company?.companyName || 'cashbook').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `${companyNameClean}_report_${dateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('PNG download error:', err);
      setPngError(err.message || 'Failed to generate PNG image.');
    } finally {
      setPngLoading(false);
    }
  };

  return (
    <div className="print-preview-overlay">
      <main className="print-preview-modal premium-print-preview flagship-preview">
        <div className="preview-ambient" aria-hidden="true" />
        <div className="preview-reflection" aria-hidden="true" />
        <DashboardHeader report={report || { preparedBy: 'Preparing report' }} onClose={onClose} />
        {report ? <BusinessOverview report={report} /> : null}
        {pngError && (
          <div className="print-preview-state print-preview-error no-print" role="alert" style={{ padding: '12px 24px', margin: '12px 24px 0', borderRadius: '12px' }}>
            <strong>PNG Export Failed</strong>
            <p>{pngError}</p>
          </div>
        )}
        <section className="print-preview-studio">
          <PrintWorkspace
            report={report}
            zoom={zoom}
            status={status}
            error={error}
            documentRef={documentRef}
            onRetry={onRetry}
          />
        </section>
        <ActionDock
          onPrint={onPrint}
          onThemeToggle={onThemeToggle}
          onDownloadData={onDownloadData}
          onSettings={onSettings}
          onLogout={onLogout}
          onClose={onClose}
          onDownloadPng={downloadPng}
          zoom={zoom}
          setZoom={setZoom}
          printDisabled={status !== 'ready'}
          pngLoading={pngLoading}
        />
      </main>
    </div>
  );
}
