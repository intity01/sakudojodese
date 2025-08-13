import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { analytics } from './services/analytics.ts';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => {
        console.log('🔧 Service Worker registered successfully');
        analytics.track('service_worker_registered');
      })
      .catch((registrationError) => {
        console.error('❌ Service Worker registration failed:', registrationError);
      });
  });
}

// Track app initialization
analytics.track('app_initialized', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  language: navigator.language,
  platform: navigator.platform
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);