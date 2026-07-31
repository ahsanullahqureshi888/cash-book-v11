import React, { useState, useEffect } from 'react';
import {
  Building2,
  TrendingUp,
  Sliders,
  RefreshCw,
  Activity,
  ShoppingCart,
  FileText,
  Shield,
  Layers,
  Zap,
  PackageCheck,
  ChevronDown,
  Users
} from 'lucide-react';

import BomBuilderModule from '../components/plastic/BomBuilderModule';
import ScrapRecoveryModule from '../components/plastic/ScrapRecoveryModule';
import IotTelemetryModule from '../components/plastic/IotTelemetryModule';
import PredictiveProcurementModule from '../components/plastic/PredictiveProcurementModule';
import FinancialReportsModule from '../components/plastic/FinancialReportsModule';
import AuditLedgerModule from '../components/plastic/AuditLedgerModule';
import ResinProfitCalculator from '../components/plastic/ResinProfitCalculator';
import CustomerAccountsModule from '../components/plastic/CustomerAccountsModule';

export default function PlasticErpDashboard() {
  const [activeTab, setActiveTab] = useState('HUD');
  const [selectedBranch, setSelectedBranch] = useState('PLANT-KND');

  const [kpi, setKpi] = useState({
    gross_revenue: 379750.00,
    cogm: 245000.00,
    gross_profit: 134750.00,
    gross_margin: 35.48,
    total_units: 1250000,
    total_scrap_kg: 4800.0,
    inventory_val: 124000.00,
    running_machines: 3,
    total_machines: 4
  });

  const dockItems = [
    { id: 'HUD', label: 'Executive P&L HUD', icon: TrendingUp },
    { id: 'CUSTOMERS', label: 'Customer AR & Risk', icon: Users },
    { id: 'CALCULATOR', label: 'Resin Calculator', icon: Zap },
    { id: 'BOM', label: 'BOM Builder', icon: Sliders },
    { id: 'SCRAP', label: 'Scrap Recovery', icon: RefreshCw },
    { id: 'IOT', label: 'IoT Telemetry', icon: Activity },
    { id: 'PROCUREMENT', label: 'Predictive Runway', icon: ShoppingCart },
    { id: 'REPORTS', label: 'Financial Reports', icon: FileText },
    { id: 'AUDIT', label: 'Audit Ledger', icon: Shield },
  ];



  return (
    <div className="-m-5 md:-m-6 h-[calc(100vh-64px)] w-[calc(100%+40px)] md:w-[calc(100%+48px)] flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-100 font-sans relative p-3 sm:p-5 overflow-hidden no-print">
      
      {/* 1. TOP EXECUTIVE BAR & BRANCH SWITCHER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/15 shadow-2xl shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white uppercase">PlastiCorp Enterprise</h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
                Manufacturing ERP v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Plastics Manufacturing Accounting, IoT PLC Telemetry & Predictive Procurement Engine
            </p>
          </div>
        </div>

        {/* Branch Selector Switcher */}
        <div className="flex items-center gap-3 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
          <Building2 size={16} className="text-cyan-400" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
          >
            <option value="PLANT-KND" className="bg-slate-900 text-white">Kandahar Injection Molding Plant</option>
            <option value="PLANT-HRT" className="bg-slate-900 text-white">Herat Extrusion Facility</option>
            <option value="ALL" className="bg-slate-900 text-white">All Plant Branches Combined</option>
          </select>
        </div>
      </div>

      {/* 2. SCROLLABLE TAB MODULE CONTAINER */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-24 pr-1">


      {/* 2. TAB VIEW RENDERER */}
      {activeTab === 'HUD' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Executive P&L Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Revenue */}
            <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl space-y-2 relative overflow-hidden group">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Manufacturing Revenue</span>
              <strong className="text-2xl font-mono font-black text-emerald-400 block">${kpi.gross_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                <span>30-Day Batch Sales</span>
                <span className="text-emerald-400 font-bold">+14.2%</span>
              </div>
            </div>

            {/* COGM */}
            <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl space-y-2 relative overflow-hidden group">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cost of Goods Manufactured (COGM)</span>
              <strong className="text-2xl font-mono font-black text-cyan-400 block">${kpi.cogm.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                <span>Material + Power + Labor</span>
                <span className="text-cyan-400 font-bold">10k Units/Batch</span>
              </div>
            </div>

            {/* Gross Profit Margin */}
            <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl space-y-2 relative overflow-hidden group">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Gross Profit Margin</span>
              <strong className="text-2xl font-mono font-black text-amber-400 block">{kpi.gross_margin}% (${kpi.gross_profit.toLocaleString('en-US', { minimumFractionDigits: 2 })})</strong>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                <span>Target: 30.0%</span>
                <span className="text-emerald-400 font-bold">Healthy Profit</span>
              </div>
            </div>

            {/* Inventory Asset */}
            <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl space-y-2 relative overflow-hidden group">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total 3-Stage Inventory Asset</span>
              <strong className="text-2xl font-mono font-black text-purple-400 block">${kpi.inventory_val.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                <span>Resins + WIP + Finished SKUs</span>
                <span className="text-purple-400 font-bold">Audited Asset</span>
              </div>
            </div>

          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-300">Production Output Volume</h3>
              <strong className="text-3xl font-mono font-black text-white">{kpi.total_units.toLocaleString()} Units</strong>
              <p className="text-xs text-slate-400">Completed 120ml Bottles, 240ml Preforms, and 5L Canisters across active runs.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-300">Granulator Scrap Recovery</h3>
              <strong className="text-3xl font-mono font-black text-emerald-400">{kpi.total_scrap_kg.toLocaleString()} KG</strong>
              <p className="text-xs text-slate-400">Granulated regrind fed back into warehouse inventory at internal valuation ($0.90/kg).</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-300">Machine Fleet Status</h3>
              <strong className="text-3xl font-mono font-black text-cyan-400">{kpi.running_machines} / {kpi.total_machines} Running</strong>
              <p className="text-xs text-slate-400">Live OEE telemetry streaming from injection molding PLC stations.</p>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'CUSTOMERS' && <CustomerAccountsModule />}
      {activeTab === 'CALCULATOR' && <ResinProfitCalculator />}
      {activeTab === 'BOM' && <BomBuilderModule />}
      {activeTab === 'SCRAP' && <ScrapRecoveryModule />}
      {activeTab === 'IOT' && <IotTelemetryModule />}
      {activeTab === 'PROCUREMENT' && <PredictiveProcurementModule />}
      {activeTab === 'REPORTS' && <FinancialReportsModule />}
      {activeTab === 'AUDIT' && <AuditLedgerModule />}
      </div>


      {/* 3. macOS FLOATING BOTTOM NAVIGATION DOCK (DIRECTIVE 2 REQUIREMENT) */}


      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 no-print">
        <div className="flex items-center gap-2 p-2 rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/15 shadow-2xl ring-1 ring-black/40">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg scale-110 -translate-y-1'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80 hover:scale-105'
                }`}
                title={item.label}
              >
                <Icon size={20} />

                {/* Tooltip */}
                <span className="absolute -top-10 px-2.5 py-1 rounded-lg bg-slate-950 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-800 shadow-xl">
                  {item.label}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-cyan-500/50 shadow-md" />
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
