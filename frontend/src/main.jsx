import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import './dashboard-polish.css';
import './modern-theme.css';
import './i18n';
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
