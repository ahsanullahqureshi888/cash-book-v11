import React, { useState } from 'react';
import { Shield, Lock, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuditLedgerModule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs] = useState([
    { id: 1, timestamp: '2026-07-25 15:30:12', username: 'Operator_KND', role: 'OPERATOR', ip: '192.168.1.45', action: 'SCRAP_RECOVERY_LOGGED', severity: 'INFO', details: 'Granulated 45.0 kg of scrap into RM-PP-REGRIND ($40.50 salvage)' },
    { id: 2, timestamp: '2026-07-25 14:15:00', username: 'System_Engine', role: 'MANAGER', ip: '127.0.0.1', action: 'PRODUCTION_BATCH_COMPLETED', severity: 'INFO', details: 'Completed run PR-20260725-001 for SKU PET-BTL-120ML (COGM: $2,382.20)' },
    { id: 3, timestamp: '2026-07-25 11:05:44', username: 'Procurement_Auto', role: 'MANAGER', ip: '127.0.0.1', action: 'PO_DISPATCHED', severity: 'INFO', details: 'Dispatched PO-20260725-001 to Borouge Plastics ($28,350.00)' },
    { id: 4, timestamp: '2026-07-25 09:22:18', username: 'Architect', role: 'AUDITOR', ip: '127.0.0.1', action: 'SYSTEM_INITIALIZED', severity: 'INFO', details: 'PlastiCorp Enterprise ERP initial seed completed cleanly.' },
  ]);

  const filteredLogs = logs.filter(l =>
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Shield size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
              <span>Security Matrix & Immutable Audit Ledger</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Tamper-proof, append-only logs of financial overrides, role actions, and IP origins across all branches.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit log..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* Audit Matrix Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/15 shadow-2xl overflow-x-auto custom-scrollbar">
        <table className="dark-glass-table w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr>
              <th className="py-3 px-3.5">Timestamp</th>
              <th className="py-3 px-3.5">User & Role</th>
              <th className="py-3 px-3.5">IP Origin</th>
              <th className="py-3 px-3.5">Action Type</th>
              <th className="py-3 px-3.5">Severity</th>
              <th className="py-3 px-3.5">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-medium">
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td className="py-3 px-3.5 text-slate-300 font-mono text-xs">{log.timestamp}</td>
                <td className="py-3 px-3.5 text-white font-bold">{log.username} <span className="text-[10px] text-cyan-400 font-mono font-semibold">({log.role})</span></td>
                <td className="py-3 px-3.5 font-mono text-slate-400 text-xs">{log.ip}</td>
                <td className="py-3 px-3.5 font-mono text-amber-400 font-bold">{log.action}</td>
                <td className="py-3 px-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {log.severity}
                  </span>
                </td>
                <td className="py-3 px-3.5 text-slate-200 font-medium max-w-xs truncate">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </div>
  );
}

