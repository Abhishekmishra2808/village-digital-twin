import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import './index.css';

// Load mobile-specific styles only when running in Capacitor (Android/iOS)
if (Capacitor.isNativePlatform()) {
  import('./styles/mobile.css');
  // Add mobile-app class to body for mobile-specific styling
  document.body.classList.add('mobile-app');
  console.log('Running in native mobile app mode');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
