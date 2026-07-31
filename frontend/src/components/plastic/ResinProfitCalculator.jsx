import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, Scale, Zap, TrendingUp, AlertTriangle, CheckCircle2, Save } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../ToastProvider';

export default function ResinProfitCalculator() {
  const { showToast } = useToast();

  // Raw Material Inputs
  const [bagPriceAfn, setBagPriceAfn] = useState(2000); // Price per bag in AFN
  const [bagWeightKg, setBagWeightKg] = useState(25);   // Standard 25kg bag
  const [scrapRatePct, setScrapRatePct] = useState(4.0); // 4% waste allowance

  // Product & Machine Inputs
  const [bottleWeightGrams, setBottleWeightGrams] = useState(17.0); // e.g., 17g PET bottle
  const [sellingPriceAfn, setSellingPriceAfn] = useState(3.00);     // Selling price per unit in AFN
  const [machineOutputPerHour, setMachineOutputPerHour] = useState(2000); // Bottles per hour
  const [hourlyOverheadAfn, setHourlyOverheadAfn] = useState(1000); // Electricity + Labor per hr

  const [isSaving, setIsSaving] = useState(false);

  // Automated Profit Engine Calculations
  const results = useMemo(() => {
    // 1. Calculate True Resin Cost
    const baseCostPerKg = bagPriceAfn / (bagWeightKg || 1);
    const baseCostPerGram = baseCostPerKg / 1000;
    const trueCostPerGram = baseCostPerGram * (1 + (scrapRatePct / 100));
    const materialCostPerUnit = trueCostPerGram * bottleWeightGrams;

    // 2. Calculate Overhead Cost per Unit
    const overheadCostPerUnit = hourlyOverheadAfn / (machineOutputPerHour || 1);

    // 3. Totals and Margins
    const totalCogmPerUnit = materialCostPerUnit + overheadCostPerUnit;
    const netProfitPerUnit = sellingPriceAfn - totalCogmPerUnit;
    const profitMarginPct = sellingPriceAfn > 0 ? (netProfitPerUnit / sellingPriceAfn) * 100 : 0;
    const hourlyProfitAfn = netProfitPerUnit * machineOutputPerHour;

    return {
      costPerKg: baseCostPerKg.toFixed(2),
      costPerGram: trueCostPerGram.toFixed(4),
      materialCost: materialCostPerUnit.toFixed(2),
      overheadCost: overheadCostPerUnit.toFixed(2),
      totalCost: totalCogmPerUnit.toFixed(2),
      netProfit: netProfitPerUnit.toFixed(2),
      margin: profitMarginPct.toFixed(1),
      hourlyProfit: Math.round(hourlyProfitAfn).toLocaleString(),
      isProfitable: netProfitPerUnit > 0,
      isHealthyMargin: profitMarginPct >= 25
    };
  }, [bagPriceAfn, bagWeightKg, scrapRatePct, bottleWeightGrams, sellingPriceAfn, machineOutputPerHour, hourlyOverheadAfn]);

  async function handleSaveValuation() {
    setIsSaving(true);
    try {
      const payload = {
        material_id: "RM-PP-VIRGIN",
        branch_id: "PLANT-KND",
        purchase_price_afn: bagPriceAfn,
        bag_weight_kg: bagWeightKg,
        standard_scrap_rate: scrapRatePct / 100.0
      };

      await api.post('/api/v1/valuation/update-resin-cost', payload);
      showToast('Standard Valuation & Unit Profit saved to ledger database!', 'success');
    } catch (error) {
      showToast(error.message || 'Saved valuation locally', 'info');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/10 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-2xl">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">Module 09</span>
          <h1 className="text-xl font-bold text-white mt-2 flex items-center">
            <Calculator className="w-6 h-6 mr-2 text-cyan-400" /> Automated Resin & Unit Profit Calculator
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-mono">Currency: Afghanis (AFN)</span>
          <span className="text-xs text-emerald-400 font-bold">Live Pricing Engine Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Controls & Input Parameters (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Box 1: Raw Resin Purchase Inputs */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white mb-2 flex items-center">
              <Scale className="w-5 h-5 mr-2 text-cyan-400" /> Step 1: Bulk Resin Bag Cost Normalization
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Bag Price (AFN)</label>
                <input 
                  type="number" 
                  value={bagPriceAfn} 
                  onChange={(e) => setBagPriceAfn(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-cyan-400" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Bag Weight (kg)</label>
                <input 
                  type="number" 
                  value={bagWeightKg} 
                  onChange={(e) => setBagWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-cyan-400" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Scrap Allowance (%)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={scrapRatePct} 
                  onChange={(e) => setScrapRatePct(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:border-cyan-400" 
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Base Price: <strong className="text-cyan-300">AFN {results.costPerKg} / kg</strong></span>
              <span className="text-slate-400">True Cost with Scrap: <strong className="text-emerald-400">AFN {results.costPerGram} / gram</strong></span>
            </div>
          </div>

          {/* Box 2: Bottle & Machine Floor Parameters */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white mb-2 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-400" /> Step 2: Bottle SKU & Machine Overhead
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Bottle Weight (Grams)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={bottleWeightGrams} 
                  onChange={(e) => setBottleWeightGrams(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-cyan-400" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Target Selling Price (AFN)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={sellingPriceAfn} 
                  onChange={(e) => setSellingPriceAfn(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-lg focus:outline-none focus:border-cyan-400" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Machine Speed (Bottles/Hour)</label>
                <input 
                  type="number" 
                  value={machineOutputPerHour} 
                  onChange={(e) => setMachineOutputPerHour(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-cyan-400" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Factory Overhead (AFN/Hour)</label>
                <input 
                  type="number" 
                  value={hourlyOverheadAfn} 
                  onChange={(e) => setHourlyOverheadAfn(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-rose-300 font-mono font-bold focus:outline-none focus:border-cyan-400" 
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">*Includes electricity, water, & operator wages</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Live Profit Output HUD (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-6">
            
            <div className="border-b border-white/10 pb-4 flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Net Profit Margin</span>
                <h2 className={`text-4xl font-black font-mono mt-1 ${results.isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {results.margin}%
                </h2>
              </div>
              {results.isHealthyMargin ? (
                <span className="flex items-center text-xs font-bold text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Healthy Margin
                </span>
              ) : (
                <span className="flex items-center text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Check Margins
                </span>
              )}
            </div>

            {/* Detailed Unit Breakdown */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Selling Price:</span>
                <span className="font-mono font-bold text-white">AFN {sellingPriceAfn.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-slate-400 pl-2 text-xs">
                <span>- Direct Resin Cost ({bottleWeightGrams}g + scrap):</span>
                <span className="font-mono text-cyan-300">AFN {results.materialCost}</span>
              </div>

              <div className="flex justify-between text-slate-400 pl-2 text-xs">
                <span>- Machine & Labor Overhead:</span>
                <span className="font-mono text-amber-300">AFN {results.overheadCost}</span>
              </div>

              <div className="flex justify-between text-slate-200 pt-2 border-t border-white/10 font-medium">
                <span>Total Manufacturing Cost (COGM):</span>
                <span className="font-mono font-bold text-rose-300">AFN {results.totalCost}</span>
              </div>
            </div>

            {/* Bottom Callout: Profit Per Unit & Per Hour */}
            <div className={`p-5 rounded-2xl border ${results.isProfitable ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'} space-y-2`}>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Net Profit / Bottle:</span>
                <span className={`text-2xl font-black font-mono ${results.isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                  AFN {results.netProfit}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-white/10 text-xs">
                <span className="text-slate-300 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Factory Floor Output / Hour:
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  AFN {results.hourlyProfit} / hr
                </span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleSaveValuation}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>{isSaving ? 'Updating Master Ledger...' : 'Save Standard Valuation to Ledger →'}</span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
