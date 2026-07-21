import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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
  LogOut,
  ChevronsUpDown
} from 'lucide-react';

function getUserInitials(user) {
  const value = user?.full_name?.trim() || user?.username?.trim() || 'User';
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

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
  const userCardRef = useRef(null);
  const popoverRef = useRef(null);
  const [popoverStyle, setPopoverStyle] = useState({ bottom: '0px', left: '0px', width: '230px' });

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
      if (
        userMenuOpen && 
        userCardRef.current && 
        !userCardRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Compute portal popover position
  useLayoutEffect(() => {
    if (userMenuOpen && userCardRef.current) {
      const rect = userCardRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        setPopoverStyle({
          bottom: '16px',
          left: '16px',
          width: `${window.innerWidth - 32}px`,
          position: 'fixed',
          zIndex: 9999
        });
      } else if (isCollapsed) {
        setPopoverStyle({
          bottom: `${Math.max(16, window.innerHeight - rect.bottom)}px`,
          left: `${rect.right + 12}px`,
          width: '230px',
          position: 'fixed',
          zIndex: 9999
        });
      } else {
        setPopoverStyle({
          bottom: `${Math.max(16, window.innerHeight - rect.top + 8)}px`,
          left: `${Math.max(12, rect.left)}px`,
          width: `${Math.max(230, rect.width)}px`,
          position: 'fixed',
          zIndex: 9999
        });
      }
    }
  }, [userMenuOpen, isCollapsed]);

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
          <button
            type="button"
            className="sidebar-brand__logo"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? t('Expand Sidebar') : t('Collapse Sidebar')}
            aria-label={isCollapsed ? t('Expand Sidebar') : t('Collapse Sidebar')}
          >
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="sidebar-brand__logo-img" />
            ) : (
              <div className="sidebar-brand__logo-badge">
                <Building2 size={22} color="#ffffff" />
              </div>
            )}
          </button>

          <div 
            className="sidebar-brand__name" 
            title={companyName}
            onClick={() => setIsCollapsed(!isCollapsed)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsCollapsed(!isCollapsed)}
          >
            {companyName}
          </div>

          {!mobileOpen && (
            <button 
              type="button"
              className="sidebar-collapse-button" 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              title={isCollapsed ? t('Expand Sidebar') : t('Collapse Sidebar')}
              aria-label={isCollapsed ? t('Expand Sidebar') : t('Collapse Sidebar')}
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={18} />}
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

        {/* 2. BRANCH SELECTOR */}
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

        {/* 3. NAVIGATION LINKS SECTIONS */}
        <nav className="sidebar-navigation">
          {navigationSections.map((section) => {
            const accessibleItems = section.items.filter(hasAccess);
            if (!accessibleItems.length) return null;
            return (
              <div key={section.id} className="sidebar-section">
                <p className="sidebar-section-title">{section.label}</p>
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

        {/* 4. COMPACT USER SECTION CARD */}
        <div className="sidebar-user-area">
          <button 
            type="button"
            className="sidebar-user-card"
            ref={userCardRef}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            data-tooltip={`${currentUser?.full_name || currentUser?.username || 'User'} (${currentUser?.role || 'Viewer'})`}
            title={isCollapsed ? (currentUser?.full_name || currentUser?.username || 'User') : undefined}
          >
            <div className="sidebar-user-avatar">
              {getUserInitials(currentUser)}
            </div>

            <div className="sidebar-user-details">
              <strong className="sidebar-user-name">
                {currentUser?.full_name || currentUser?.username || t('Guest')}
              </strong>
              <small className="sidebar-user-role">
                {currentUser?.role || 'Viewer'}
              </small>
            </div>

            <ChevronsUpDown size={16} className="sidebar-user-chevron" aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* 5. PORTAL-BASED USER MENU POPOVER */}
      {userMenuOpen && createPortal(
        <div 
          className="sidebar-user-popover-portal" 
          style={popoverStyle}
          ref={popoverRef}
          role="menu"
          aria-label="User Options Menu"
        >
          <div className="sidebar-user-popover__header">
            <strong className="sidebar-user-name">
              {currentUser?.full_name || currentUser?.username || 'User'}
            </strong>
            <small className="sidebar-user-role">
              {currentUser?.role || 'Viewer'}
            </small>
          </div>
          <div className="sidebar-user-popover__divider" />
          <NavLink 
            to="/settings" 
            className="sidebar-user-popover__item" 
            role="menuitem"
            onClick={() => setUserMenuOpen(false)}
          >
            <User size={16} />
            <span>{t('Profile')}</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className="sidebar-user-popover__item" 
            role="menuitem"
            onClick={() => setUserMenuOpen(false)}
          >
            <Sliders size={16} />
            <span>{t('Account settings')}</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className="sidebar-user-popover__item" 
            role="menuitem"
            onClick={() => setUserMenuOpen(false)}
          >
            <KeyRound size={16} />
            <span>{t('Change password')}</span>
          </NavLink>
          <div className="sidebar-user-popover__divider" />
          <button 
            type="button"
            className="sidebar-user-popover__item sidebar-user-popover__item--danger" 
            role="menuitem"
            onClick={() => { setUserMenuOpen(false); if (onLogout) onLogout(); }}
          >
            <LogOut size={16} />
            <span>{t('Logout')}</span>
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

function SidebarLink({ to, icon: IconComponent, label, end = false, isCollapsed }) {
  const Icon = IconComponent || LayoutDashboard;
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const linkRef = useRef(null);

  const handleShowTooltip = () => {
    if (isCollapsed && linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + (rect.height / 2) - 15,
        left: rect.right + 12
      });
      setShowTooltip(true);
    }
  };

  const handleHideTooltip = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <NavLink 
        ref={linkRef}
        to={to} 
        end={end}
        className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        aria-label={label}
        data-tooltip={label}
        onMouseEnter={handleShowTooltip}
        onMouseLeave={handleHideTooltip}
        onFocus={handleShowTooltip}
        onBlur={handleHideTooltip}
      >
        <span className="sidebar-link__icon" aria-hidden="true">
          <Icon size={20} strokeWidth={1.9} />
        </span>
        <span className="sidebar-link__label">{label}</span>
      </NavLink>

      {isCollapsed && showTooltip && createPortal(
        <div 
          className="sidebar-tooltip-portal" 
          style={{ 
            position: 'fixed',
            top: `${tooltipPos.top}px`, 
            left: `${tooltipPos.left}px`,
            zIndex: 9999
          }} 
          role="tooltip"
        >
          {label}
        </div>,
        document.body
      )}
    </>
  );
}
