import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  BookOpenText, 
  UsersRound, 
  ArrowRightLeft, 
  Settings, 
  LogOut,
  Building2,
  Users,
  UserRoundCog,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Printer,
  DatabaseBackup,
  RotateCcw
} from 'lucide-react';

export default function Sidebar({ 
  activeView, 
  setView, 
  mobileOpen, 
  setMobileOpen, 
  companyName, 
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
  const isSuperOrAdmin = userRole === 'Super Administrator' || userRole === 'Administrator';

  // Dynamic Navigation Items matching user role & original routes
  const allItems = [
    { id: 'dashboard', label: t('Dashboard'), icon: LayoutDashboard, path: '/' },
    { id: 'cashbook', label: t('Cash Book'), icon: BookOpenText, path: '/cashbook' },
    { id: 'ledger', label: t('Account Ledger'), icon: UsersRound, path: '/ledger' },
    { id: 'accounts', label: t('Accounts'), icon: Users, roles: ['Super Administrator', 'Administrator', 'Manager'], path: '/accounts' },
    { id: 'salary', label: t('Employees & Salary'), icon: UserRoundCog, roles: ['Super Administrator', 'Administrator'], path: '/salary' },
    { id: 'reports', label: t('Reports'), icon: BarChart3, roles: ['Super Administrator', 'Administrator', 'Manager', 'Accountant'], path: '/reports' },
    { id: 'converter', label: t('Converter'), icon: ArrowRightLeft, path: '/converter' },
  ];

  const systemItems = [
    { id: 'settings', label: t('Settings'), icon: Settings, roles: ['Super Administrator', 'Administrator'], path: '/settings' }
  ];

  const hasAccess = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  };

  const navItems = allItems.filter(hasAccess);
  const bottomItems = systemItems.filter(hasAccess);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

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

  // Profile Widget Initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-overlay print-only-hide"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
            border: 'none',
            cursor: 'pointer'
          }}
        />
      )}

      <aside 
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''} print-only-hide`}
        aria-expanded={mobileOpen}
        style={{
          width: isCollapsed ? '84px' : '280px',
          background: 'rgba(255, 252, 248, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(212, 175, 55, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          padding: isCollapsed ? '24px 10px' : '24px 16px',
          boxSizing: 'border-box',
          boxShadow: '4px 0 24px rgba(212, 175, 55, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          zIndex: 50
        }}
      >
        {/* Brand & Logo Section */}
        <div style={{ padding: '0 8px', marginBottom: '32px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isCollapsed ? '0px' : '24px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #d4af37, #c8900a)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
              flexShrink: 0
            }}>
              <Building2 color="white" size={20} />
            </div>
            {!isCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--gold-dark)', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Sky Ariana & <br/>Balam Bar Baran
                </h1>
              </div>
            )}
            
            {/* Collapse toggle button */}
            {!isCollapsed && !mobileOpen && (
              <button 
                onClick={() => setIsCollapsed(true)} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--gold-text)', 
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.7
                }}
                title={t('Collapse Sidebar')}
              >
                <PanelLeftClose size={18} />
              </button>
            )}
            {isCollapsed && (
              <button 
                onClick={() => setIsCollapsed(false)} 
                style={{ 
                  position: 'absolute',
                  top: '20px',
                  right: '-12px',
                  background: '#ffffff',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-text)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                title={t('Expand Sidebar')}
              >
                <PanelLeftOpen size={12} />
              </button>
            )}
            {mobileOpen && (
              <button 
                onClick={() => setMobileOpen(false)} 
                style={{ 
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--gold-text)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                aria-label="Close Sidebar"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Company Selector */}
          {!isCollapsed && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {companyName || t('All Branches')}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--gold-primary)' }}>▼</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {!isCollapsed && (
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#b49030', margin: '0 0 8px 12px', fontWeight: 600 }}>
              {t('Menu')}
            </p>
          )}
          
          {navItems.map((item) => (
            <SidebarLink 
              key={item.id} 
              to={item.path} 
              icon={<item.icon size={18} />} 
              label={item.label} 
              end={item.path === '/'} 
              isCollapsed={isCollapsed}
            />
          ))}

          {/* Quick Tools Header */}
          {!isCollapsed && (
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#b49030', margin: '16px 0 8px 12px', fontWeight: 600 }}>
              {t('Quick Tools')}
            </p>
          )}

          {/* Quick Tool Links */}
          <SidebarActionButton 
            onClick={onPrint} 
            icon={<Printer size={18} />} 
            label={t('Print Preview')} 
            isCollapsed={isCollapsed} 
          />
          {isSuperOrAdmin && (
            <>
              <SidebarActionButton 
                onClick={onBackup} 
                icon={<DatabaseBackup size={18} />} 
                label={t('Backup')} 
                isCollapsed={isCollapsed} 
              />
              <SidebarActionButton 
                onClick={onRestore} 
                icon={<RotateCcw size={18} />} 
                label={t('Restore')} 
                isCollapsed={isCollapsed} 
              />
            </>
          )}

          {/* System Settings Links */}
          {bottomItems.map((item) => (
            <SidebarLink 
              key={item.id} 
              to={item.path} 
              icon={<item.icon size={18} />} 
              label={item.label} 
              isCollapsed={isCollapsed}
              style={{ marginTop: 'auto' }}
            />
          ))}
        </nav>

        {/* User Profile Widget */}
        <div style={{
          marginTop: '16px',
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '16px',
          padding: isCollapsed ? '8px' : '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '12px', 
              background: '#f3e5ab', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: '#c8900a', 
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {getInitials(currentUser?.full_name || currentUser?.username)}
            </div>
            {!isCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser?.full_name || currentUser?.username || t('Guest')}
                </div>
                <div style={{ fontSize: '12px', color: '#7c5e00', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', background: '#d4af37', borderRadius: '50%', display: 'inline-block' }}></span>
                  {t(currentUser?.role || 'Viewer')}
                </div>
              </div>
            )}
          </div>
          
          {currentUser && (
            <button 
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: isCollapsed ? '10px 0' : '10px',
                background: 'rgba(225, 29, 72, 0.05)',
                border: '1px solid rgba(225, 29, 72, 0.1)',
                borderRadius: '10px',
                color: '#e11d48',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '13px'
              }}
              title={isCollapsed ? t('Logout') : undefined}
            >
              <LogOut size={16} />
              {!isCollapsed && t('Logout')}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ to, icon, label, end = false, isCollapsed, style = {} }) {
  return (
    <NavLink 
      to={to} 
      end={end}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: isActive ? 600 : 500,
        color: isActive ? '#ffffff' : '#7c5e00',
        background: isActive ? 'linear-gradient(135deg, #d4a017, #c8900a)' : 'transparent',
        boxShadow: isActive ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none',
        transition: 'all 0.2s ease',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        ...style
      })}
      title={isCollapsed ? label : undefined}
    >
      {icon}
      {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
    </NavLink>
  );
}

function SidebarActionButton({ onClick, icon, label, isCollapsed }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        border: 'none',
        fontSize: '14px',
        fontWeight: 500,
        color: '#7c5e00',
        background: 'transparent',
        transition: 'all 0.2s ease',
        width: '100%',
        cursor: 'pointer',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        textAlign: 'left'
      }}
      title={isCollapsed ? label : undefined}
    >
      {icon}
      {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
    </button>
  );
}
