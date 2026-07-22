import { useMemo } from 'react';

/**
 * Custom Hook: useLedgerMath
 * Recalculates running balances, total credit, total debit, container totals,
 * and net balance for export transaction datasets.
 * 
 * @param {Array} transactions Raw array of ledger transactions
 * @returns {Object} { calculatedTransactions, totals }
 */
export function useLedgerMath(transactions = []) {
  return useMemo(() => {
    let currentBal = 0;
    let totalCredit = 0;
    let totalDebit = 0;
    let totalContainers = 0;
    let surrenderedCount = 0;

    const calculatedTransactions = transactions.map((tx, idx) => {
      const credit = Number(tx.creditUSD || tx.amountUSD || 0);
      const debit = Number(tx.debitUSD || 0);
      
      currentBal += (credit - debit);
      totalCredit += credit;
      totalDebit += debit;
      totalContainers += Number(tx.quantity || 0);
      
      if (tx.isSurrenderedBL) {
        surrenderedCount += Number(tx.quantity || 1);
      }

      return {
        ...tx,
        sn: idx + 1,
        creditUSD: credit,
        debitUSD: debit,
        balanceUSD: currentBal
      };
    });

    const totals = {
      totalCredit,
      totalDebit,
      netBalance: currentBal,
      totalContainers,
      surrenderedCount,
      activityCount: calculatedTransactions.length
    };

    return {
      calculatedTransactions,
      totals
    };
  }, [transactions]);
}
