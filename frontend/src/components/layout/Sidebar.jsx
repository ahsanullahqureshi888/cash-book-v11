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

export default function Sidebar({ activeView, setView, mobileOpen, setMobileOpen, companyName, isCollapsed, setIsCollapsed }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cashbook', label: 'Cash Book', icon: ReceiptText },
    { id: 'ledger', label: 'Ledger', icon: ClipboardList },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'salary', label: 'Employees & Salary', icon: UserRoundCog },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'converter', label: 'Converter', icon: Calculator },
    { id: 'backup', label: 'Backup', icon: DatabaseBackup },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

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
        <div className="sidebar-inner">
          <div className="brand" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <img src="/logo192.png" alt="Cashbook Logo" className="brand-logo" style={{ width: isCollapsed ? '32px' : '40px', height: isCollapsed ? '32px' : '40px', transition: 'all 0.2s' }} />
            {!isCollapsed && (
              <div className="brand-text">
                <h1>Cashbook</h1>
                <p>{companyName || 'All Companies'}</p>
              </div>
            )}
            <button className="collapse-btn hidden md:flex" onClick={() => setIsCollapsed(!isCollapsed)} style={{ marginLeft: isCollapsed ? '0' : 'auto', background: 'transparent', color: 'var(--text-soft)', padding: '4px', borderRadius: '8px', marginTop: isCollapsed ? '16px' : '0' }}>
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            {mobileOpen && (
              <button onClick={() => setMobileOpen(false)} className="close-sidebar-btn" aria-label="Close Sidebar">
                <X size={18} />
              </button>
            )}
          </div>

          <nav className="nav-links" aria-label="Primary navigation">
            {items.map(({ id, label, icon: Icon }) => {
              const active = activeView === id;
              return (
                <button
                  key={id}
                  className={`nav-btn ${active ? 'active' : ''}`}
                  onClick={() => navigate(id)}
                  aria-label={label}
                  style={!active ? { color: 'var(--text-soft)' } : {}}
                >
                  <SidebarIcon icon={Icon} size={20} active={active} />
                  {!isCollapsed && <span>{label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
