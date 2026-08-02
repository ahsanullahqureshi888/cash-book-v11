import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Download, 
  Printer, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Ship, 
  Container, 
  DollarSign, 
  MapPin, 
  Award,
  Plus,
  X,
  SquarePen,
  Trash2,
  ShieldCheck,
  Banknote
} from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';

export default function TransportLedgerTable() {
  const { currentCompany } = useCompany();
  const [ledgerEntries, setLedgerEntries] = useState([
    {
      id: 'tx-1',
      sn: 1,
      date: '2026-02-28',
      shipper: 'NAJEB-AMIN LTD',
      consignee: 'MIDA ENTERPRISES',
      commodityInvoice: '2300 CNT GREEN RAISINS (INV: 002)',
      blContainerNo: 'RXTU4545407 (1X40 HC) / JADSUHN5A33481',
      containerQty: 1,
      ratePerContainerUSD: 2050,
      creditUSD: 2050,
      debitUSD: 0,
      runningBalanceUSD: 2050,
      type: 'FREIGHT_INVOICE',
      isSurrenderedBL: true
    },
    {
      id: 'tx-2',
      sn: 2,
      date: '2026-02-27',
      shipper: 'NAJEB-AMIN LTD',
      consignee: 'MIDA ENTERPRISES',
      commodityInvoice: '2315 CNT GREEN RAISINS (INV: 001)',
      blContainerNo: 'PCIU8304571 (1X40 HC) / BWSBNONSA2009231',
      containerQty: 1,
      ratePerContainerUSD: 18540,
      creditUSD: 18540,
      debitUSD: 0,
      runningBalanceUSD: 20590,
      type: 'FREIGHT_INVOICE',
      isSurrenderedBL: true
    },
    {
      id: 'tx-3',
      sn: 3,
      date: '2026-04-20',
      shipper: 'نقدی په دوبی کی دانش بیای راته جعمه کړی',
      consignee: 'DUBAI CASH DROP',
      commodityInvoice: 'Dubai Cash Deposit by Danish Agha',
      blContainerNo: 'HAWALA / CASH / DUB-0420',
      containerQty: 0,
      ratePerContainerUSD: 0,
      creditUSD: 0,
      debitUSD: 20000,
      runningBalanceUSD: 590,
      type: 'HAWALA_PAYMENT',
      notesDari: 'نقدی په دوبی کی دانش بیای راته جعمه کړی',
      isSurrenderedBL: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [entryType, setEntryType] = useState('FREIGHT_INVOICE');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shipper: '',
    consignee: '',
    commodityInvoice: '',
    blContainerNo: '',
    containerQty: 1,
    ratePerContainerUSD: 18540,
    debitUSD: 0,
    notesDari: '',
    isSurrenderedBL: false
  });

  const recalculateBalances = (dataList) => {
    let currentBal = 0;
    return dataList.map((tx, idx) => {
      const credit = tx.creditUSD || 0;
      const debit = tx.debitUSD || 0;
      currentBal += (credit - debit);
      return {
        ...tx,
        sn: idx + 1,
        runningBalanceUSD: currentBal
      };
    });
  };

  // Filtered Entries
  const filteredData = useMemo(() => {
    return ledgerEntries.filter(entry => {
      if (filterCategory === 'FREIGHT_INVOICE' && entry.type !== 'FREIGHT_INVOICE') return false;
      if (filterCategory === 'HAWALA_PAYMENT' && entry.type !== 'HAWALA_PAYMENT') return false;
      if (filterCategory === 'SURRENDERED' && !entry.isSurrenderedBL) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        entry.date.toLowerCase().includes(q) ||
        entry.shipper.toLowerCase().includes(q) ||
        entry.consignee.toLowerCase().includes(q) ||
        entry.commodityInvoice.toLowerCase().includes(q) ||
        entry.blContainerNo.toLowerCase().includes(q) ||
        (entry.notesDari && entry.notesDari.toLowerCase().includes(q))
      );
    });
  }, [ledgerEntries, searchTerm, filterCategory]);

  // Aggregate Metrics
  const summary = useMemo(() => {
    let credit = 0;
    let debit = 0;
    let containers = 0;

    ledgerEntries.forEach(item => {
      credit += item.creditUSD || 0;
      debit += item.debitUSD || 0;
      containers += item.containerQty || 0;
    });

    return {
      totalCreditUSD: credit,
      totalDebitUSD: debit,
      netBalanceUSD: credit - debit,
      totalContainers: containers
    };
  }, [ledgerEntries]);

  // Formatter for USD Currency
  const formatUSD = (val) => {
    if (!val && val !== 0) return '$0.00';
    const isNeg = val < 0;
    const formatted = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return isNeg ? `-$${formatted}` : `$${formatted}`;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setEntryType('FREIGHT_INVOICE');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      shipper: '',
      consignee: '',
      commodityInvoice: '',
      blContainerNo: '',
      containerQty: 1,
      ratePerContainerUSD: 18540,
      debitUSD: 0,
      notesDari: '',
      isSurrenderedBL: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingId(entry.id);
    setEntryType(entry.type || 'FREIGHT_INVOICE');
    setFormData({
      date: entry.date,
      shipper: entry.shipper,
      consignee: entry.consignee,
      commodityInvoice: entry.commodityInvoice,
      blContainerNo: entry.blContainerNo,
      containerQty: entry.containerQty || 1,
      ratePerContainerUSD: entry.ratePerContainerUSD || 18540,
      debitUSD: entry.debitUSD || 0,
      notesDari: entry.notesDari || '',
      isSurrenderedBL: !!entry.isSurrenderedBL
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this transport entry?')) {
      const updated = ledgerEntries.filter(e => e.id !== id);
      setLedgerEntries(recalculateBalances(updated));
    }
  };

  // Add / Edit Entry Handler
  const handleSaveEntry = (e) => {
    e.preventDefault();
    const isInvoice = entryType === 'FREIGHT_INVOICE';
    const qty = isInvoice ? (parseInt(formData.containerQty) || 1) : 0;
    const rate = isInvoice ? (parseFloat(formData.ratePerContainerUSD) || 0) : 0;
    const creditUSD = isInvoice ? qty * rate : 0;
    const debitUSD = !isInvoice ? (parseFloat(formData.debitUSD) || 0) : 0;

    let updatedList = [];

    if (editingId) {
      updatedList = ledgerEntries.map(entry => {
        if (entry.id === editingId) {
          return {
            ...entry,
            type: entryType,
            date: formData.date,
            shipper: formData.shipper || (isInvoice ? 'NAJEB-AMIN LTD' : 'DUBAI CASH DROP'),
            consignee: formData.consignee || (isInvoice ? 'MIDA ENTERPRISES' : 'HAWALA CLEARING'),
            commodityInvoice: formData.commodityInvoice || (isInvoice ? 'FREIGHT INVOICE' : 'HAWALA CASH DEPOSIT'),
            blContainerNo: formData.blContainerNo || (isInvoice ? '1X40 HC / BL-PENDING' : 'HAWALA / CASH'),
            containerQty: qty,
            ratePerContainerUSD: rate,
            creditUSD,
            debitUSD,
            notesDari: formData.notesDari,
            isSurrenderedBL: isInvoice ? formData.isSurrenderedBL : false
          };
        }
        return entry;
      });
    } else {
      const newEntry = {
        id: `tx-${Date.now()}`,
        sn: ledgerEntries.length + 1,
        date: formData.date,
        shipper: formData.shipper || (isInvoice ? 'NAJEB-AMIN LTD' : 'DUBAI CASH DROP'),
        consignee: formData.consignee || (isInvoice ? 'MIDA ENTERPRISES' : 'HAWALA CLEARING'),
        commodityInvoice: formData.commodityInvoice || (isInvoice ? 'FREIGHT INVOICE' : 'HAWALA CASH DEPOSIT'),
        blContainerNo: formData.blContainerNo || (isInvoice ? '1X40 HC / BL-PENDING' : 'HAWALA / CASH'),
        containerQty: qty,
        ratePerContainerUSD: rate,
        creditUSD,
        debitUSD,
        runningBalanceUSD: 0,
        type: entryType,
        notesDari: formData.notesDari,
        isSurrenderedBL: isInvoice ? formData.isSurrenderedBL : false
      };
      updatedList = [...ledgerEntries, newEntry];
    }

    setLedgerEntries(recalculateBalances(updatedList));
    setIsModalOpen(false);
  };

  return (
    <div className="h-[calc(100vh-68px)] flex flex-col gap-2 p-3 bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* COMPACT TOP HEADER BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl px-4 py-2.5 border border-blue-500/30 shadow-xl flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <img src={currentCompany?.logo || '/sky-ariana-logo.png'} alt="SKY ARIANA" className="w-10 h-10 object-contain rounded-xl bg-slate-900 border border-blue-500/40 p-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-blue-600 px-2 py-0.5 rounded text-white tracking-widest">
                SKY ARIANA & BALAM BAR BARAN
              </span>
              <span className="text-xs font-bold text-amber-400">حاجی ابراهیم او دانش بهای</span>
            </div>
            <h1 className="text-sm font-black text-white mt-0.5">HAJI IBRAHIM - DANISH AGHA</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Credit</span>
            <strong className="text-xs font-mono text-amber-400">{formatUSD(summary.totalCreditUSD)}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Debit</span>
            <strong className="text-xs font-mono text-emerald-400">{formatUSD(summary.totalDebitUSD)}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance</span>
            <strong className={`text-xs font-mono font-black ${summary.netBalanceUSD <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatUSD(summary.netBalanceUSD)}
            </strong>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            <Plus size={14} />
            <span>New Entry</span>
          </button>
        </div>
      </div>

      {/* SEARCH TOOLBAR */}
      <div className="bg-slate-900 rounded-xl px-3 py-2 border border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search B/L, Container..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-100"
          />
        </div>

        <div className="bg-slate-800 p-0.5 rounded-lg flex items-center text-xs">
          <button
            type="button"
            className={`px-2.5 py-1 rounded-md font-semibold ${filterCategory === 'all' ? 'bg-slate-900 text-blue-400' : 'text-slate-400'}`}
            onClick={() => setFilterCategory('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`px-2.5 py-1 rounded-md font-semibold ${filterCategory === 'FREIGHT_INVOICE' ? 'bg-slate-900 text-amber-400' : 'text-slate-400'}`}
            onClick={() => setFilterCategory('FREIGHT_INVOICE')}
          >
            Invoices
          </button>
          <button
            type="button"
            className={`px-2.5 py-1 rounded-md font-semibold ${filterCategory === 'HAWALA_PAYMENT' ? 'bg-slate-900 text-emerald-400' : 'text-slate-400'}`}
            onClick={() => setFilterCategory('HAWALA_PAYMENT')}
          >
            Hawala
          </button>
          <button
            type="button"
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 ${filterCategory === 'SURRENDERED' ? 'bg-emerald-600 text-white' : 'text-emerald-400'}`}
            onClick={() => setFilterCategory('SURRENDERED')}
          >
            <ShieldCheck size={12} />
            <span>Surrendered B/L</span>
          </button>
        </div>
      </div>

      {/* STICKY LEDGER TABLE */}
      <div className="flex-1 min-h-0 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-auto relative">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="sticky top-0 z-20 bg-slate-950 text-slate-300 uppercase font-bold text-[10px] border-b border-slate-800">
              <th className="py-2.5 px-2 text-center w-10">S.N</th>
              <th className="py-2.5 px-2 min-w-[85px]">Date</th>
              <th className="py-2.5 px-2 min-w-[130px]">Shipper</th>
              <th className="py-2.5 px-2 min-w-[130px]">Consignee</th>
              <th className="py-2.5 px-2 min-w-[180px]">Commodity & Invoice</th>
              <th className="py-2.5 px-2 min-w-[210px]">Container & B/L No.</th>
              <th className="py-2.5 px-2 text-center w-10">Qty</th>
              <th className="py-2.5 px-2 text-right text-slate-400 min-w-[85px]">Rate ($)</th>
              <th className="py-2.5 px-2 text-right text-amber-400 min-w-[90px]">Credit ($)</th>
              <th className="py-2.5 px-2 text-right text-emerald-400 min-w-[90px]">Debit ($)</th>
              <th className="py-2.5 px-2 text-right min-w-[95px]">Balance ($)</th>
              <th className="py-2.5 px-2 text-center w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-medium text-[11px]">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-800/60">
                <td className="py-2 px-2 text-center font-mono text-slate-500">{row.sn}</td>
                <td className="py-2 px-2 font-semibold">{row.date}</td>
                <td className="py-2 px-2 truncate max-w-[130px]">{row.shipper}</td>
                <td className="py-2 px-2 truncate max-w-[130px]">{row.consignee}</td>
                <td className="py-2 px-2 truncate max-w-[180px]">{row.commodityInvoice}</td>
                <td className="py-2 px-2 font-mono text-[11px]">
                  <div>{row.blContainerNo}</div>
                  {row.isSurrenderedBL && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-600 text-white mt-0.5">
                      <ShieldCheck size={10} /> SURRENDERED B/L
                    </span>
                  )}
                </td>
                <td className="py-2 px-2 text-center font-mono">{row.containerQty > 0 ? row.containerQty : '-'}</td>
                <td className="py-2 px-2 text-right font-mono text-slate-400">{row.ratePerContainerUSD > 0 ? formatUSD(row.ratePerContainerUSD) : '-'}</td>
                <td className="py-2 px-2 text-right font-mono font-bold text-amber-400">{row.creditUSD > 0 ? formatUSD(row.creditUSD) : '-'}</td>
                <td className="py-2 px-2 text-right font-mono font-bold text-emerald-400">{row.debitUSD > 0 ? formatUSD(row.debitUSD) : '-'}</td>
                <td className="py-2 px-2 text-right font-mono font-black">{formatUSD(row.runningBalanceUSD)}</td>
                <td className="py-2 px-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button type="button" onClick={() => handleOpenEdit(row)} className="p-1 text-slate-400 hover:text-blue-400">
                      <SquarePen size={14} />
                    </button>
                    <button type="button" onClick={() => handleDelete(row.id)} className="p-1 text-slate-400 hover:text-rose-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL WITH SURRENDERED B/L CHECKBOX */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="text-sm font-bold text-white">{editingId ? 'Edit Transport Record' : 'Add Transport Record'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" className={`py-1.5 rounded-xl font-bold ${entryType === 'FREIGHT_INVOICE' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'}`} onClick={() => setEntryType('FREIGHT_INVOICE')}>
                    Invoice (Credit)
                  </button>
                  <button type="button" className={`py-1.5 rounded-xl font-bold ${entryType === 'HAWALA_PAYMENT' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`} onClick={() => setEntryType('HAWALA_PAYMENT')}>
                    Hawala (Debit)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input type="text" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{entryType === 'FREIGHT_INVOICE' ? 'Rate ($)' : 'Amount ($)'}</label>
                  <input type="number" value={entryType === 'FREIGHT_INVOICE' ? formData.ratePerContainerUSD : formData.debitUSD} onChange={(e) => setFormData({ ...formData, [entryType === 'FREIGHT_INVOICE' ? 'ratePerContainerUSD' : 'debitUSD']: e.target.value })} className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold" />
                </div>
              </div>

              {entryType === 'FREIGHT_INVOICE' && (
                <label className="flex items-center gap-2 p-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 cursor-pointer">
                  <input type="checkbox" checked={formData.isSurrenderedBL} onChange={(e) => setFormData({ ...formData, isSurrenderedBL: e.target.checked })} className="rounded text-emerald-600" />
                  <span className="font-bold text-emerald-300 text-xs flex items-center gap-1">
                    <ShieldCheck size={14} /> Surrendered B/L (Telex Release / تسلیم شده)
                  </span>
                </label>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">{editingId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
