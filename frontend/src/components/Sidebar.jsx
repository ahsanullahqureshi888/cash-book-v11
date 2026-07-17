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

export default function Sidebar({ activeView, setView, onPrint, onBackup, onRestore }) {
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

  function SidebarIcon({ icon: Icon, size = 18 }) {
    const IconComponent = Icon || ActionIconFallback;
    return <IconComponent className="shrink-0" size={size} strokeWidth={1.9} aria-hidden="true" />;
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
        className={`fixed top-4 left-4 z-50 p-2 rounded-xl bg-zinc-900/80 backdrop-blur border border-white/10 text-white md:hidden ${mobileOpen ? 'hidden' : ''}`}
        type="button"
        aria-label="Open navigation menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`w-64 min-h-screen bg-zinc-900/90 text-white backdrop-blur-xl flex flex-col p-4 justify-between transition-transform duration-300 border-r border-white/10 ${mobileOpen ? 'fixed inset-y-0 left-0 z-40 translate-x-0' : 'fixed inset-y-0 -translate-x-full md:relative md:translate-x-0'}`}>
        <div>
          {/* CB Circle Logo & Brand */}
          <div className="flex items-center justify-between px-2 mb-8 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-lg shrink-0 select-none border border-white/20">
                CB
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-extrabold tracking-tight leading-tight">Cashbook</h1>
                <p className="text-[10px] text-zinc-400 font-medium font-sans">All Companies</p>
              </div>
            </div>
            {mobileOpen && (
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition md:hidden">
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1" aria-label="Primary navigation">
            {items.map(({ id, label, icon: Icon }) => {
              const active = activeView === id;
              return (
                <button
                  key={id}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/10'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                  onClick={() => navigate(id)}
                  aria-label={label}
                >
                  <div className={`shrink-0 ${active ? 'text-indigo-400 drop-shadow-md' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                    <SidebarIcon icon={Icon} size={18} />
                  </div>
                  <span className="font-sans tracking-wide">{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Actions section */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col gap-2 mt-auto shadow-xl">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 font-sans pl-1">System Actions</h3>
          <button className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10 transition-all font-sans" onClick={onPrint} title="Print Preview" aria-label="Print Preview">
            <Printer size={15} className="text-zinc-400" />
            <span>Print Preview</span>
          </button>
          <button className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10 transition-all font-sans" onClick={onBackup} title="Backup Database" aria-label="Backup Database">
            <DatabaseBackup size={15} className="text-zinc-400" />
            <span>Backup Database</span>
          </button>
          <button className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10 transition-all font-sans" onClick={onRestore} title="Restore Database" aria-label="Restore Database">
            <RotateCcw size={15} className="text-zinc-400" />
            <span>Restore Database</span>
          </button>
        </div>
      </aside>
    </>
  );
}
