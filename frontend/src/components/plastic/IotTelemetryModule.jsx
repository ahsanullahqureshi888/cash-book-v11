import React, { useState, useEffect } from 'react';
import { Activity, Gauge, Zap, AlertTriangle, ShieldCheck, Thermometer } from 'lucide-react';

export default function IotTelemetryModule() {
  const [machines, setMachines] = useState([
    { code: 'IMM-250T', name: 'Sumitomo 250T Press', status: 'RUNNING', temp: 215.0, cycle: 14.5, power: 45.0, shots: 185240, oee: 92.4 },
    { code: 'IMM-350T', name: 'KraussMaffei 350T Press', status: 'RUNNING', temp: 220.0, cycle: 18.0, power: 62.0, shots: 142110, oee: 88.6 },
    { code: 'IMM-500T', name: 'Engel duo 500T Press', status: 'PURGING', temp: 230.0, cycle: 22.5, power: 85.0, shots: 98450, oee: 76.2 },
    { code: 'SBM-HUSKY', name: 'Husky Blow Station', status: 'RUNNING', temp: 205.0, cycle: 12.0, power: 55.0, shots: 260890, oee: 94.8 },
  ]);

  // Simulate live WebSocket telemetry pings every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines(prev => prev.map(m => {
        if (m.status === 'RUNNING') {
          const tempVariation = (Math.random() * 1.2 - 0.6);
          const newShots = m.shots + 1;
          return {
            ...m,
            temp: parseFloat((m.temp + tempVariation).toFixed(1)),
            shots: newShots
          };
        }
        return m;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
              <span>Live Factory Floor IoT Telemetry Monitor</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Real-time PLC machine telemetry stream tracking temperatures, pressures, power draw, and live OEE performance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>WebSocket Live</span>
          </span>
        </div>
      </div>

      {/* Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {machines.map((m) => (
          <div key={m.code} className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl space-y-4 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-sm font-black text-white block">{m.code}</strong>
                <span className="text-[10px] text-slate-400 font-medium">{m.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                m.status === 'RUNNING' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                m.status === 'PURGING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {m.status}
              </span>
            </div>

            {/* Diagnostics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Thermometer size={12} /> Temp</span>
                <strong className="text-sm font-mono font-bold text-white">{m.temp}°C</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Zap size={12} /> Power</span>
                <strong className="text-sm font-mono font-bold text-amber-400">{m.power} kW</strong>
              </div>
            </div>

            {/* Shots */}
            <div className="text-xs font-mono flex justify-between text-slate-400 pt-2 border-t border-slate-800">
              <span>Total Shots Logged:</span>
              <strong className="text-white">{m.shots.toLocaleString()}</strong>
            </div>

            {/* OEE Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-400">Live OEE:</span>
                <span className="text-cyan-400 font-mono">{m.oee}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${m.oee}%` }} />
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
