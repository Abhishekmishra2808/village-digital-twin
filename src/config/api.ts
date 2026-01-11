// API Configuration
// Automatically detects environment and uses appropriate backend URL

// Production backend URL (deployed on Render)
const PRODUCTION_API_URL = 'https://village-digital-twin.onrender.com';

// Local development - use localhost
const LOCAL_DEV_HOST = 'localhost';
const LOCAL_DEV_PORT = '3001';

// Check if running on Capacitor (mobile app)
const isCapacitor = () => {
  try {
    return typeof window !== 'undefined' && 
           (window as any).Capacitor !== undefined;
  } catch {
    return false;
  }
};

// Check if running on localhost
const isLocalhost = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

const getApiUrl = () => {
  // ALWAYS check localhost FIRST - this ensures dev mode works
  if (isLocalhost()) {
    console.log('🔧 DEV MODE: Using local backend at localhost:3001');
    return `http://${LOCAL_DEV_HOST}:${LOCAL_DEV_PORT}`;
  }
  
  // For Capacitor mobile app - use production backend
  if (isCapacitor()) {
    return PRODUCTION_API_URL;
  }
  
  // Production web - use production backend
  return import.meta.env.VITE_API_URL || PRODUCTION_API_URL;
};

const getWsUrl = () => {
  // ALWAYS check localhost FIRST
  if (isLocalhost()) {
    return `ws://${LOCAL_DEV_HOST}:${LOCAL_DEV_PORT}`;
  }
  
  // For Capacitor mobile app - use production websocket
  if (isCapacitor()) {
    return PRODUCTION_API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
  }
  
  // Production web
  const apiUrl = import.meta.env.VITE_API_URL || PRODUCTION_API_URL;
  return apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
};

export const API_URL = getApiUrl();
export const WS_URL = getWsUrl();

// Always log the API configuration for debugging
console.log('🌐 API Configuration:');
console.log('  Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
console.log('  Is Localhost:', isLocalhost());
console.log('  API URL:', API_URL);
console.log('  WS URL:', WS_URL);
