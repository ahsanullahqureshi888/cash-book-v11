import { useState } from 'react';
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
    <div className={`app-shell ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
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
      />
      <div className="app-main">
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
        <main className="app-content">
          <div className="page-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
