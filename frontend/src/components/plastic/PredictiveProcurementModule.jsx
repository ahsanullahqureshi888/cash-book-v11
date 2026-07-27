import React, { useState } from 'react';
import { ShoppingCart, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '../ToastProvider';

export default function PredictiveProcurementModule() {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState([
    { code: 'RM-PP-VIRGIN', name: 'Polypropylene (PP) Virgin Resin', type: 'PP', stock_kg: 18500, daily_burn: 350, days_left: 52.8, rop: 3450, status: 'OK', eoq: 15750 },
    { code: 'RM-HDPE', name: 'High-Density Polyethylene (HDPE)', type: 'HDPE', stock_kg: 2400, daily_burn: 350, days_left: 6.8, rop: 4300, status: 'REORDER_NOW', eoq: 15750 },
    { code: 'RM-PVC', name: 'Polyvinyl Chloride Compound', type: 'PVC', stock_kg: 8500, daily_burn: 120, days_left: 70.8, rop: 2180, status: 'OK', eoq: 5400 },
    { code: 'RM-COLOR-RED', name: 'Masterbatch Red Colorant', type: 'PP', stock_kg: 120, daily_burn: 25, days_left: 4.8, rop: 175, status: 'CRITICAL_STOCKOUT', eoq: 1125 },
  ]);

  function handleDispatchPO(mat) {
    showToast(`Dispatched Auto-PO to supplier for ${mat.eoq} kg of ${mat.code}!`, 'success');
    setMaterials(prev => prev.map(m => m.code === mat.code ? { ...m, status: 'PO_DISPATCHED' } : m));
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShoppingCart size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
              <span>Predictive Procurement & Silo Runway Suite</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Calculate Reorder Points (ROP) and Economic Order Quantity (EOQ) targeting 45 days of supply to prevent stockouts.
            </p>
          </div>
        </div>
      </div>

      {/* Runway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materials.map((mat) => (
          <div key={mat.code} className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
            
            <div className="flex items-start justify-between">
              <div>
                <strong className="text-sm font-black text-white block">{mat.name}</strong>
                <span className="text-[10px] font-mono text-cyan-400">{mat.code} • Polymer: {mat.type}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                mat.status === 'OK' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                mat.status === 'REORDER_NOW' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                mat.status === 'CRITICAL_STOCKOUT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-bounce' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {mat.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Current Stock</span>
                <strong className="text-sm font-mono font-bold text-white">{mat.stock_kg.toLocaleString()} kg</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Stockout Runway</span>
                <strong className={`text-sm font-mono font-bold ${mat.days_left < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>{mat.days_left} Days</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">EOQ Target PO</span>
                <strong className="text-sm font-mono font-bold text-amber-400">{mat.eoq.toLocaleString()} kg</strong>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleDispatchPO(mat)}
                disabled={mat.status === 'PO_DISPATCHED'}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <span>{mat.status === 'PO_DISPATCHED' ? 'PO Dispatched to Supplier' : `Dispatch PO (${mat.eoq} kg)`}</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
