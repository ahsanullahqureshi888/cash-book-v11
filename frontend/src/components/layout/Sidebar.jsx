import {
  BarChart3,
  Calculator,
  Circle,
  ClipboardList,
  DatabaseBackup,
  LayoutDashboard,
  ReceiptText,
  Settings,
  UserRoundCog,
  Users,
  X
} from 'lucide-react';
import { useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Printer, RotateCcw } from 'lucide-react';

export default function Sidebar({ activeView, setView, mobileOpen, setMobileOpen, companyName, isCollapsed, setIsCollapsed, currentUser, onPrint, onBackup, onRestore }) {
  const { t } = useTranslation();
  const userRole = currentUser?.role || 'Viewer';
  const isSuperOrAdmin = userRole === 'Super Administrator' || userRole === 'Administrator';

  const allItems = [
    { id: 'dashboard', label: t('Dashboard'), icon: LayoutDashboard },
    { id: 'cashbook', label: t('Cash Book'), icon: ReceiptText },
    { id: 'ledger', label: t('Ledger'), icon: ClipboardList },
    { id: 'accounts', label: t('Accounts'), icon: Users, roles: ['Super Administrator', 'Administrator', 'Manager'] },
    { id: 'salary', label: t('Employees & Salary'), icon: UserRoundCog, roles: ['Super Administrator', 'Administrator'] },
    { id: 'reports', label: t('Reports'), icon: BarChart3, roles: ['Super Administrator', 'Administrator', 'Manager', 'Accountant'] },
    { id: 'converter', label: t('Converter'), icon: Calculator },
  ];

  const systemItems = [
    { id: 'settings', label: t('Settings'), icon: Settings, roles: ['Super Administrator', 'Administrator'] }
  ];

  const hasAccess = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  };

  const navItems = allItems.filter(hasAccess);
  const bottomItems = systemItems.filter(hasAccess);

  const ActionIconFallback = Circle;

  function SidebarIcon({ icon: Icon, size = 18, active }) {
    const IconComponent = Icon || ActionIconFallback;
    return (
      <div style={{ filter: active ? 'drop-shadow(0 2px 4px var(--gold-glow))' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconComponent className="shrink-0" size={size} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
      </div>
    );
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [activeView, setMobileOpen]);

  function navigate(view) {
    setView(view);
    setMobileOpen(false);
  }

  // Close when pressing Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileOpen, setMobileOpen]);

  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-overlay print-only-hide"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''} print-only-hide`} aria-expanded={mobileOpen}>
        <div className="sidebar-inner" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, gap: 0 }}>
          
          {/* 1. Fixed Branding Area */}
          <div className="brand" style={{ padding: '24px 18px', borderBottom: '1px solid var(--border-muted)', flexShrink: 0, display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
            <img src="/logo192.png" alt="Cashbook Logo" className="brand-logo" style={{ width: isCollapsed ? '32px' : '40px', height: isCollapsed ? '32px' : '40px', transition: 'all 0.2s' }} />
            {!isCollapsed && (
              <div className="brand-text" style={{ overflow: 'hidden' }}>
                <h1 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('Cashbook')}</h1>
                <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{companyName || t('All Companies')}</p>
              </div>
            )}
            <button className="collapse-btn hidden md:flex" onClick={() => setIsCollapsed(!isCollapsed)} style={{ marginLeft: isCollapsed ? '0' : 'auto', background: 'transparent', color: 'var(--text-soft)', padding: '4px', borderRadius: '8px' }}>
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            {mobileOpen && (
              <button onClick={() => setMobileOpen(false)} className="close-sidebar-btn" aria-label="Close Sidebar" style={{ marginLeft: 'auto' }}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* 2. Vertically Scrollable Navigation Area */}
          <nav className="nav-links" aria-label="Primary navigation" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map(({ id, label, icon: Icon }) => {
              const active = activeView === id;
              return (
                <button
                  key={id}
                  className={`nav-btn ${active ? 'active' : ''}`}
                  onClick={() => navigate(id)}
                  aria-label={label}
                  style={!active ? { color: 'var(--text-soft)' } : {}}
                  title={isCollapsed ? label : undefined}
                >
                  <SidebarIcon icon={Icon} size={20} active={active} />
                  {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                </button>
              );
            })}
          </nav>

          {/* 3. Compact Bottom User/System Area */}
          <div className="system-links" style={{ flexShrink: 0, padding: '16px 18px', borderTop: '1px solid var(--border-muted)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--surface-soft)' }}>
            {/* Quick Tools */}
            {!isCollapsed && <h3 className="eyebrow" style={{ paddingLeft: '8px', marginBottom: '4px' }}>{t('QUICK TOOLS')}</h3>}
            <button
              className="nav-btn"
              onClick={onPrint}
              aria-label={t('Print Preview')}
              title={isCollapsed ? t('Print Preview') : undefined}
              style={{ color: 'var(--text-soft)' }}
            >
              <SidebarIcon icon={Printer} size={20} />
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{t('Print Preview')}</span>}
            </button>
            {isSuperOrAdmin && (
              <>
                <button
                  className="nav-btn"
                  onClick={onBackup}
                  aria-label={t('Backup')}
                  title={isCollapsed ? t('Backup') : undefined}
                  style={{ color: 'var(--text-soft)' }}
                >
                  <SidebarIcon icon={DatabaseBackup} size={20} />
                  {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{t('Backup')}</span>}
                </button>
                <button
                  className="nav-btn"
                  onClick={onRestore}
                  aria-label={t('Restore')}
                  title={isCollapsed ? t('Restore') : undefined}
                  style={{ color: 'var(--text-soft)' }}
                >
                  <SidebarIcon icon={RotateCcw} size={20} />
                  {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{t('Restore')}</span>}
                </button>
              </>
            )}

            {bottomItems.length > 0 && bottomItems.map(({ id, label, icon: Icon }) => {
              const active = activeView === id;
              return (
                <button
                  key={id}
                  className={`nav-btn ${active ? 'active' : ''}`}
                  onClick={() => navigate(id)}
                  aria-label={label}
                  style={!active ? { color: 'var(--text-soft)', marginTop: '8px' } : { marginTop: '8px' }}
                  title={isCollapsed ? label : undefined}
                >
                  <SidebarIcon icon={Icon} size={20} active={active} />
                  {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                </button>
              );
            })}
          </div>
          
        </div>
      </aside>
    </>
  );
}
