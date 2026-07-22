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
  LogOut,
  ChevronsUpDown,
  Check,
  PlusCircle,
  Database,
  Ship
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import SkyArianaLogo from '../SkyArianaLogo';

function getUserInitials(user) {
  const value = user?.full_name?.trim() || user?.username?.trim() || 'User';
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Clean & Fixed Company Logo Badge Component
 */
function RenderCompanyLogo({ company, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [company?.logo, company?.id]);

  return (
    <div className={`relative shrink-0 ${className}`}>
      {company?.logo && !imgError ? (
        <div className="w-full h-full rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center p-0.5">
          <img 
            src={company.logo} 
            alt={company.name} 
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        </div>
      ) : company?.id === 'sky-ariana' ? (
        <div className="w-full h-full rounded-xl bg-slate-900 border border-blue-500/30 shadow-sm flex items-center justify-center p-1">
          <SkyArianaLogo size={size === 'lg' ? 36 : 28} />
        </div>
      ) : (
        <div className="w-full h-full rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
          {company?.code || company?.name?.slice(0, 2) || 'CO'}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ 
  activeView, 
  setView, 
  mobileOpen, 
  setMobileOpen, 
  isCollapsed, 
  setIsCollapsed, 
  currentUser, 
  onPrint, 
  onBackup, 
  onRestore,
  onLogout,
  onAddCompanyClick
}) {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Consume Multi-Tenant Context
  const { 
    currentCompany, 
    activeBranch, 
    companies, 
    switchCompany, 
    switchBranch,
    isSwitching 
  } = useCompany();

  const userRole = currentUser?.role || 'Viewer';
  
  // Dropdown States
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Refs & Positions for Portal Menus
  const companySwitcherRef = useRef(null);
  const companyMenuPortalRef = useRef(null);
  const userCardRef = useRef(null);
  const popoverRef = useRef(null);

  const [companyDropdownStyle, setCompanyDropdownStyle] = useState({ top: '0px', left: '0px', width: '260px' });
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

  // Handle Escape key for closing popovers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (companyDropdownOpen) setCompanyDropdownOpen(false);
        if (branchOpen) setBranchOpen(false);
        if (userMenuOpen) setUserMenuOpen(false);
        if (mobileOpen) setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, userMenuOpen, branchOpen, companyDropdownOpen, setMobileOpen]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        companyDropdownOpen &&
        companySwitcherRef.current &&
        !companySwitcherRef.current.contains(e.target) &&
        companyMenuPortalRef.current &&
        !companyMenuPortalRef.current.contains(e.target)
      ) {
        setCompanyDropdownOpen(false);
      }

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
  }, [companyDropdownOpen, userMenuOpen]);

  // Compute Portal Position for Company Switcher Menu
  useLayoutEffect(() => {
    if (companyDropdownOpen && companySwitcherRef.current) {
      const rect = companySwitcherRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        setCompanyDropdownStyle({
          top: `${rect.bottom + 8}px`,
          left: '16px',
          width: `${window.innerWidth - 32}px`,
          position: 'fixed',
          zIndex: 9999
        });
      } else if (isCollapsed) {
        setCompanyDropdownStyle({
          top: `${Math.max(12, rect.top)}px`,
          left: `${rect.right + 10}px`,
          width: '270px',
          position: 'fixed',
          zIndex: 9999
        });
      } else {
        setCompanyDropdownStyle({
          top: `${rect.bottom + 4}px`,
          left: `${rect.left + 12}px`,
          width: `${Math.max(240, rect.width - 24)}px`,
          position: 'fixed',
          zIndex: 9999
        });
      }
    }
  }, [companyDropdownOpen, isCollapsed]);

  // Compute portal popover position for User Menu
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
        { id: 'exports', label: t('Export Accounts'), icon: Ship, path: '/exports' },
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

  const currentBranches = currentCompany?.branches || ['Main Branch'];

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
        className={`app-sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'is-open' : ''} print-only-hide print:hidden no-print relative`}
        aria-label="Main Navigation"
      >
        {/* Loading overlay during multi-tenant database context switch */}
        {isSwitching && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center transition-all duration-200">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t('Switching Database...')}
            </span>
          </div>
        )}

        {/* 1. PRIMARY COMPANY SWITCHER SECTION */}
        <div className="sidebar-brand-wrapper relative p-3 border-b border-slate-100 dark:border-slate-800/80" ref={companySwitcherRef}>
          <div className="flex items-center justify-between gap-2">
            {/* Primary Company Switcher Trigger Button */}
            <div
              className={`flex items-center gap-2.5 flex-1 min-w-0 p-2 rounded-xl text-left transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${
                companyDropdownOpen ? 'bg-slate-100 dark:bg-slate-800/80 ring-1 ring-blue-500/30' : ''
              }`}
              onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
              role="button"
              tabIndex={0}
              aria-expanded={companyDropdownOpen}
              aria-haspopup="listbox"
              title={isCollapsed ? currentCompany.name : undefined}
            >
              {/* Clean Stable Company Logo Badge */}
              <RenderCompanyLogo 
                company={currentCompany} 
                size="md" 
                className="w-10 h-10 shrink-0" 
              />

              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate tracking-tight leading-tight">
                      {currentCompany.shortName || currentCompany.name}
                    </span>
                    {currentCompany.id === 'sky-ariana' && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-blue-600 text-white leading-none">
                        SKY
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Database size={10} className="text-blue-500 shrink-0" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                      {currentCompany.dbName?.replace('cashbook_', '') || 'db_active'}
                    </span>
                  </div>
                </div>
              )}

              {!isCollapsed && (
                <ChevronsUpDown size={16} className="text-slate-400 shrink-0 ml-auto" />
              )}
            </div>

            {/* Sidebar Collapse Toggle Button */}
            {!mobileOpen && (
              <button 
                type="button"
                className="sidebar-collapse-button p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                title={isCollapsed ? t('Expand Sidebar') : t('Collapse Sidebar')}
                aria-label={isCollapsed ? t('Expand Sidebar') : t('Collapse Sidebar')}
              >
                {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
            )}

            {mobileOpen && (
              <button 
                type="button"
                className="sidebar-brand__close-mobile p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                onClick={() => setMobileOpen(false)} 
                aria-label="Close Sidebar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* 2. DYNAMIC BRANCH SELECTOR SECTION */}
        <div className="sidebar-branch-wrap px-3 py-2">
          <button 
            type="button"
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium ${
              branchOpen ? 'ring-2 ring-blue-500/20 border-blue-500/40' : ''
            }`}
            onClick={() => setBranchOpen(!branchOpen)}
            aria-expanded={branchOpen}
            aria-label="Select Active Branch"
            title={isCollapsed ? `${currentCompany.shortName}: ${activeBranch}` : undefined}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 size={15} className="text-amber-500 dark:text-amber-400 shrink-0" />
              {!isCollapsed && (
                <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                  {activeBranch}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${branchOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Dynamic Branch Dropdown Options */}
          {branchOpen && (
            <div className={`mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1 space-y-0.5 animate-in fade-in duration-150 ${
              isCollapsed ? 'absolute left-16 z-50 w-52 shadow-xl' : 'w-full'
            }`}>
              <div className="px-2 py-1 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                {currentCompany.shortName} {t('Branches')}
              </div>
              {currentBranches.map(b => (
                <button 
                  key={b} 
                  type="button" 
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    b === activeBranch 
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  onClick={() => { 
                    switchBranch(b); 
                    setBranchOpen(false); 
                  }}
                >
                  <span className="truncate">{b}</span>
                  {b === activeBranch && <Check size={13} className="text-amber-600 dark:text-amber-400 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. NAVIGATION LINKS SECTIONS */}
        <nav className="sidebar-navigation flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {navigationSections.map((section) => {
            const accessibleItems = section.items.filter(hasAccess);
            if (!accessibleItems.length) return null;
            return (
              <div key={section.id} className="sidebar-section space-y-1">
                {!isCollapsed && (
                  <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {section.label}
                  </p>
                )}
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
        <div className="sidebar-user-area p-3 border-t border-slate-100 dark:border-slate-800/80">
          <button 
            type="button"
            className="sidebar-user-card w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left focus:outline-none"
            ref={userCardRef}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            data-tooltip={`${currentUser?.full_name || currentUser?.username || 'User'} (${currentUser?.role || 'Viewer'})`}
            title={isCollapsed ? (currentUser?.full_name || currentUser?.username || 'User') : undefined}
          >
            <div className="sidebar-user-avatar w-8 h-8 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {getUserInitials(currentUser)}
            </div>

            {!isCollapsed && (
              <div className="sidebar-user-details flex flex-col min-w-0 flex-1">
                <strong className="sidebar-user-name text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {currentUser?.full_name || currentUser?.username || t('Guest')}
                </strong>
                <small className="sidebar-user-role text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.role || 'Viewer'}
                </small>
              </div>
            )}

            {!isCollapsed && (
              <ChevronsUpDown size={16} className="sidebar-user-chevron text-slate-400 shrink-0 ml-auto" aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>

      {/* 5. PORTAL-BASED COMPANY SWITCHER MENU */}
      {companyDropdownOpen && createPortal(
        <div 
          className="sidebar-company-popover-portal bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150" 
          style={companyDropdownStyle}
          ref={companyMenuPortalRef}
          role="listbox"
          aria-label="Select Accounting Profile / Company"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 mb-1">
            <span>{t('Select Accounting Profile')}</span>
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[9px] font-semibold">
              Multi-Tenant
            </span>
          </div>

          {companies.map((comp) => {
            const isSelected = comp.id === currentCompany.id;
            return (
              <div
                key={comp.id}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-50/90 dark:bg-blue-900/30 text-blue-950 dark:text-blue-100 font-medium ring-1 ring-blue-500/30 shadow-xs' 
                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
                onClick={() => {
                  switchCompany(comp.id);
                  setCompanyDropdownOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <RenderCompanyLogo 
                  company={comp} 
                  size="md" 
                  className="w-9 h-9 shrink-0" 
                />
                
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">
                      {comp.name}
                    </span>
                    {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="truncate font-mono">{comp.dbName}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[10px] px-1 bg-slate-100 dark:bg-slate-800 rounded font-semibold">
                      {comp.currency}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Company Option */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 mt-1">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 p-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors"
              onClick={() => {
                setCompanyDropdownOpen(false);
                if (onAddCompanyClick) onAddCompanyClick();
              }}
            >
              <PlusCircle size={15} />
              <span>{t('Add New Company')}</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* 6. PORTAL-BASED USER MENU POPOVER */}
      {userMenuOpen && createPortal(
        <div 
          className="sidebar-user-popover-portal bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150" 
          style={popoverStyle}
          ref={popoverRef}
          role="menu"
          aria-label="User Options Menu"
        >
          <div className="sidebar-user-popover__header px-3 py-2 border-b border-slate-100 dark:border-slate-800">
            <strong className="sidebar-user-name block text-xs font-bold text-slate-900 dark:text-slate-100">
              {currentUser?.full_name || currentUser?.username || 'User'}
            </strong>
            <small className="sidebar-user-role text-[11px] text-slate-500 dark:text-slate-400">
              {currentUser?.role || 'Viewer'}
            </small>
          </div>
          <NavLink 
            to="/settings" 
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            role="menuitem"
            onClick={() => setUserMenuOpen(false)}
          >
            <User size={15} />
            <span>{t('Profile')}</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            role="menuitem"
            onClick={() => setUserMenuOpen(false)}
          >
            <Sliders size={15} />
            <span>{t('Account settings')}</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            role="menuitem"
            onClick={() => setUserMenuOpen(false)}
          >
            <KeyRound size={15} />
            <span>{t('Change password')}</span>
          </NavLink>
          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
          <button 
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left" 
            role="menuitem"
            onClick={() => { setUserMenuOpen(false); if (onLogout) onLogout(); }}
          >
            <LogOut size={15} />
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
        className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
          isActive 
            ? 'bg-amber-500 text-white font-semibold shadow-sm' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
        }`}
        aria-label={label}
        data-tooltip={label}
        onMouseEnter={handleShowTooltip}
        onMouseLeave={handleHideTooltip}
        onFocus={handleShowTooltip}
        onBlur={handleHideTooltip}
      >
        <span className="shrink-0" aria-hidden="true">
          <Icon size={18} strokeWidth={2} />
        </span>
        {!isCollapsed && <span className="truncate">{label}</span>}
      </NavLink>

      {isCollapsed && showTooltip && createPortal(
        <div 
          className="sidebar-tooltip-portal bg-slate-900 text-white text-xs font-medium px-2.5 py-1 rounded-lg shadow-lg pointer-events-none z-50 animate-in fade-in duration-100" 
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
