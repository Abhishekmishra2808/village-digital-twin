import { useEffect, useRef } from 'react';
import { useVillageStore } from '../store/villageStore';
import { WS_URL } from '../config/api';

export default function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>();
  const { setVillageData, setWsConnected, setLastUpdate } = useVillageStore();

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
            
            case 'scheme_added':
              // Handle new scheme added
              console.log('🆕 New scheme added:', message.scheme);
              if (message.allSchemes) {
                // Update schemes in the store
                const currentState = useVillageStore.getState();
                const updatedData = {
                  waterTanks: currentState.waterTanks,
                  buildings: currentState.buildings,
                  powerNodes: currentState.powerNodes,
                  roads: currentState.roads,
                  sensors: currentState.sensors,
                  citizenReports: currentState.citizenReports,
                  schemes: message.allSchemes,
                  alerts: currentState.alerts,
                  kpis: currentState.kpis
                };
                setVillageData(updatedData);
              }
              setLastUpdate(message.timestamp);
              break;
            
            case 'scheme_updated':
            case 'vendor_report_added':
              // Handle scheme update (feedback or vendor report added)
              console.log('📝 Scheme updated:', message.schemeId);
              if (message.allSchemes) {
                const currentState = useVillageStore.getState();
                const updatedData = {
                  waterTanks: currentState.waterTanks,
                  buildings: currentState.buildings,
                  powerNodes: currentState.powerNodes,
                  roads: currentState.roads,
                  sensors: currentState.sensors,
                  citizenReports: currentState.citizenReports,
                  schemes: message.allSchemes,
                  alerts: currentState.alerts,
                  kpis: currentState.kpis
                };
                setVillageData(updatedData);
              }
              setLastUpdate(message.timestamp);
              break;
            
            case 'report_added':
            case 'report_updated':
            case 'report_deleted':
              // Handle citizen report changes
              console.log('📋 Citizen reports updated');
              // Frontend will fetch reports directly from API
              // This is just for notification purposes
              setLastUpdate(message.timestamp);
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
