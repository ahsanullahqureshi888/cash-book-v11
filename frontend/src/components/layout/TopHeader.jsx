import { Clock3, Moon, Printer, Sun, Search, Menu, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TopHeader({ 
  title, 
  onThemeToggle, 
  onPrint, 
  currentUser, 
  onLogout, 
  companyName, 
  companyLogo, 
  theme, 
  onSearchClick, 
  setMobileOpen 
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  const timeLabel = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <header className="app-topbar print-only-hide">
      {/* Title & Eyebrow */}
      <div className="topbar-title-area">
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileOpen(true)} 
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="header-titles">
          <p className="eyebrow">Professional Business Management</p>
          <h1 className="page-title">{title}</h1>
        </div>
      </div>
      
      {/* Branch Selector Pill */}
      <div className="topbar-branch">
        <div className="branch-dropdown-pill">
          <Building2 size={14} className="branch-icon" />
          <select className="branch-select-input" aria-label="Branch select filter">
            <option value="consolidated">All Branches (Consolidated)</option>
            <option value="branch-a">Main Branch - Kabul</option>
            <option value="branch-b">Branch B - Herat</option>
            <option value="branch-c">Branch C - Mazar</option>
          </select>
        </div>
      </div>
      
      {/* Central Global Search Field */}
      <div className="topbar-search" onClick={onSearchClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSearchClick()}>
        <div className="topbar-search-input-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search accounts, transactions, reports..." 
            className="topbar-search-input"
            readOnly
          />
          <kbd className="search-kbd">⌘K</kbd>
        </div>
      </div>

      {/* Right Action Buttons & Clock */}
      <div className="topbar-actions">
        <div className="time-chip" aria-label="Current date and time">
          <Clock3 size={15} aria-hidden="true" />
          <span className="time-chip-text">
            <strong>{dateLabel}</strong>
            <small>{timeLabel}</small>
          </span>
        </div>

        <div className="topbar-buttons">
          <button className="ghost-btn icon-btn" onClick={onThemeToggle} aria-label="Toggle theme" title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="ghost-btn icon-btn" onClick={onPrint} aria-label="Print" title="Print studio">
            <Printer size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
