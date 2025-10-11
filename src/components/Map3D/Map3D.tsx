import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useVillageStore } from '../../store/villageStore';

const VILLAGE_CENTER: [number, number] = [73.8567, 18.5204];

export default function Map3D() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  const { 
    waterTanks, 
    buildings, 
    powerNodes, 
    roads, 
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
          maxzoom: 19,
        }],
      },
      center: VILLAGE_CENTER,
      zoom: 15,
      pitch: 45,
      bearing: 0,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

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
      traffic: '🚗',
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

  // Fly to different views based on activeView
  useEffect(() => {
    if (!map.current) return;

    switch (activeView) {
      case 'water':
        if (waterTanks.length > 0) {
          map.current.flyTo({
            center: waterTanks[0].coords,
            zoom: 15.5,
            pitch: 60,
          });
        }
        break;
      case 'power':
        if (powerNodes.length > 0) {
          map.current.flyTo({
            center: powerNodes[0].coords,
            zoom: 15.5,
            pitch: 50,
          });
        }
        break;
      default:
        map.current.flyTo({
          center: VILLAGE_CENTER,
          zoom: 15,
          pitch: 45,
        });
    }
  }, [activeView, waterTanks, powerNodes]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map legend */}
      <div className="absolute bottom-4 right-4 glass-dark p-4 rounded-lg text-sm space-y-2">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-success border-2 border-white" />
          <span>Water Tank (Good)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-warning border-2 border-white" />
          <span>Water Tank (Warning)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-danger border-2 border-white" />
          <span>Water Tank (Critical)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-success border-2 border-white transform rotate-45" />
          <span>Power Node</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 border-2 border-white" />
          <span>IoT Sensor</span>
        </div>
      </div>
    </div>
  );
}
