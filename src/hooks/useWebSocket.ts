import { useEffect, useRef } from 'react';
import { useVillageStore } from '../store/villageStore';

// Use environment variable for WebSocket URL, fallback to localhost for development
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export default function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const { setVillageData, setWsConnected, setLastUpdate, addAlert } = useVillageStore();

  const connect = () => {
    try {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setWsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'initial_state':
            case 'sensor_update':
            case 'scenario_update':
              setVillageData(message.data);
              setLastUpdate(message.timestamp);
              
              // Check for new critical alerts
              if (message.data.alerts && message.data.alerts.length > 0) {
                const latestAlert = message.data.alerts[message.data.alerts.length - 1];
                if (latestAlert.type === 'critical') {
                  // Play notification sound (optional)
                  // new Audio('/alert.mp3').play();
                }
              }
              break;
              
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('❌ WebSocket disconnected');
        setWsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, 5000);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setWsConnected(false);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
}
