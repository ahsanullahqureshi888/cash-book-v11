import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function AppShell({ 
  children, 
  activeView, 
  setView, 
  companyName, 
  title, 
  onThemeToggle, 
  onPrint, 
  onBackup,
  onRestore,
  currentUser, 
  onLogout, 
  companyLogo, 
  theme, 
  onSearchClick 
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={`app-shell ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
      style={{
        display: 'flex', 
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'transparent' // transparent to let global gradient shine through
      }}
    >
      <Sidebar 
        activeView={activeView} 
        setView={setView} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        companyName={companyName}
        currentUser={currentUser}
        onPrint={onPrint}
        onBackup={onBackup}
        onRestore={onRestore}
        onLogout={onLogout}
      />
      
      {/* Main Content Area */}
      <div 
        className="app-main"
        style={{ 
          flex: 1, 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column',
          height: '100vh',
          boxSizing: 'border-box',
          overflowY: 'hidden', // Let children inner container scroll
          position: 'relative'
        }}
      >
        
        {/* The Glassmorphic Main Wrapper */}
        <main 
          className="app-content"
          style={{
            flex: 1,
            background: 'rgba(255, 252, 245, 0.55)',
            border: '1px solid rgba(212, 175, 55, 0.22)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '32px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(212, 175, 55, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Top Header Integration */}
          <TopHeader 
            title={title}
            onThemeToggle={onThemeToggle}
            onPrint={onPrint}
            currentUser={currentUser}
            onLogout={onLogout}
            companyName={companyName}
            companyLogo={companyLogo}
            theme={theme}
            onSearchClick={onSearchClick}
            setMobileOpen={setMobileOpen}
            isCollapsed={isCollapsed}
          />

          {/* Active Content Container */}
          <div 
            className="page-container"
            style={{ 
              padding: '32px', 
              overflowY: 'auto', 
              flex: 1 
            }}
          >
            {children || <Outlet />}
          </div>

        </main>
      </div>
    </div>
  );
}
