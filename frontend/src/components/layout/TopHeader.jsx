import { Clock3, LogOut, Moon, Printer, Sun, Search, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import CompanyLogo from '../CompanyLogo';

export default function TopHeader({ title, onThemeToggle, onPrint, currentUser, onLogout, companyName, companyLogo, theme, onSearchClick, setMobileOpen }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeLabel = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <header className="top-header print-only-hide" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.15)', background: 'transparent' }}>
      <div className="top-header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu" style={{ display: 'none' }}>
          <Menu size={20} />
        </button>
        <CompanyLogo logo={companyLogo} name={companyName} size="sm" />
        <div className="header-titles">
          <p className="eyebrow" style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>Professional Business Management</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 className="page-title" style={{ margin: 0, fontSize: '1.25rem', whiteSpace: 'nowrap' }}>{title}</h2>
            <div className="branch-selector-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="branch-dropdown-pill" style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', borderRadius: '16px', padding: '4px 12px', height: '32px', display: 'flex', alignItems: 'center' }}>
                <select className="branch-select-input" aria-label="Branch select filter" style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', fontSize: '0.85rem' }}>
                  <option value="consolidated">All Branches (Consolidated)</option>
                  <option value="branch-a">Branch A</option>
                  <option value="branch-b">Branch B</option>
                  <option value="branch-c">Branch C</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="topbar-search-wrapper" onClick={onSearchClick} style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
        <div className="topbar-search-input-container" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '0 16px', height: '44px', cursor: 'pointer', transition: 'all 0.2s' }}>
          <Search size={18} className="search-icon" style={{ opacity: 0.6 }} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="topbar-search-input"
            readOnly
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0 12px', color: 'inherit', cursor: 'pointer' }}
          />
          <kbd className="search-kbd" style={{ background: 'var(--surface-strong)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', opacity: 0.8 }}>⌘K</kbd>
        </div>
      </div>

      <div className="top-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
        <div className="time-chip" aria-label="Current date and time" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '24px', height: '44px' }}>
          <Clock3 size={16} aria-hidden="true" style={{ opacity: 0.7 }} />
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <strong style={{ fontSize: '0.85rem' }}>{dateLabel}</strong>
            <small style={{ fontSize: '0.7rem', opacity: 0.8 }}>{timeLabel}</small>
          </span>
        </div>
        {currentUser && (
          <div className="signed-in-user" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', height: '44px', padding: '0 8px', lineHeight: 1.2 }}>
            <span className="user-name" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.full_name || currentUser.username}</span>
            <small className="user-role" style={{ fontSize: '0.7rem', opacity: 0.8 }}>{currentUser.role}</small>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="ghost-btn icon-btn" onClick={onThemeToggle} aria-label="Toggle theme" title="Toggle theme" style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="secondary-btn icon-btn" onClick={onPrint} aria-label="Print" title="Print" style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <Printer size={18} />
          </button>
          {currentUser && (
            <button className="danger-btn icon-btn" onClick={() => onLogout()} aria-label="Log out" title="Log out" style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
