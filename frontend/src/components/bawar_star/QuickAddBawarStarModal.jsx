import React, { useState, useMemo } from 'react';
import { 
  X, 
  Package, 
  Truck, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  Calculator, 
  AlertCircle, 
  Check,
  Building2
} from 'lucide-react';
import { todayInputValue } from '../../utils/format';

export default function QuickAddBawarStarModal({ 
  isOpen, 
  onClose, 
  onSave,
  onTransactionCreated,
  accounts = [], 
  selectedPartnerId,
  partnerName = "Bawar Star Partner" 
}) {
  // Segmented control tabs: 'SELL_PRODUCT' | 'PASS_THROUGH' | 'PAYMENT'
  const [activeTab, setActiveTab] = useState('SELL_PRODUCT');
  
  // Partner Account Selection State
  const [partnerId, setPartnerId] = useState(selectedPartnerId || (accounts[0]?.id || ''));

  // Basic Transaction State
  const [date, setDate] = useState(todayInputValue());
  const [descPs, setDescPs] = useState('');
  const [descEn, setDescEn] = useState('');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  
  // Pass-Through Sub-category ('PASS_THROUGH_FREIGHT' | 'PASS_THROUGH_PKG')
  const [passThroughType, setPassThroughType] = useState('PASS_THROUGH_FREIGHT');

  // Advanced COGS Toggle State (The Profit Calculator)
  const [showAdvancedCogs, setShowAdvancedCogs] = useState(false);
  const [rawMaterialCost, setRawMaterialCost] = useState('');
  const [electricityLaborCost, setElectricityLaborCost] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form state when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDescPs('');
    setDescEn('');
    setQty('');
    setPrice('');
    setPaymentAmount('');
    setShowAdvancedCogs(false);
    setError('');
  };

  // Real-Time Math & Profit Calculations
  const calculations = useMemo(() => {
    const numQty = parseFloat(qty) || 0;
    const numPrice = parseFloat(price) || 0;
    const numPayment = parseFloat(paymentAmount) || 0;
    
    if (activeTab === 'PAYMENT') {
      return { totalBilled: 0, totalPaid: numPayment, totalUnitCogs: 0, totalCogs: 0, estimatedProfit: 0, marginPct: '0.00' };
    }

    const totalBilled = numQty * numPrice;
    
    // Profit is ONLY calculated for product sales
    if (activeTab === 'SELL_PRODUCT' && showAdvancedCogs) {
      const unitMatCost = parseFloat(rawMaterialCost) || 0;
      const unitLabCost = parseFloat(electricityLaborCost) || 0;
      const totalUnitCogs = unitMatCost + unitLabCost;
      const totalCogs = numQty * totalUnitCogs;
      const estimatedProfit = totalBilled - totalCogs;
      const marginPct = totalBilled > 0 ? ((estimatedProfit / totalBilled) * 100) : 0;
      
      return { 
        totalBilled, 
        totalPaid: 0, 
        totalUnitCogs,
        totalCogs,
        estimatedProfit, 
        marginPct: marginPct.toFixed(2) 
      };
    }

    return { totalBilled, totalPaid: 0, totalUnitCogs: 0, totalCogs: 0, estimatedProfit: 0, marginPct: '0.00' };
  }, [activeTab, qty, price, paymentAmount, showAdvancedCogs, rawMaterialCost, electricityLaborCost]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const pid = parseInt(partnerId || selectedPartnerId, 10);
    if (!pid && accounts.length > 0) {
      setError('Please select a customer/partner account.');
      return;
    }
    
    const payload = {
      partner_company_id: pid || 1,
      transaction_date: date,
      transaction_type: activeTab === 'PASS_THROUGH' ? passThroughType : activeTab,
      description_ps: descPs || (activeTab === 'SELL_PRODUCT' ? 'د محصولاتو خرڅلاو' : activeTab === 'PAYMENT' ? 'د نغدو پیسو تادیه' : 'د کرایې / پارسل لګښت'),
      description_en: descEn || (activeTab === 'SELL_PRODUCT' ? 'Product Sale' : activeTab === 'PAYMENT' ? 'Cash Payment Received' : 'Freight / Packaging Charge'),
      quantity: activeTab === 'PAYMENT' ? 1 : (parseFloat(qty) || 0),
      unit_price: activeTab === 'PAYMENT' ? (parseFloat(paymentAmount) || 0) : (parseFloat(price) || 0),
      total_amount: activeTab === 'PAYMENT' ? (parseFloat(paymentAmount) || 0) : calculations.totalBilled,
      unit_manufacturing_cost: (activeTab === 'SELL_PRODUCT' && showAdvancedCogs) ? calculations.totalUnitCogs : null,
      currency: 'AFN',
      exchange_rate: 1.0
    };

    setLoading(true);
    try {
      if (onSave) {
        await onSave(payload);
      } else if (onTransactionCreated) {
        await onTransactionCreated(payload);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save entry.');
    } finally {
      setLoading(false);
    }
  };

  const formatAFN = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);

  const currentPartner = accounts.find(a => a.id === parseInt(partnerId || selectedPartnerId, 10));
  const activePartnerName = currentPartner ? currentPartner.name : partnerName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-4">
        
        {/* macOS Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Record Ledger Entry</h2>
            <p className="text-xs text-slate-400">Account: <span className="font-medium text-slate-600 dark:text-slate-300">{activePartnerName}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* macOS Segmented Control Tabs */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-750">
            <button
              type="button"
              onClick={() => handleTabChange('SELL_PRODUCT')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition ${
                activeTab === 'SELL_PRODUCT' 
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Product Sale</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('PASS_THROUGH')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition ${
                activeTab === 'PASS_THROUGH' 
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Freight / Pkg</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('PAYMENT')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition ${
                activeTab === 'PAYMENT' 
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Payment In</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 overflow-y-auto space-y-4 flex-1">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Selector (if multiple accounts available) & Date Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accounts.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Partner Account</label>
                <div className="relative">
                  <select
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  >
                    <option value="">-- Select Partner Account --</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.account_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className={accounts.length === 0 ? "sm:col-span-2" : ""}>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Transaction Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Sub-category selector for Pass-Through charges */}
          {activeTab === 'PASS_THROUGH' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Reimbursable Category</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPassThroughType('PASS_THROUGH_FREIGHT')}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${
                    passThroughType === 'PASS_THROUGH_FREIGHT'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Logistics & Freight (کرایه)</span>
                  {passThroughType === 'PASS_THROUGH_FREIGHT' && <Check className="w-4 h-4 text-amber-500" />}
                </button>
                <button
                  type="button"
                  onClick={() => setPassThroughType('PASS_THROUGH_PKG')}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${
                    passThroughType === 'PASS_THROUGH_PKG'
                      ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Packaging (پارسل / پلاستیک)</span>
                  {passThroughType === 'PASS_THROUGH_PKG' && <Check className="w-4 h-4 text-purple-500" />}
                </button>
              </div>
            </div>
          )}

          {/* Dual-Language Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description (Pashto)</label>
              <input 
                type="text"
                dir="rtl"
                placeholder="مثلاً: کوچنی غاړی بوتلان"
                value={descPs}
                onChange={(e) => setDescPs(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-serif"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description (English)</label>
              <input 
                type="text"
                placeholder="e.g., Small Neck Bottles 120ml"
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quantity & Rate Inputs (For Sales and Pass-Through) */}
          {activeTab !== 'PAYMENT' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Quantity / Weight</label>
                <input 
                  type="number"
                  step="any"
                  placeholder="0"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Unit Price (AFN)</label>
                <input 
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>
          ) : (
            /* Payment Received Input */
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Payment Amount Received (AFN)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">AFN</span>
                <input 
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full pl-14 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                  required
                />
              </div>
            </div>
          )}

          {/* ADVANCED COGS ACCORDION (Only visible for Product Sales) */}
          {activeTab === 'SELL_PRODUCT' && (
            <div className="border border-slate-200/80 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-200">
              <button
                type="button"
                onClick={() => setShowAdvancedCogs(!showAdvancedCogs)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-500" />
                  <span>Advanced: Unit Manufacturing Cost (COGS)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-[11px] font-normal">{showAdvancedCogs ? 'Hide Profit Preview' : 'Calculate Profit'}</span>
                  {showAdvancedCogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {showAdvancedCogs && (
                <div className="p-4 space-y-4 bg-white dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Enter your raw plastic and machine overhead costs per unit to calculate exact Gross Profit for this batch.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Raw Plastic Cost / Unit</label>
                      <input 
                        type="number"
                        step="any"
                        placeholder="e.g. 0.18"
                        value={rawMaterialCost}
                        onChange={(e) => setRawMaterialCost(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">Labor & Electricity / Unit</label>
                      <input 
                        type="number"
                        step="any"
                        placeholder="e.g. 0.07"
                        value={electricityLaborCost}
                        onChange={(e) => setElectricityLaborCost(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                      />
                    </div>
                  </div>

                  {/* Real-Time Profit Preview Box */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Estimated Gross Profit</div>
                      <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        AFN {formatAFN(calculations.estimatedProfit)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Batch Margin</div>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 mt-0.5">
                        {calculations.marginPct}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Transaction Preview Summary Bar */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Total Entry Value:</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              AFN {formatAFN(activeTab === 'PAYMENT' ? calculations.totalPaid : calculations.totalBilled)}
            </span>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shadow-sm shadow-blue-500/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Entry'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

// Named export for flexibility
export { QuickAddBawarStarModal as NewTransactionModal };
