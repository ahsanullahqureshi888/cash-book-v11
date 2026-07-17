import { RefreshCw, TrendingUp } from 'lucide-react';

export default function CurrencyConverter(props) {
  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Currency Converter</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Convert and set default exchange rates between AFN and USD</p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Converter Form Card */}
        <div className="glass-card p-6 rounded-2xl border-2 border-indigo-500/10 shadow-indigo-500/5 w-full lg:w-[480px]">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-5 flex items-center gap-2">
            <RefreshCw size={18} className="text-indigo-500" />
            Live Conversion
          </h3>
          
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Direction</label>
              <select 
                value={props.direction} 
                onChange={(e) => props.setDirection(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm font-medium"
              >
                <option value="afnToUsd">AFN to USD</option>
                <option value="usdToAfn">USD to AFN</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</label>
                <input 
                  type="number" 
                  value={props.amount} 
                  onChange={(e) => props.setAmount(e.target.value)} 
                  step="0.01" 
                  placeholder="0.00" 
                  className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-mono px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Exchange Rate</label>
                <input 
                  type="number" 
                  value={props.rate} 
                  onChange={(e) => props.setRate(e.target.value)} 
                  step="0.01" 
                  placeholder="0.00" 
                  className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-mono px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Result Display */}
            <div className="mt-2 p-6 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20 text-center flex flex-col gap-1">
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Converted Amount</span>
              <strong className="text-3xl font-bold font-mono text-indigo-700 dark:text-indigo-400">
                {props.result || '0.00'}
              </strong>
            </div>

            <button 
              className="primary-btn w-full py-3.5 mt-2 shadow-md hover:shadow-lg transition-all text-base font-bold" 
              onClick={props.onSaveRate}
            >
              Save Default Rate
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="glass-card p-6 rounded-2xl flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-900 border border-blue-100 dark:border-zinc-700">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" />
            How it works
          </h3>
          <div className="flex flex-col gap-4 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            <p>
              The default exchange rate is used globally across the application whenever a transaction needs to be converted implicitly between USD and AFN.
            </p>
            
            <div className="p-4 bg-white/60 dark:bg-black/20 rounded-xl border border-white/40 dark:border-white/5">
              <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2 text-xs uppercase tracking-wider">Example Calculation</p>
              <div className="font-mono text-lg text-zinc-900 dark:text-white flex items-center gap-3">
                <span className="px-2 py-1 bg-zinc-200/50 dark:bg-zinc-800 rounded">USD 1,200</span>
                <span className="text-zinc-400">×</span>
                <span className="px-2 py-1 bg-zinc-200/50 dark:bg-zinc-800 rounded">64.30</span>
                <span className="text-zinc-400">=</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded font-bold">AFN 77,160</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mt-2">
              Note: Changing the default exchange rate will only affect new transactions. Historical transactions retain their original exchange rate at the time of creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
