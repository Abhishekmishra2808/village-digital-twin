// API Configuration
// Automatically detects environment and uses appropriate backend URL

const getApiUrl = () => {
  // Check if we're in production (deployed)
  if (import.meta.env.PROD) {
    // Use environment variable if set, otherwise use your Render backend URL
    // IMPORTANT: Replace YOUR_BACKEND_URL with your actual Render backend URL
    return import.meta.env.VITE_API_URL || 'https://village-digital-twin.onrender.com/';
  }
  // Development - use local IP for mobile APK access
  return 'http://192.168.29.179:3001';
};

const getWsUrl = () => {
  // Check if we're in production (deployed)
  if (import.meta.env.PROD) {
    // Use environment variable if set, otherwise use your Render backend URL
    const apiUrl = import.meta.env.VITE_API_URL || 'https://village-digital-twin.onrender.com/';
    // Convert https to wss for WebSocket
    return apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
  }
  // Development - use local IP for mobile APK access
  return 'ws://192.168.29.179:3001';
};

export const API_URL = getApiUrl();
export const WS_URL = getWsUrl();
