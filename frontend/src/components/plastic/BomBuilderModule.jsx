import React, { useState, useMemo } from 'react';
import { Layers, Sliders, Zap, DollarSign, Calculator, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function BomBuilderModule() {
  const [unitWeightG, setUnitWeightG] = useState(45.0);
  const [regrindPct, setRegrindPct] = useState(15.0);
  const [virginPrice, setVirginPrice] = useState(1.80);
  const [regrindPrice, setRegrindPrice] = useState(0.90);
  const [cycleTimeSec, setCycleTimeSec] = useState(14.5);
  const [scrapPercent, setScrapPercent] = useState(4.0);
  const [powerKw, setPowerKw] = useState(45.0);
  const [costPerKwh, setCostPerKwh] = useState(0.12);
  const [hourlyOverhead, setHourlyOverhead] = useState(18.50);
  const [operatorWage, setOperatorWage] = useState(15.00);

  const calc = useMemo(() => {
    const partsPerHour = cycleTimeSec > 0 ? (3600.0 / cycleTimeSec) : 240.0;
    const weightKg = unitWeightG / 1000.0;
    const scrapMultiplier = 1.0 + (scrapPercent / 100.0);
    const effectiveWeightKg = weightKg * scrapMultiplier;

    const regrindRatio = regrindPct / 100.0;
    const virginRatio = 1.0 - regrindRatio;
    const blendedPricePerKg = (virginRatio * virginPrice) + (regrindRatio * regrindPrice);

    const materialCostPerUnit = effectiveWeightKg * blendedPricePerKg;
    const scrappedWeightKg = weightKg * (scrapPercent / 100.0);
    const scrapSalvageCredit = scrappedWeightKg * regrindPrice;

    const powerCostPerHour = powerKw * costPerKwh;
    const totalHourlyBurn = powerCostPerHour + hourlyOverhead + operatorWage;

    const machineCostPerUnit = powerCostPerHour / partsPerHour;
    const overheadCostPerUnit = hourlyOverhead / partsPerHour;
    const laborCostPerUnit = operatorWage / partsPerHour;

    const unitCogm = materialCostPerUnit + machineCostPerUnit + overheadCostPerUnit + laborCostPerUnit - scrapSalvageCredit;
    const suggestedPrice = unitCogm * 2.0;
    const grossMargin = suggestedPrice > 0 ? ((suggestedPrice - unitCogm) / suggestedPrice * 100.0) : 50.0;

    return {
      partsPerHour: partsPerHour.toFixed(0),
      materialCostPerUnit: materialCostPerUnit.toFixed(4),
      machineCostPerUnit: machineCostPerUnit.toFixed(4),
      laborCostPerUnit: laborCostPerUnit.toFixed(4),
      overheadCostPerUnit: overheadCostPerUnit.toFixed(4),
      scrapSalvageCredit: scrapSalvageCredit.toFixed(4),
      unitCogm: unitCogm.toFixed(4),
      totalHourlyBurn: totalHourlyBurn.toFixed(2),
      suggestedPrice: suggestedPrice.toFixed(4),
      grossMargin: grossMargin.toFixed(1)
    };
  }, [unitWeightG, regrindPct, virginPrice, regrindPrice, cycleTimeSec, scrapPercent, powerKw, costPerKwh, hourlyOverhead, operatorWage]);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sliders size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
              <span>Interactive BOM Recipe Sandbox</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Fine-tune virgin vs regrind polymer ratios, cycle times, and machine burn rates to optimize per-unit COGM.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
          <Zap size={18} className="text-amber-400 animate-pulse" />
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block leading-tight">Live Burn Rate</span>
            <strong className="text-sm font-mono font-black text-amber-400">${calc.totalHourlyBurn} / hr</strong>
          </div>
        </div>
      </div>

      {/* Grid Controls & Live KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="lg:col-span-2 space-y-4 p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 pb-3 border-b border-slate-800">
            <Calculator size={16} />
            <span>Recipe Parameters & Resin Pricing</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Part Unit Weight (Grams): <strong className="text-white">{unitWeightG}g</strong></label>
              <input type="range" min="10" max="250" step="1" value={unitWeightG} onChange={(e) => setUnitWeightG(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Regrind Resin Blend: <strong className="text-emerald-400">{regrindPct}% Regrind</strong></label>
              <input type="range" min="0" max="50" step="1" value={regrindPct} onChange={(e) => setRegrindPct(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Virgin Resin Price ($/kg)</label>
              <input type="number" step="0.05" value={virginPrice} onChange={(e) => setVirginPrice(parseFloat(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono" />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Regrind Salvage Price ($/kg)</label>
              <input type="number" step="0.05" value={regrindPrice} onChange={(e) => setRegrindPrice(parseFloat(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono" />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Mold Cycle Time: <strong className="text-white">{cycleTimeSec}s ({calc.partsPerHour} parts/hr)</strong></label>
              <input type="range" min="5" max="60" step="0.5" value={cycleTimeSec} onChange={(e) => setCycleTimeSec(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Expected Scrap Rate: <strong className="text-rose-400">{scrapPercent}%</strong></label>
              <input type="range" min="1" max="15" step="0.5" value={scrapPercent} onChange={(e) => setScrapPercent(parseFloat(e.target.value))} className="w-full accent-rose-500" />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Machine Power Draw (kW)</label>
              <input type="number" value={powerKw} onChange={(e) => setPowerKw(parseFloat(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono" />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Operator Hourly Wage ($/hr)</label>
              <input type="number" value={operatorWage} onChange={(e) => setOperatorWage(parseFloat(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono" />
            </div>
          </div>
        </div>

        {/* Live COGM Summary Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 backdrop-blur-2xl border border-cyan-500/30 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between pb-3 border-b border-slate-800">
              <span>Calculated Unit COGM</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">Healthy Margin</span>
            </h3>

            <div className="text-center py-3 bg-slate-950/60 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Unit COGM Cost</span>
              <strong className="text-3xl font-mono font-black text-cyan-400">${calc.unitCogm}</strong>
              <span className="text-[10px] text-slate-500 block mt-1">Direct Material + Power + Labor - Scrap Credit</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Material Cost / Unit:</span>
                <strong className="text-white">${calc.materialCostPerUnit}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Machine Power / Unit:</span>
                <strong className="text-white">${calc.machineCostPerUnit}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Operator Labor / Unit:</span>
                <strong className="text-white">${calc.laborCostPerUnit}</strong>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Scrap Recovery Credit:</span>
                <strong>-${calc.scrapSalvageCredit}</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Suggested Wholesale Price:</span>
              <strong className="text-amber-400 font-mono text-sm">${calc.suggestedPrice}</strong>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Estimated Gross Margin:</span>
              <strong className="text-emerald-400 font-mono text-sm">{calc.grossMargin}%</strong>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
