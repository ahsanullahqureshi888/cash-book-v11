import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    cash_in_afn: 0,
    cash_out_afn: 0,
    afn_balance: 0,
    usd_in: 0,
    usd_out: 0,
    usd_balance: 0,
    today_transactions: 0,
    monthly_transactions: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (queryStr = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTransactions(queryStr);
      setTransactions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const newTx = await api.createTransaction(payload);
      setTransactions((prev) => [newTx, ...prev]);
      await fetchSummary();
      return newTx;
    } catch (err) {
      setError(err.message || 'Failed to add transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSummary]);

  const editTransaction = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTx = await api.updateTransaction(id, payload);
      setTransactions((prev) => prev.map(tx => tx.id === id ? updatedTx : tx));
      await fetchSummary();
      return updatedTx;
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSummary]);

  const removeTransaction = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter(tx => tx.id !== id));
      await fetchSummary();
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchSummary]);

  return {
    transactions,
    summary,
    loading,
    error,
    fetchTransactions,
    fetchSummary,
    addTransaction,
    editTransaction,
    removeTransaction
  };
}
