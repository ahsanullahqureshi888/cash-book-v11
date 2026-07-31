import { useState, useMemo } from 'react';

/**
 * Custom Hook: useExportFilter
 * Handles search, filter type (all, invoice, payment, surrendered), and date range filtering
 * for export transaction datasets.
 * 
 * @param {Array} transactions Calculated list of transactions
 * @returns {Object} { searchTerm, setSearchTerm, filterType, setFilterType, filteredTransactions }
 */
export function useExportFilter(transactions = []) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'invoice' | 'payment' | 'surrendered'

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Filter Type Match
      if (filterType === 'invoice' && tx.type !== 'invoice' && tx.type !== 'shipment') return false;
      if (filterType === 'payment' && tx.type !== 'payment') return false;
      if (filterType === 'surrendered' && !tx.isSurrenderedBL) return false;

      // 2. Search Term Match
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();

      return (
        (tx.shipper && tx.shipper.toLowerCase().includes(q)) ||
        (tx.consignee && tx.consignee.toLowerCase().includes(q)) ||
        (tx.commodityInvoice && tx.commodityInvoice.toLowerCase().includes(q)) ||
        (tx.blContainer && tx.blContainer.toLowerCase().includes(q)) ||
        (tx.notes && tx.notes.toLowerCase().includes(q))
      );
    });
  }, [transactions, searchTerm, filterType]);

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filteredTransactions
  };
}
