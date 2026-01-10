// API Configuration
// Automatically detects environment and uses appropriate backend URL

// Production backend URL (deployed on Render)
const PRODUCTION_API_URL = 'https://village-digital-twin.onrender.com';

// Local development IP - only used if you specifically want to test with local backend
const LOCAL_DEV_IP = '192.168.29.179';
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

const getApiUrl = () => {
  // For Capacitor mobile app - ALWAYS use production backend
  if (isCapacitor()) {
    // Use production backend for mobile
    return PRODUCTION_API_URL;
  }
  
  // Check if we're in production (deployed web)
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || PRODUCTION_API_URL;
  }
  
  // Development web - use local server
  return `http://${LOCAL_DEV_IP}:${LOCAL_DEV_PORT}`;
};

const getWsUrl = () => {
  // For Capacitor mobile app - use production websocket
  if (isCapacitor()) {
    return PRODUCTION_API_URL.replace('https://', 'wss://').replace('http://', 'ws://');
  }
  
  // Check if we're in production (deployed web)
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_URL || PRODUCTION_API_URL;
    return apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
  }
  
  // Development web - use local websocket
  return `ws://${LOCAL_DEV_IP}:${LOCAL_DEV_PORT}`;
};

export const API_URL = getApiUrl();
export const WS_URL = getWsUrl();

// Debug logging for mobile development
if (isCapacitor()) {
  console.log('📱 Running on Capacitor');
  console.log('🔗 API URL:', API_URL);
  console.log('🔌 WS URL:', WS_URL);
}
