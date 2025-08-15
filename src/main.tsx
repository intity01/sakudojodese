import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { analytics } from './services/analytics.ts';

// Register Service Worker for PWA (delayed to not block initial load)
if ('serviceWorker' in navigator) {
  setTimeout(() => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => {
        analytics.track('service_worker_registered');
      })
      .catch(() => {
        // Silently fail - not critical for app functionality
      });
  }, 2000);
}

// Track app initialization (delayed to not block render)
setTimeout(() => {
  analytics.track('app_initialized', {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform
  });
}, 100);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);