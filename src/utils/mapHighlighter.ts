import { Citation } from '../hooks/useRagQuery';

/**
 * Map highlighter utility for pan/zoom/flash markers by doc_id
 * Works with MapLibre GL or similar map libraries
 */

interface MapInstance {
  flyTo: (options: any) => void;
  getSource?: (id: string) => any;
  addLayer?: (layer: any) => void;
  removeLayer?: (id: string) => void;
}

/**
 * Highlight citation on map by panning to location and flashing marker
 */
export function highlightCitationOnMap(citation: Citation, mapInstance: MapInstance) {
  if (!citation.geo || !citation.geo.lat || !citation.geo.lon) {
    console.warn('Citation has no geo coordinates:', citation.doc_id);
    return;
  }

  const { lat, lon } = citation.geo;

  // Pan and zoom to location
  mapInstance.flyTo({
    center: [lon, lat],
    zoom: 16.6,
    duration: 1500,
    essential: true
  });

  // Flash marker (pulse animation)
  flashMarker(mapInstance, lon, lat, citation.doc_id);
}

/**
 * Create a pulsing marker effect for 3 seconds
 */
function flashMarker(mapInstance: MapInstance, lon: number, lat: number, docId: string) {
  const pulseLayerId = `pulse-${docId}`;

  // Remove existing pulse layer if present
  if (mapInstance.removeLayer) {
    try {
      mapInstance.removeLayer(pulseLayerId);
    } catch (e) {
      // Layer doesn't exist, ignore
    }
  }

  // Add pulse layer (implementation depends on map library)
  if (mapInstance.addLayer) {
    try {
      mapInstance.addLayer({
        id: pulseLayerId,
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lon, lat]
            }
          }
        },
        paint: {
          'circle-radius': 30,
          'circle-color': '#8B5CF6',
          'circle-opacity': 0.6,
          'circle-blur': 0.5
        }
      });
    } catch (e) {
      console.error('Failed to add pulse layer:', e);
    }
  }

  // Remove pulse after 3 seconds
  setTimeout(() => {
    if (mapInstance.removeLayer) {
      try {
        mapInstance.removeLayer(pulseLayerId);
      } catch (e) {
        // Ignore if already removed
      }
    }
  }, 3000);
}

/**
 * Zoom to scheme bounds if scheme_id is provided (no specific geo)
 */
export async function zoomToScheme(schemeId: string, mapInstance: MapInstance) {
  try {
    // Fetch scheme metadata to get bounds
    const response = await fetch(`http://localhost:3001/api/schemes/${schemeId}`);
    const data = await response.json();
    
    if (data.scheme && data.scheme.location) {
      const { lat, lng } = data.scheme.location;
      mapInstance.flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1500,
        essential: true
      });
    }
  } catch (error) {
    console.error('Failed to zoom to scheme:', error);
  }
}
