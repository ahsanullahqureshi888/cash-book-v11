import React from 'react';
import './mobile-liquid.css';

export default function LiquidMobileDashboard() {
  return (
    <div className="liquid-mobile-theme">
      <div className="liquid-app-wrapper">
        
        {/* Header Profile Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div className="liquid-text-secondary">Welcome back,</div>
            <h2 className="liquid-text-primary" style={{ margin: 0, fontSize: '24px' }}>Ahsanullah</h2>
          </div>
          <div style={{ 
            width: '48px', height: '48px', 
            borderRadius: '24px', 
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            color: '#ffffff' /* Force white text on the vibrant avatar */
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>AQ</span>
          </div>
        </div>

        {/* Main Liquid Card - Balance */}
        <div className="liquid-glass-card">
          <div className="liquid-text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Total Available Cash
          </div>
          <div className="liquid-text-primary" style={{ fontSize: '40px', marginBottom: '24px' }}>
            AFN 245,500
          </div>
          
          {/* Inner Data Row using the new dynamic box class */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="liquid-inner-box">
              <div className="liquid-text-secondary" style={{ fontSize: '11px' }}>Cash In (July)</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>+ 12,000</div>
            </div>
            <div className="liquid-inner-box">
              <div className="liquid-text-secondary" style={{ fontSize: '11px' }}>Cash Out (July)</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#ef4444' }}>- 4,500</div>
            </div>
          </div>
        </div>

        {/* Secondary Liquid Card - Action Menu */}
        <div className="liquid-glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="liquid-inner-box" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', padding: 0 }}>
                💸
              </div>
              <span className="liquid-text-secondary" style={{ fontSize: '11px' }}>Pay Salary</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="liquid-inner-box" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', padding: 0 }}>
                📥
              </div>
              <span className="liquid-text-secondary" style={{ fontSize: '11px' }}>Cash In</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="liquid-inner-box" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', padding: 0 }}>
                📄
              </div>
              <span className="liquid-text-secondary" style={{ fontSize: '11px' }}>Ledger</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
