import React, { useState } from 'react';
import { RefreshCw, Plus, CheckCircle2, DollarSign, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../ToastProvider';

export default function ScrapRecoveryModule() {
  const { showToast } = useToast();
  const [machineCode, setMachineCode] = useState('IMM-250T');
  const [materialCode, setMaterialCode] = useState('RM-PP-REGRIND');
  const [scrapWeightKg, setScrapWeightKg] = useState('45.0');
  const [valuationPerKg, setValuationPerKg] = useState('0.90');
  const [notes, setNotes] = useState('Granulated sprues and defective moldings');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [scrapLogs, setScrapLogs] = useState([
    { id: 101, machine_code: 'IMM-250T', material: 'PP Regrind Granules', weight_kg: 45.0, valuation: 0.90, salvage_usd: 40.50, journal_ref: 'SCRAP-0101', date: '2026-07-25 14:30' },
    { id: 100, machine_code: 'IMM-350T', material: 'PP Regrind Granules', weight_kg: 62.5, valuation: 0.90, salvage_usd: 56.25, journal_ref: 'SCRAP-0100', date: '2026-07-24 16:15' },
  ]);

  async function handleScrapSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const weight = parseFloat(scrapWeightKg);
      const val = parseFloat(valuationPerKg);
      const salvage = weight * val;

      const payload = {
        machine_code: machineCode,
        regrind_material_code: materialCode,
        scrap_weight_kg: weight,
        regrind_valuation_per_kg: val,
        notes: notes
      };

      const res = await api.post('/api/v1/plastic/scrap/log', payload);
      setScrapLogs(prev => [
        {
          id: res.id,
          machine_code: res.machine_code,
          material: 'PP Regrind Granules',
          weight_kg: res.scrap_weight_kg,
          valuation: res.regrind_valuation_per_kg,
          salvage_usd: res.total_salvage_value_usd,
          journal_ref: res.journal_ref,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        },
        ...prev
      ]);

      showToast(`Scrap logged cleanly! Salvage Credit: $${salvage.toFixed(2)}`, 'success');
      setScrapWeightKg('');
    } catch (error) {
      showToast(error.message || 'Scrap logging failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalSalvageLogged = scrapLogs.reduce((acc, curr) => acc + curr.salvage_usd, 0);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <RefreshCw size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
              <span>Closed-Loop Scrap & Regrind Recovery Suite</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Log granulator feed conversions, credit the COGM Scrap Recovery ledger, and track monthly salvage totals.
            </p>
          </div>
        </div>

        <div className="bg-emerald-950/40 border border-emerald-500/30 px-4 py-2 rounded-xl text-right">
          <span className="text-[10px] font-bold uppercase text-slate-400 block leading-tight">Total Regrind Salvage</span>
          <strong className="text-lg font-mono font-black text-emerald-400">${totalSalvageLogged.toFixed(2)} USD</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 pb-3 border-b border-slate-800/80 flex items-center gap-2">
            <Plus size={16} />
            <span>Granulator Quick Log Form</span>
          </h3>

          <form onSubmit={handleScrapSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Source Machine Press</label>
              <select value={machineCode} onChange={(e) => setMachineCode(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                <option value="IMM-250T">IMM-250T (Sumitomo 250T)</option>
                <option value="IMM-350T">IMM-350T (KraussMaffei 350T)</option>
                <option value="IMM-500T">IMM-500T (Engel 500T)</option>
                <option value="SBM-HUSKY">SBM-HUSKY (Husky Blow Station)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Regrind Target SKU</label>
              <select value={materialCode} onChange={(e) => setMaterialCode(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                <option value="RM-PP-REGRIND">RM-PP-REGRIND (PP Regrind Granules)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Scrap Granulated Weight (KG)</label>
              <input type="number" step="0.1" required value={scrapWeightKg} onChange={(e) => setScrapWeightKg(e.target.value)} placeholder="e.g. 45.0" className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Regrind Internal Valuation ($/kg)</label>
              <input type="number" step="0.05" value={valuationPerKg} onChange={(e) => setValuationPerKg(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Notes / Description</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 active:scale-98">
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Posting Ledger...' : 'Log Scrap & Post Salvage Ledger'}</span>
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 pb-3 border-b border-slate-800/80">
            <span>Granulator Log Ledger History</span>
          </h3>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="dark-glass-table w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr>
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Journal Ref</th>
                  <th className="py-3 px-3.5">Machine Press</th>
                  <th className="py-3 px-3.5">Material</th>
                  <th className="py-3 px-3.5 text-right">Weight (KG)</th>
                  <th className="py-3 px-3.5 text-right">Salvage Credit ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {scrapLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 px-3.5 text-slate-300 font-mono">{log.date}</td>
                    <td className="py-3 px-3.5 font-mono text-cyan-400 font-bold">{log.journal_ref}</td>
                    <td className="py-3 px-3.5 text-white font-bold">{log.machine_code}</td>
                    <td className="py-3 px-3.5 text-slate-200">{log.material}</td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-white">{log.weight_kg} kg</td>
                    <td className="py-3 px-3.5 text-right font-mono font-black text-emerald-400">+${log.salvage_usd.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>



      </div>

    </div>
  );
}
