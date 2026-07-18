// cspell:ignore Bawar Ahsanullah
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './soft-dashboard.css';
import { api } from '../../services/api';
import { currency, dateLabel } from '../../utils/format';

export default function SoftDashboard() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({ cashIn: 0, cashOut: 0, balance: 0, totalTransactions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [summaryData, txData] = await Promise.all([
          api.getSummary(),
          api.getTransactions()
        ]);
        
        setMetrics({
          cashIn: summaryData.total_cash_in || 0,
          cashOut: summaryData.total_cash_out || 0,
          balance: (summaryData.total_cash_in || 0) - (summaryData.total_cash_out || 0),
          totalTransactions: txData.length || 0
        });
        setTransactions(txData || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>{t('Loading Bawar Star Data...')}</div>;
  }

  return (
    <>
      <input type="text" className="header-search" placeholder={t('Search accounts, records...')} />

      {/* Top Metric Cards (3 Columns) */}
      <div className="metric-grid-3">
        <div className="soft-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '40px', background: '#3b82f6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>AQ</div>
          <div className="text-h1">{t('Hello Ahsanullah')}</div>
          <div className="text-sub">{t('Cashbook is up to date')}</div>
        </div>

        <div className="soft-card">
          <div className="text-h2">{t('Total Cash In')}</div>
          <div className="text-value">{currency(metrics.cashIn)}</div>
          <div className="text-sub" style={{ color: '#10b981' }}>{metrics.totalTransactions} {t('total records')}</div>
        </div>

        <div className="soft-card">
          <div className="text-h2">{t('Total Cash Out')}</div>
          <div className="text-value">{currency(metrics.cashOut)}</div>
          <div className="text-sub" style={{ color: '#ef4444' }}>{t('Live accurate metrics')}</div>
        </div>
      </div>

      {/* Main Data Table Card */}
      <div className="soft-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div className="text-h2">{t('Recent Transactions')}</div>
          <div className="text-sub" style={{ cursor: 'pointer' }}>{t('Full list ')} &gt;</div>
        </div>
        
        <table className="soft-table">
          <thead>
            <tr>
              <th>{t('Account Name')}</th>
              <th>{t('Dates')}</th>
              <th>{t('Type')}</th>
              <th>{t('Amount')}</th>
              <th>{t('Status')}</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map(tx => (
              <tr key={tx.id}>
                <td><strong>{tx.account_name || 'General'}</strong></td>
                <td className="text-sub">{dateLabel(tx.date)}</td>
                <td><span style={{ padding: '4px 12px', background: tx.cash_in_afn > 0 ? '#e0f2fe' : '#fef3c7', color: tx.cash_in_afn > 0 ? '#0284c7' : '#d97706', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{tx.cash_in_afn > 0 ? t('Cash In') : t('Cash Out')}</span></td>
                <td>{currency(tx.cash_in_afn > 0 ? tx.cash_in_afn : tx.cash_out_afn)}</td>
                <td>{t('Completed')}</td>
              </tr>
            ))}
            {recentTransactions.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('No recent transactions')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
