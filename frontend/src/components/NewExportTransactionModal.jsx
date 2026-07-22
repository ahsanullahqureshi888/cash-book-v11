import React, { useState, useEffect } from 'react';
import { 
  X, 
  Ship, 
  Wallet, 
  Calendar, 
  User, 
  Building, 
  Package, 
  FileText, 
  Truck, 
  DollarSign, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  Hash,
  CreditCard
} from 'lucide-react';

const CONTAINER_TYPES = [
  { id: '1X40_HC', label: '1X40 HC (High Cube)' },
  { id: '1X20_ST', label: '1X20 ST (Standard)' },
  { id: '1X40_ST', label: '1X40 ST (Standard)' },
  { id: '1X45_HC', label: '1X45 HC (High Cube)' },
  { id: 'LCL', label: 'LCL (Less than Container Load)' }
];

const PAYMENT_METHODS = [
  { id: 'dubai_hawala', label: 'Dubai Hawala Cash (نقدی دوبی)' },
  { id: 'kabul_cash', label: 'Kabul Office Deposit (نقدی کابل)' },
  { id: 'bank_transfer', label: 'Bank Transfer (حواله بانکی)' },
  { id: 'sarafi', label: 'Sarafi / Exchange (صرافی)' },
  { id: 'other', label: 'Other Method (سایر موارد)' }
];

export default function NewExportTransactionModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  clientName = 'NAJEB-AMIN LTD'
}) {
  const [txType, setTxType] = useState('shipment'); // 'shipment' (Credit) | 'payment' (Debit)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shipper: clientName || 'NAJEB-AMIN LTD',
    consignee: 'MIDA ENTERPRISES / DUBAI',
    commodity: '',
    invoiceNo: '',
    blNumber: '',
    containerNo: '',
    containerType: '1X40_HC',
    quantity: 1,
    pricePerContainer: '',
    totalCreditUSD: '',
    isSurrenderedBL: false,
    // Payment fields
    paymentMethod: 'dubai_hawala',
    description: '',
    amountPaidUSD: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form if editing or client changes
  useEffect(() => {
    if (initialData) {
      const isPayment = initialData.type === 'payment' || (initialData.debitUSD > 0 && !initialData.creditUSD);
      setTxType(isPayment ? 'payment' : 'shipment');
      
      const qty = initialData.quantity || 1;
      const credit = initialData.creditUSD || '';
      const pricePer = credit && qty ? (credit / qty).toFixed(2) : '';

      setFormData({
        date: initialData.date || new Date().toISOString().split('T')[0],
        shipper: initialData.shipper || clientName,
        consignee: initialData.consignee || '',
        commodity: initialData.commodityInvoice || initialData.commodity || '',
        invoiceNo: initialData.invoiceNo || '',
        blNumber: initialData.blNumber || '',
        containerNo: initialData.containerNo || initialData.blContainer || '',
        containerType: initialData.containerType || '1X40_HC',
        quantity: qty,
        pricePerContainer: pricePer,
        totalCreditUSD: credit ? String(credit) : '',
        isSurrenderedBL: Boolean(initialData.isSurrenderedBL),
        paymentMethod: initialData.paymentMethod || 'dubai_hawala',
        description: initialData.notes || initialData.description || '',
        amountPaidUSD: initialData.debitUSD ? String(initialData.debitUSD) : ''
      });
    } else {
      setTxType('shipment');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        shipper: clientName || 'NAJEB-AMIN LTD',
        consignee: 'MIDA ENTERPRISES / DUBAI',
        commodity: '',
        invoiceNo: '',
        blNumber: '',
        containerNo: '',
        containerType: '1X40_HC',
        quantity: 1,
        pricePerContainer: '',
        totalCreditUSD: '',
        isSurrenderedBL: false,
        paymentMethod: 'dubai_hawala',
        description: '',
        amountPaidUSD: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen, clientName]);

  // Handle dynamic total price calculation for shipment
  const handleQuantityOrPriceChange = (field, value) => {
    const nextForm = { ...formData, [field]: value };
    
    if (field === 'quantity' || field === 'pricePerContainer') {
      const qty = parseFloat(field === 'quantity' ? value : nextForm.quantity) || 0;
      const price = parseFloat(field === 'pricePerContainer' ? value : nextForm.pricePerContainer) || 0;
      if (qty > 0 && price > 0) {
        nextForm.totalCreditUSD = (qty * price).toFixed(2);
      }
    }
    setFormData(nextForm);
  };

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.date) errs.date = 'Date is required';

    if (txType === 'shipment') {
      if (!formData.commodity.trim()) errs.commodity = 'Commodity description is required';
      const credit = parseFloat(formData.totalCreditUSD);
      if (isNaN(credit) || credit <= 0) {
        errs.totalCreditUSD = 'Enter a valid positive price per container or total charge';
      }
    } else {
      if (!formData.description.trim()) errs.description = 'Description / Hawala note is required';
      const debit = parseFloat(formData.amountPaidUSD);
      if (isNaN(debit) || debit <= 0) {
        errs.amountPaidUSD = 'Enter a valid payment amount';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const isShipment = txType === 'shipment';
    const quantity = isShipment ? (parseInt(formData.quantity, 10) || 1) : 0;
    const creditUSD = isShipment ? parseFloat(formData.totalCreditUSD) || 0 : 0;
    const debitUSD = !isShipment ? parseFloat(formData.amountPaidUSD) || 0 : 0;

    // Format B/L Container text string for legacy compatibility
    const selectedTypeObj = CONTAINER_TYPES.find(c => c.id === formData.containerType);
    const typeLabel = selectedTypeObj ? selectedTypeObj.label.split(' ')[0] : '1X40';
    const blContainerCombined = isShipment
      ? `${formData.containerNo || 'RXTU-PENDING'} (${quantity}X${typeLabel}) / ${formData.blNumber || 'BL-PENDING'}`
      : 'TRANSFER / CASH DEPOSIT';

    const commodityCombined = isShipment
      ? `${formData.commodity}${formData.invoiceNo ? ` (INV: ${formData.invoiceNo})` : ''}`
      : (formData.description || 'PAYMENT DEPOSIT');

    const resultPayload = {
      id: initialData?.id || Date.now(),
      type: isShipment ? 'invoice' : 'payment',
      date: formData.date,
      shipper: formData.shipper || (isShipment ? clientName : 'CASH DEPOSIT'),
      consignee: formData.consignee || (isShipment ? 'EXPORT CLIENT' : 'DUBAI DEPOSIT'),
      commodityInvoice: commodityCombined,
      blContainer: blContainerCombined,
      quantity,
      creditUSD,
      debitUSD,
      notes: isShipment ? (formData.isSurrenderedBL ? 'Surrendered B/L (Telex Release)' : '') : formData.description,
      isSurrenderedBL: isShipment ? Boolean(formData.isSurrenderedBL) : false,
      // Granular logistics data
      invoiceNo: formData.invoiceNo,
      blNumber: formData.blNumber,
      containerNo: formData.containerNo,
      containerType: formData.containerType,
      pricePerContainer: parseFloat(formData.pricePerContainer) || 0,
      paymentMethod: formData.paymentMethod
    };

    setTimeout(() => {
      onSave(resultPayload);
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${txType === 'shipment' ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400'}`}>
              {txType === 'shipment' ? <Ship className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {initialData ? 'Edit Export Transaction' : 'New Export Transaction'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Client Account: <span className="font-bold text-slate-700 dark:text-slate-300">{clientName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM CONTENT BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* 1. TRANSACTION TYPE SEGMENTED TOGGLE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              1. Select Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
              
              {/* Option A: Shipment (Credit) */}
              <button
                type="button"
                onClick={() => setTxType('shipment')}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  txType === 'shipment'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md ring-1 ring-blue-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${txType === 'shipment' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  <Ship className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black">New Shipment</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                      Credit (+USD)
                    </span>
                  </div>
                  <span className="text-[10px] block opacity-80 font-medium">Export Freight & Logistics Invoice</span>
                </div>
              </button>

              {/* Option B: Payment Received (Debit) */}
              <button
                type="button"
                onClick={() => setTxType('payment')}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  txType === 'payment'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md ring-1 ring-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${txType === 'payment' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black">Payment Received</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                      Debit (-USD)
                    </span>
                  </div>
                  <span className="text-[10px] block opacity-80 font-medium">Cash, Hawala or Bank Payment</span>
                </div>
              </button>

            </div>
          </div>

          {/* DYNAMIC FIELDS: SHIPMENT (LOGISTICS DATA) */}
          {txType === 'shipment' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              
              {/* Row 1: Date & Invoice Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    Shipment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border ${
                      errors.date ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                    } outline-none focus:ring-2`}
                  />
                  {errors.date && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-blue-500" />
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-003 or 2026-089"
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Shipper & Consignee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-blue-500" />
                    Shipper Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NAJEB-AMIN LTD"
                    value={formData.shipper}
                    onChange={(e) => setFormData({ ...formData, shipper: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    Consignee Name & Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MIDA ENTERPRISES / DUBAI"
                    value={formData.consignee}
                    onChange={(e) => setFormData({ ...formData, consignee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 3: Commodity Description & Bill of Lading */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-blue-500" />
                    Commodity / Cargo Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2300 CTNS GREEN RAISINS"
                    value={formData.commodity}
                    onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border ${
                      errors.commodity ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                    } outline-none focus:ring-2`}
                  />
                  {errors.commodity && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.commodity}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Bill of Lading (B/L Number)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JADSUH90423"
                    value={formData.blNumber}
                    onChange={(e) => setFormData({ ...formData, blNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>

              {/* Row 4: Container Specifications Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Container Details & Quantity</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Container Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RXTU4545407"
                      value={formData.containerNo}
                      onChange={(e) => setFormData({ ...formData, containerNo: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Size & Type
                    </label>
                    <select
                      value={formData.containerType}
                      onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CONTAINER_TYPES.map(ct => (
                        <option key={ct.id} value={ct.id}>{ct.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Quantity (Units)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleQuantityOrPriceChange('quantity', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Pricing Calculation Card */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                      Price Per Container (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 2200.00"
                      value={formData.pricePerContainer}
                      onChange={(e) => handleQuantityOrPriceChange('pricePerContainer', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-blue-950 dark:text-blue-100 bg-white dark:bg-slate-900 border border-blue-300/80 dark:border-blue-700/60 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                      Total Export Charge (Credit USD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.totalCreditUSD}
                      onChange={(e) => setFormData({ ...formData, totalCreditUSD: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-black text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border ${
                        errors.totalCreditUSD ? 'border-red-500' : 'border-blue-300 dark:border-blue-700'
                      } outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.totalCreditUSD && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.totalCreditUSD}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/50 dark:bg-blue-900/30 p-2 rounded-xl">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>This charge will be credited to the client's ledger account (Money Owed to Sky Ariana).</span>
                </div>
              </div>

              {/* Surrendered B/L Toggle Option */}
              <label className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 cursor-pointer transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                <input 
                  type="checkbox"
                  checked={formData.isSurrenderedBL}
                  onChange={(e) => setFormData({ ...formData, isSurrenderedBL: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Surrendered B/L (Telex Release / تسلیم شده)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Check if Bill of Lading is surrendered or telex-released for swift cargo dispatch.
                  </span>
                </div>
              </label>

            </div>
          ) : (
            
            /* DYNAMIC FIELDS: PAYMENT RECEIVED */
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              
              {/* Row 1: Date & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border ${
                      errors.date ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                    } outline-none focus:ring-2 focus:ring-emerald-500`}
                  />
                  {errors.date && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                    Payment Received Via
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PAYMENT_METHODS.map(pm => (
                      <option key={pm.id} value={pm.id}>{pm.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Description & Hawala Note (RTL Pashto/Dari Support) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    Description / Hawala Notes <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Supports Pashto & Dari</span>
                </label>
                <textarea
                  rows={2}
                  dir="auto"
                  placeholder="e.g. نقدی په دوبی کی حاجی ابراهیم راته جعمه کړی"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border ${
                    errors.description ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                  } outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed`}
                />
                {errors.description && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.description}</p>}
              </div>

              {/* Row 3: Amount Paid (Debit USD) */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-2">
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Amount Paid (Debit USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amountPaidUSD}
                  onChange={(e) => setFormData({ ...formData, amountPaidUSD: e.target.value })}
                  className={`w-full px-3 py-2.5 rounded-xl text-base font-black text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 border ${
                    errors.amountPaidUSD ? 'border-red-500' : 'border-emerald-300 dark:border-emerald-700'
                  } outline-none focus:ring-2 focus:ring-emerald-500`}
                />
                {errors.amountPaidUSD && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.amountPaidUSD}</p>}

                <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-900/30 p-2 rounded-xl mt-2">
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>This payment will reduce the client's net debit balance.</span>
                </div>
              </div>

            </div>
          )}

        </form>

        {/* MODAL FOOTER ACTIONS */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all ${
              txType === 'shipment'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 active:scale-95'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 active:scale-95'
            } disabled:opacity-50`}
          >
            <Check className="w-4 h-4" />
            <span>{initialData ? 'Update Record' : 'Save Transaction'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
