import {
  BarChart3,
  Calculator,
  Circle,
  ClipboardList,
  DatabaseBackup,
  LayoutDashboard,
  Menu,
  Printer,
  ReceiptText,
  RotateCcw,
  Settings,
  UserRoundCog,
  Users,
  X,
  WalletCards
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function Sidebar({ activeView, setView, onPrint, onBackup, onRestore, mobileOpen, setMobileOpen, isCollapsed, setIsCollapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
  }, [activeView]);

  function navigate(view) {
    setView(view);
    setMobileOpen(false);
  }

  return (
    <>
      <button
        style={{
          position: 'fixed', top: '16px', left: '16px', zIndex: 50,
          padding: '8px', borderRadius: '12px', 
          background: 'var(--surface-strong)', color: 'var(--text)',
          border: '1px solid var(--border)', backdropFilter: 'var(--glass-blur)'
        }}
        className={`md:hidden ${mobileOpen ? 'hidden' : ''}`}
        type="button"
        aria-label="Open navigation menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <button
          style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          className="md:hidden"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} style={mobileOpen ? { position: 'fixed', left: 0, top: 0, bottom: 0, transform: 'translateX(0)' } : {}}>
        <div>
          {/* Brand */}
          <div className="brand" style={{ marginBottom: '32px', border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <img src="/logo192.png" alt="Cashbook Logo" style={{ width: isCollapsed ? '32px' : '40px', height: isCollapsed ? '32px' : '40px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s' }} />
            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Cashbook</h1>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-soft)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>All Companies</p>
              </div>
            )}
            <button className="collapse-btn hidden md:flex" onClick={() => setIsCollapsed(!isCollapsed)} style={{ marginLeft: isCollapsed ? '0' : 'auto', background: 'transparent', color: 'var(--text-soft)', padding: '4px', borderRadius: '8px', marginTop: isCollapsed ? '16px' : '0' }}>
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            {mobileOpen && (
              <button onClick={() => setMobileOpen(false)} style={{ marginLeft: 'auto', background: 'transparent', color: 'var(--text-soft)' }}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
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

        {/* System Actions section */}
        <div className="glass-card" style={{ marginTop: 'auto', padding: isCollapsed ? '16px 8px' : '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!isCollapsed && <h3 className="eyebrow" style={{ paddingLeft: '8px', marginBottom: '8px' }}>System</h3>}
          <button className="nav-btn" style={{ padding: isCollapsed ? '8px' : '8px 12px', fontSize: '0.85rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }} onClick={onPrint} title="Print Preview">
            <Printer size={18} />
            {!isCollapsed && <span>Print</span>}
          </button>
          <button className="nav-btn" style={{ padding: isCollapsed ? '8px' : '8px 12px', fontSize: '0.85rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }} onClick={onBackup} title="Backup Database">
            <DatabaseBackup size={18} />
            {!isCollapsed && <span>Backup</span>}
          </button>
          <button className="nav-btn" style={{ padding: isCollapsed ? '8px' : '8px 12px', fontSize: '0.85rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }} onClick={onRestore} title="Restore Database">
            <RotateCcw size={18} />
            {!isCollapsed && <span>Restore</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
