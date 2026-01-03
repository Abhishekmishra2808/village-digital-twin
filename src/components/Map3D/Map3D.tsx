import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useVillageStore } from '../../store/villageStore';

const VILLAGE_CENTER: [number, number] = [73.8567, 18.5204]; // Pune coordinates

export default function Map3D() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userInteractedRef = useRef(false);
  const lastViewRef = useRef<string>('');
  const [currentZoom, setCurrentZoom] = useState(16.6);
  const [currentPitch, setCurrentPitch] = useState(45);
  
  const { 
    waterTanks, 
    buildings, 
    powerNodes, 
    sensors, 
    setSelectedAsset,
    activeView 
  } = useVillageStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 22,
        }],
      },
      center: VILLAGE_CENTER,
  zoom: 16.6, // 16.6x view
      minZoom: 12,
      maxZoom: 20,
      pitch: 45,
      bearing: 0,
      antialias: true,
      // Better performance and smoother animations
      refreshExpiredTiles: false,
      fadeDuration: 200,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });
    
    // Update zoom and pitch state
    map.current.on('zoom', () => {
      if (map.current) {
        setCurrentZoom(Math.round(map.current.getZoom() * 10) / 10);
      }
    });
    
    map.current.on('pitch', () => {
      if (map.current) {
        setCurrentPitch(Math.round(map.current.getPitch()));
      }
    });

    // Add navigation controls with zoom buttons
    map.current.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }), 
      'top-right'
    );
    
    // Add scale control
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');
    
    // Add fullscreen control
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
    
    // Prevent zoom conflicts - disable double-click zoom to avoid interference
    map.current.doubleClickZoom.disable();
    
    // Add custom double-click handler for smoother zoom
    map.current.on('dblclick', (e) => {
      e.preventDefault();
      const currentZoom = map.current!.getZoom();
      map.current!.easeTo({
        zoom: currentZoom + 1,
        duration: 300,
        easing: (t) => t,
      });
    });
    
    // Track user interactions to prevent auto-fly interference
    map.current.on('mousedown', () => {
      userInteractedRef.current = true;
    });
    
    map.current.on('touchstart', () => {
      userInteractedRef.current = true;
    });
    
    map.current.on('wheel', () => {
      userInteractedRef.current = true;
    });
    
    map.current.on('dragstart', () => {
      userInteractedRef.current = true;
    });

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add 3D buildings layer
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Add buildings as 3D extrusions
    if (!map.current.getSource('buildings')) {
      map.current.addSource('buildings', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: buildings.map(b => ({
            type: 'Feature',
            properties: {
              id: b.id,
              name: b.name,
              type: b.type,
              height: b.height,
              color: b.color,
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [b.coords[0] - 0.0001, b.coords[1] - 0.0001],
                  [b.coords[0] + 0.0001, b.coords[1] - 0.0001],
                  [b.coords[0] + 0.0001, b.coords[1] + 0.0001],
                  [b.coords[0] - 0.0001, b.coords[1] + 0.0001],
                  [b.coords[0] - 0.0001, b.coords[1] - 0.0001],
                ],
              ],
            },
          })),
        },
      });

      map.current.addLayer({
        id: 'buildings-3d',
        type: 'fill-extrusion',
        source: 'buildings',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.8,
        },
      });

      // Add click handler
      map.current.on('click', 'buildings-3d', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const building = buildings.find(b => b.id === feature.properties.id);
          if (building) {
            setSelectedAsset({ type: 'building', data: building });
          }
        }
      });
    }
  }, [mapLoaded, buildings, setSelectedAsset]);

  // Add water tanks as markers - SIMPLE VERSION
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing water tank markers
    markersRef.current
      .filter(m => m.getElement().classList.contains('water-tank-marker'))
      .forEach(marker => marker.remove());

    waterTanks.slice(0, 5).forEach(tank => {
      const el = document.createElement('div');
      el.className = 'water-tank-marker';
      el.textContent = '💧';
      
      const statusColor = tank.status === 'good' ? '#10b981' : 
                          tank.status === 'warning' ? '#f59e0b' : '#ef4444';
      
      Object.assign(el.style, {
        width: '36px',
        height: '36px',
        background: statusColor,
        borderRadius: '50%',
        border: '3px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      });

      el.onclick = () => {
        setSelectedAsset({ type: 'waterTank', data: tank });
      };

      const marker = new maplibregl.Marker({ 
        element: el,
        anchor: 'center',
      })
        .setLngLat(tank.coords)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, waterTanks, setSelectedAsset]);

  // Add power nodes - SIMPLE VERSION
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing power node markers
    markersRef.current
      .filter(m => m.getElement().classList.contains('power-node-marker'))
      .forEach(marker => marker.remove());

    powerNodes.slice(0, 8).forEach(node => {
      const el = document.createElement('div');
      el.className = 'power-node-marker';
      el.textContent = '⚡';
      
      const loadPercent = (node.currentLoad / node.capacity) * 100;
      const statusColor = loadPercent > 95 ? '#ef4444' : 
                          loadPercent > 80 ? '#f59e0b' : '#10b981';
      
      Object.assign(el.style, {
        width: '32px',
        height: '32px',
        background: statusColor,
        border: '3px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        borderRadius: '4px',
        transform: 'rotate(45deg)',
      });
      
      el.onclick = () => {
        setSelectedAsset({ type: 'powerNode', data: node });
      };

      const marker = new maplibregl.Marker({ 
        element: el,
        anchor: 'center',
      })
        .setLngLat(node.coords)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, powerNodes, setSelectedAsset]);

  // Add sensors - REDUCED AND SIMPLIFIED
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing sensor markers
    markersRef.current
      .filter(m => m.getElement().classList.contains('sensor-marker'))
      .forEach(marker => marker.remove());

    const sensorIcons: Record<string, string> = {
      soil_moisture: '🌱',
      air_quality: '💨',
      weather: '🌡️',
      water_quality: '💧',
      noise: '🔊',
      energy: '☀️',
      waste: '🗑️',
    };

    // Only show 15 sensors to reduce clutter
    sensors.slice(0, 15).forEach(sensor => {
      const el = document.createElement('div');
      el.className = 'sensor-marker';
      
      const icon = sensorIcons[sensor.type] || '📡';
      el.textContent = icon;
      
      Object.assign(el.style, {
        width: '24px',
        height: '24px',
        background: sensor.status === 'active' ? '#06b6d4' : '#6b7280',
        borderRadius: '50%',
        border: '2px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      });

      el.onclick = () => {
        setSelectedAsset({ type: 'sensor', data: sensor });
      };

      const marker = new maplibregl.Marker({ 
        element: el,
        anchor: 'center',
      })
        .setLngLat(sensor.coords)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, sensors, setSelectedAsset]);

  // Fly to different views based on activeView - only if user hasn't interacted
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    // Don't auto-fly if user has manually interacted with the map
    if (userInteractedRef.current) return;
    
    // Don't fly if we're already on this view
    if (lastViewRef.current === activeView) return;
    
    lastViewRef.current = activeView;

    switch (activeView) {
      case 'water':
        if (waterTanks.length > 0) {
          map.current.flyTo({
            center: waterTanks[0].coords,
            zoom: 16.6,
            pitch: 60,
            duration: 1500,
            essential: true,
          });
        }
        break;
      case 'power':
        if (powerNodes.length > 0) {
          map.current.flyTo({
            center: powerNodes[0].coords,
            zoom: 16.6,
            pitch: 50,
            duration: 1500,
            essential: true,
          });
        }
        break;
      case 'map':
        // Reset to overview when switching to map view
        map.current.flyTo({
          center: VILLAGE_CENTER,
          zoom: 16.6,
          pitch: 45,
          duration: 1500,
          essential: true,
        });
        // Reset interaction flag when returning to map view
        userInteractedRef.current = false;
        break;
      default:
        // Don't auto-fly for other views
        break;
    }
  }, [activeView, waterTanks, powerNodes, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map Info Panel */}
      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md rounded-lg shadow-lg p-3 border border-white/10">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Zoom:</span>
            <span className="font-semibold text-white">{currentZoom}x</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Pitch:</span>
            <span className="font-semibold text-white">{currentPitch}°</span>
          </div>
        </div>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="absolute top-4 right-20 flex flex-col gap-2">
        <button
          onClick={() => {
            if (map.current) {
              map.current.flyTo({
                center: VILLAGE_CENTER,
                zoom: 16.6,
                pitch: 45,
                bearing: 0,
                duration: 1000,
              });
            }
          }}
          className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg border border-white/10 text-sm font-medium transition-all"
          title="Reset to village center"
        >
          🏠 Reset View
        </button>
        <button
          onClick={() => {
            if (map.current) {
              const currentPitch = map.current.getPitch();
              map.current.easeTo({
                pitch: currentPitch === 0 ? 60 : 0,
                duration: 500,
              });
            }
          }}
          className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg border border-white/10 text-sm font-medium transition-all"
          title="Toggle 3D view"
        >
          🔄 Toggle 3D
        </button>
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-lg shadow-lg p-4 border border-white/10 text-sm space-y-2 max-w-xs">
        <h4 className="font-semibold text-white mb-3">Map Legend</h4>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white/20 shadow-sm" />
          <span className="text-slate-300">Water Tank (Good)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white/20 shadow-sm" />
          <span className="text-slate-300">Water Tank (Warning)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white/20 shadow-sm" />
          <span className="text-slate-300">Water Tank (Critical)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 border-2 border-white/20 shadow-sm transform rotate-45" />
          <span className="text-slate-300">Power Node</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500 border-2 border-white/20 shadow-sm" />
          <span className="text-slate-300">IoT Sensor</span>
        </div>
        <div className="pt-2 mt-2 border-t border-white/10 text-xs text-slate-400">
          💡 Scroll to zoom • Drag to pan • Right-click drag to rotate
        </div>
      </div>
    </div>
  );
}
