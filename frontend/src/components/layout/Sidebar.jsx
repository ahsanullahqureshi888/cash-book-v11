import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  BookOpen, 
  ScrollText, 
  WalletCards, 
  UsersRound, 
  ChartNoAxesCombined, 
  ArrowLeftRight, 
  DatabaseBackup, 
  Settings, 
  UserCog,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ChevronDown,
  User,
  KeyRound,
  Sliders,
  MoreVertical,
  LogOut
} from 'lucide-react';

export default function Sidebar({ 
  activeView, 
  setView, 
  mobileOpen, 
  setMobileOpen, 
  companyName = 'Cashbook Pro', 
  companyLogo = '',
  isCollapsed, 
  setIsCollapsed, 
  currentUser, 
  onPrint, 
  onBackup, 
  onRestore,
  onLogout 
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const userRole = currentUser?.role || 'Viewer';
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeBranch, setActiveBranch] = useState('Main Branch');
  const [branchOpen, setBranchOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  // Lock body scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileOpen]);

  // Handle Escape key for closing drawer & popover
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (userMenuOpen) setUserMenuOpen(false);
        if (branchOpen) setBranchOpen(false);
        if (mobileOpen) setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, userMenuOpen, branchOpen, setMobileOpen]);

  // Close user popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationSections = [
    {
      id: 'main',
      label: t('Main'),
      items: [
        { id: 'dashboard', label: t('Dashboard'), icon: LayoutDashboard, path: '/' },
        { id: 'cashbook', label: t('Cash Book'), icon: BookOpen, path: '/cashbook' },
        { id: 'ledger', label: t('Account Ledger'), icon: ScrollText, path: '/ledger' },
        { id: 'accounts', label: t('Accounts'), icon: WalletCards, roles: ['Super Administrator', 'Administrator', 'Manager'], path: '/accounts' },
        { id: 'salary', label: t('Employees & Salary'), icon: UsersRound, roles: ['Super Administrator', 'Administrator'], path: '/salary' }
      ]
    },
    {
      id: 'analytics',
      label: t('Analytics'),
      items: [
        { id: 'reports', label: t('Reports'), icon: ChartNoAxesCombined, roles: ['Super Administrator', 'Administrator', 'Manager', 'Accountant'], path: '/reports' },
        { id: 'converter', label: t('Converter'), icon: ArrowLeftRight, path: '/converter' }
      ]
    },
    {
      id: 'system',
      label: t('System'),
      items: [
        { id: 'backup', label: t('Backup'), icon: DatabaseBackup, roles: ['Super Administrator', 'Administrator'], path: '/backup' },
        { id: 'settings', label: t('Settings'), icon: Settings, roles: ['Super Administrator', 'Administrator'], path: '/settings' }
      ]
    }
  ];

  if (userRole === 'Super Administrator') {
    const systemSection = navigationSections.find(s => s.id === 'system');
    if (systemSection) {
      systemSection.items.push({
        id: 'security',
        label: t('User Management'),
        icon: UserCog,
        path: '/security'
      });
    }
  }

  const hasAccess = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const branches = ['Main Branch', 'Kabul Central', 'Herat Office', 'Mazar Regional'];

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay print-only-hide"
          role="button"
          tabIndex={0}
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === 'Enter' && setMobileOpen(false)}
        />
      )}

      <aside 
        className={`app-sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'is-open' : ''} print-only-hide`}
        aria-label="Main Navigation"
      >
        {/* 1. BRAND SECTION */}
        <div className="sidebar-brand">
          <div className="sidebar-brand__logo">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="sidebar-brand__logo-img" />
            ) : (
              <div className="sidebar-brand__logo-badge">
                <Building2 size={22} color="#ffffff" />
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="sidebar-brand__name" title={companyName}>
              {companyName}
            </div>
          )}

          {!isCollapsed && !mobileOpen && (
            <button 
              type="button"
              className="sidebar-collapse-button" 
              onClick={() => setIsCollapsed(true)} 
              title={t('Collapse Sidebar')}
              aria-label={t('Collapse Sidebar')}
            >
              <PanelLeftClose size={18} />
            </button>
          )}

          {isCollapsed && (
            <button 
              type="button"
              className="sidebar-collapse-button" 
              onClick={() => setIsCollapsed(false)} 
              title={t('Expand Sidebar')}
              aria-label={t('Expand Sidebar')}
            >
              <PanelLeftOpen size={16} />
            </button>
          )}

          {mobileOpen && (
            <button 
              type="button"
              className="sidebar-brand__close-mobile"
              onClick={() => setMobileOpen(false)} 
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* 2. BRANCH SELECTOR (Visible in Expanded Mode) */}
        {!isCollapsed && (
          <div className="sidebar-branch-wrap">
            <button 
              type="button"
              className="sidebar-branch" 
              onClick={() => setBranchOpen(!branchOpen)}
              aria-expanded={branchOpen}
              aria-label="Select Branch"
            >
              <div className="sidebar-branch__info">
                <Building2 size={16} className="sidebar-branch__icon" />
                <span className="sidebar-branch__name">{activeBranch}</span>
              </div>
              <ChevronDown size={14} className={`sidebar-branch__chevron ${branchOpen ? 'open' : ''}`} />
            </button>

            {branchOpen && (
              <div className="sidebar-branch-dropdown">
                {branches.map(b => (
                  <button 
                    key={b} 
                    type="button" 
                    className={`sidebar-branch-option ${b === activeBranch ? 'active' : ''}`}
                    onClick={() => { setActiveBranch(b); setBranchOpen(false); }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. NAVIGATION LINKS SECTIONS */}
        <nav className="sidebar-navigation">
          {navigationSections.map((section) => {
            const accessibleItems = section.items.filter(hasAccess);
            if (!accessibleItems.length) return null;
            return (
              <div key={section.id} className="sidebar-section">
                {!isCollapsed && <p className="sidebar-section-title">{section.label}</p>}
                {accessibleItems.map((item) => (
                  <SidebarLink 
                    key={item.id} 
                    to={item.path} 
                    icon={item.icon} 
                    label={item.label} 
                    end={item.path === '/'} 
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            );
          })}
        </nav>

        {/* 4. COMPACT USER SECTION & POPOVER MENU */}
        <div className="sidebar-user-area" ref={userMenuRef}>
          <div 
            className="sidebar-user-card"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            role="button"
            tabIndex={0}
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setUserMenuOpen(!userMenuOpen)}
            data-tooltip={`${currentUser?.full_name || currentUser?.username || 'User'} (${currentUser?.role || 'Viewer'})`}
            title={isCollapsed ? (currentUser?.full_name || currentUser?.username || 'User') : undefined}
          >
            <div className="sidebar-user-avatar">
              {getInitials(currentUser?.full_name || currentUser?.username)}
            </div>

            {!isCollapsed && (
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">
                  {currentUser?.full_name || currentUser?.username || t('Guest')}
                </div>
                <div className="sidebar-user-role">
                  {currentUser?.role || 'Viewer'}
                </div>
              </div>
            )}

            {!isCollapsed && (
              <button 
                type="button" 
                className="sidebar-user-trigger"
                aria-label="User Options Menu"
              >
                {userMenuOpen ? <ChevronDown size={16} /> : <MoreVertical size={16} />}
              </button>
            )}
          </div>

          {/* User Popover Dropdown Menu */}
          {userMenuOpen && (
            <div className="sidebar-user-popover">
              <div className="sidebar-user-popover__header">
                <strong>{currentUser?.full_name || currentUser?.username || 'User'}</strong>
                <span>{currentUser?.role || 'Viewer'}</span>
              </div>
              <div className="sidebar-user-popover__divider" />
              <NavLink 
                to="/settings" 
                className="sidebar-user-popover__item" 
                onClick={() => setUserMenuOpen(false)}
              >
                <User size={16} />
                <span>Profile</span>
              </NavLink>
              <NavLink 
                to="/settings" 
                className="sidebar-user-popover__item" 
                onClick={() => setUserMenuOpen(false)}
              >
                <Sliders size={16} />
                <span>Account settings</span>
              </NavLink>
              <NavLink 
                to="/settings" 
                className="sidebar-user-popover__item" 
                onClick={() => setUserMenuOpen(false)}
              >
                <KeyRound size={16} />
                <span>Change password</span>
              </NavLink>
              <div className="sidebar-user-popover__divider" />
              <button 
                type="button"
                className="sidebar-user-popover__item sidebar-user-popover__item--danger" 
                onClick={() => { setUserMenuOpen(false); if (onLogout) onLogout(); }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ to, icon: IconComponent, label, end = false, isCollapsed }) {
  const Icon = IconComponent || LayoutDashboard;
  return (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
      data-tooltip={label}
      aria-label={label}
    >
      <span className="sidebar-link__icon" aria-hidden="true">
        {Icon ? <Icon size={20} strokeWidth={1.9} /> : null}
      </span>
      {!isCollapsed && (
        <span className="sidebar-link__label">{label}</span>
      )}
    </NavLink>
  );
}
