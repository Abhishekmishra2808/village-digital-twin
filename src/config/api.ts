// API Configuration
// Automatically detects environment and uses appropriate backend URL

// Local development IP - update this to your machine's IP
const LOCAL_DEV_IP = 'localhost';
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
  // For Capacitor mobile app during development, always use local IP
  // This allows testing on physical device connected to same network
  if (isCapacitor()) {
    // Check for environment variable first (for production mobile builds)
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // Use local development server
    return `http://${LOCAL_DEV_IP}:${LOCAL_DEV_PORT}`;
  }
  
  // Check if we're in production (deployed web)
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://village-digital-twin.onrender.com';
  }
  
  // Development web - use local IP for mobile APK access
  return `http://${LOCAL_DEV_IP}:${LOCAL_DEV_PORT}`;
};

const getWsUrl = () => {
  // For Capacitor mobile app during development
  if (isCapacitor()) {
    if (import.meta.env.VITE_API_URL) {
      const apiUrl = import.meta.env.VITE_API_URL;
      return apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    }
    return `ws://${LOCAL_DEV_IP}:${LOCAL_DEV_PORT}`;
  }
  
  // Check if we're in production (deployed web)
  if (import.meta.env.PROD) {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://village-digital-twin.onrender.com';
    return apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
  }
  
  // Development web - use local IP for mobile APK access
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
