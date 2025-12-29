import { useEffect, useRef, useState } from 'react';
import { TruckIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { Bus } from '../../lib/api/types';
import type { Route } from '../../lib/api/routeService';
import {
  mapLocations,
  pakistanMapDefaults,
  simulatedLocation,
  type MapLocation,
} from '../../lib/maps/mapData';
import { tileLayerConfig } from '../../lib/maps/tileSources';

interface LiveMapProps {
  buses: Bus[];
  routes: Route[];
  selectedRoute?: string;
}

type LeafletMap = any;

declare global {
  interface Window {
    L?: any;
  }
}

const loadLeaflet = () =>
  new Promise<any>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Leaflet requires a browser environment.'));
      return;
    }

    if (window.L) {
      resolve(window.L);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-leaflet]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Leaflet.')));
      return;
    }

    const script = document.createElement('script');
    script.src = '/vendor/leaflet/leaflet.js';
    script.async = true;
    script.defer = true;
    script.dataset.leaflet = 'true';
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Failed to load Leaflet.'));
    document.body.appendChild(script);
  });

interface BusLocationInfo {
  lat: number;
  lng: number;
  isSimulated: boolean;
  city?: string;
  province?: string;
  sourceLabel: string;
  timestamp?: string;
}

const buildPopupHtml = (location: MapLocation) => `
  <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
    <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px;">
      ${location.name}
    </div>
    <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
      ${location.city}, ${location.province}
    </div>
    <div style="font-size: 12px; color: #374151;">
      <div><span style="font-weight: 600;">Type:</span> ${location.category}</div>
      <div><span style="font-weight: 600;">Details:</span> ${location.details}</div>
    </div>
  </div>
`;

const buildBusPopupHtml = (bus: Bus, location: BusLocationInfo) => {
  const name = bus.license_plate || bus.bus_number || `Bus #${bus.id ?? 'N/A'}`;
  const status = bus.status || 'Active';
  const capacity = bus.capacity ? `${bus.capacity} seats` : 'N/A';
  const locationLabel = location.isSimulated
    ? `Near ${location.city ?? 'city'}, ${location.province ?? 'Pakistan'}`
    : `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  const timestamp = location.timestamp
    ? new Date(location.timestamp).toLocaleTimeString()
    : 'Just now';

  return `
    <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px;">
        ${name}
      </div>
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
        Status: ${status}
      </div>
      <div style="font-size: 12px; color: #374151;">
        <div><span style="font-weight: 600;">Capacity:</span> ${capacity}</div>
        <div><span style="font-weight: 600;">Location:</span> ${locationLabel}</div>
        <div><span style="font-weight: 600;">Source:</span> ${location.sourceLabel}</div>
        <div><span style="font-weight: 600;">Updated:</span> ${timestamp}</div>
      </div>
    </div>
  `;
};

const currentLocationPopup = `
  <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
    <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px;">
      ${simulatedLocation.name}
    </div>
    <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
      ${simulatedLocation.city}, ${simulatedLocation.province}
    </div>
    <div style="font-size: 12px; color: #374151;">
      <div><span style="font-weight: 600;">Mode:</span> Demo</div>
      <div><span style="font-weight: 600;">Source:</span> Fixed coordinates</div>
    </div>
  </div>
`;

export default function LiveMap({ buses, routes, selectedRoute }: LiveMapProps) {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const busLayerRef = useRef<any | null>(null);
  const busMarkersRef = useRef<Map<number | string, any>>(new Map());
  const hasFitRef = useRef(false);

  // Get active buses with location
  const activeBuses = buses.filter((bus) => bus.status === 'active');

  // Get selected route for visualization
  const route = selectedRoute && selectedRoute !== 'all' 
    ? routes.find((r) => r.id === selectedRoute)
    : null;

  const getBusLocationInfo = (bus: Bus, index: number): BusLocationInfo | null => {
    if (bus.current_latitude && bus.current_longitude) {
      return {
        lat: bus.current_latitude,
        lng: bus.current_longitude,
        isSimulated: false,
        sourceLabel: 'Live (API)',
        timestamp: bus.last_location_update || undefined,
      };
    }

    if (mapLocations.length === 0) {
      return null;
    }

    const base = mapLocations[(Number(bus.id ?? index) + index) % mapLocations.length];
    const seed = (Number(bus.id ?? index + 1) + 7) * 97;
    const offsetLat = ((seed % 7) - 3) * 0.018;
    const offsetLng = ((seed % 11) - 5) * 0.02;

    return {
      lat: base.lat + offsetLat,
      lng: base.lng + offsetLng,
      isSimulated: true,
      city: base.city,
      province: base.province,
      sourceLabel: 'Simulated (demo)',
    };
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || typeof window === 'undefined') {
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await loadLeaflet();
        if (!isMounted || !mapContainerRef.current) {
          return;
        }

        const map = L.map(mapContainerRef.current, {
          center: pakistanMapDefaults.center,
          zoom: pakistanMapDefaults.zoom,
          zoomControl: true,
          scrollWheelZoom: true,
          dragging: true,
          zoomSnap: 0.5,
          fadeAnimation: true,
          zoomAnimation: true,
          markerZoomAnimation: true,
          inertia: true,
        });

        mapRef.current = map;
        L.tileLayer(tileLayerConfig.url, tileLayerConfig.options).addTo(map);

        const staticLayer = L.layerGroup().addTo(map);
        const busLayer = L.layerGroup().addTo(map);
        busLayerRef.current = busLayer;

        const layers: any[] = [];

        mapLocations.forEach((location) => {
          const isUniversity = location.category === 'University';
          const marker = L.circleMarker([location.lat, location.lng], {
            radius: isUniversity ? 7 : 6,
            color: isUniversity ? '#1d4ed8' : '#0f766e',
            fillColor: isUniversity ? '#3b82f6' : '#14b8a6',
            fillOpacity: 0.9,
            weight: 2,
          });

          marker.bindPopup(buildPopupHtml(location), { closeButton: true, offset: [0, -8] });
          marker.addTo(staticLayer);
          layers.push(marker);
        });

        const currentMarker = L.circleMarker([simulatedLocation.lat, simulatedLocation.lng], {
          radius: 8,
          color: '#059669',
          fillColor: '#34d399',
          fillOpacity: 0.95,
          weight: 2,
        }).addTo(staticLayer);

        const accuracyCircle = L.circle([simulatedLocation.lat, simulatedLocation.lng], {
          radius: 1200,
          color: '#10b981',
          fillColor: '#34d399',
          fillOpacity: 0.15,
          weight: 1,
        }).addTo(staticLayer);

        currentMarker.bindPopup(currentLocationPopup, { closeButton: true, offset: [0, -8] });
        layers.push(currentMarker, accuracyCircle);

        if (layers.length > 0 && !hasFitRef.current) {
          const bounds = L.featureGroup(layers).getBounds().pad(0.2);
          map.fitBounds(bounds, { animate: true });
          hasFitRef.current = true;
        }

        map.zoomControl.setPosition('bottomright');
        setTimeout(() => map.invalidateSize(), 0);
      } catch (error) {
        setMapError('Unable to load map assets for the demo.');
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !busLayerRef.current || typeof window === 'undefined') {
      return;
    }

    let isMounted = true;

    const updateBusMarkers = async () => {
      const L = await loadLeaflet();
      if (!isMounted || !busLayerRef.current) {
        return;
      }

      busLayerRef.current.clearLayers();
      busMarkersRef.current.clear();

      activeBuses.forEach((bus, index) => {
        const location = getBusLocationInfo(bus, index);
        if (!location) {
          return;
        }

        const marker = L.circleMarker([location.lat, location.lng], {
          radius: 7,
          color: location.isSimulated ? '#b45309' : '#7c3aed',
          fillColor: location.isSimulated ? '#f59e0b' : '#a855f7',
          fillOpacity: 0.95,
          weight: 2,
        });

        marker.bindPopup(buildBusPopupHtml(bus, location), { closeButton: true, offset: [0, -8] });
        marker.addTo(busLayerRef.current);
        busMarkersRef.current.set(bus.id ?? index, marker);
      });
    };

    updateBusMarkers();

    return () => {
      isMounted = false;
    };
  }, [activeBuses]);

  return (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-2xl overflow-hidden">
      {mapError ? (
        <div className="flex h-full items-center justify-center bg-slate-100">
          <div className="text-center">
            <MapPinIcon className="h-12 w-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600">{mapError}</p>
            <p className="text-sm text-slate-400 mt-1">
              Ensure Leaflet assets are available in /public/vendor/leaflet.
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={mapContainerRef}
          className="h-full w-full rounded-2xl border border-slate-200 bg-slate-100"
        />
      )}

      {/* Bus List Overlay */}
      <div className="absolute top-4 left-4 bg-white/95 rounded-2xl shadow-lg p-4 max-w-xs border border-slate-200/70">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Active Buses</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activeBuses.map((bus) => (
            <button
              key={bus.id}
              onClick={() => setSelectedBus(selectedBus?.id === bus.id ? null : bus)}
              className={`w-full text-left p-2 rounded-lg transition-colors ${
                selectedBus?.id === bus.id
                  ? 'bg-slate-50 border border-slate-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TruckIcon className="h-4 w-4 text-slate-700" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {bus.bus_number}
                  </p>
                  {bus.route_name && (
                    <p className="text-xs text-gray-500 truncate">{bus.route_name}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bus Info Popup */}
      {selectedBus && (
        <div className="absolute bottom-4 right-4 bg-white/95 rounded-2xl shadow-lg p-4 max-w-sm border border-slate-200/70">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Bus {selectedBus.bus_number}
            </h3>
            <button
              onClick={() => setSelectedBus(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-sm">
            {selectedBus.route_name && (
              <div>
                <span className="text-gray-500">Route:</span>{' '}
                <span className="font-medium">{selectedBus.route_name}</span>
              </div>
            )}
            {selectedBus.driver_name && (
              <div>
                <span className="text-gray-500">Driver:</span>{' '}
                <span className="font-medium">{selectedBus.driver_name}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Status:</span>{' '}
              <span
                className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                  selectedBus.status === 'active'
                    ? 'bg-slate-100 text-slate-700'
                    : selectedBus.status === 'maintenance'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {selectedBus.status}
              </span>
            </div>
            {selectedBus.current_latitude && selectedBus.current_longitude && (
              <div>
                <span className="text-gray-500">Location:</span>{' '}
                <span className="font-medium">
                  {selectedBus.current_latitude.toFixed(6)},{' '}
                  {selectedBus.current_longitude.toFixed(6)}
                </span>
              </div>
            )}
            {selectedBus.last_location_update && (
              <div>
                <span className="text-gray-500">Last Update:</span>{' '}
                <span className="font-medium">
                  {new Date(selectedBus.last_location_update).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <a
              href={`https://www.openstreetmap.org/?mlat=${selectedBus.current_latitude}&mlon=${selectedBus.current_longitude}#map=14/${selectedBus.current_latitude}/${selectedBus.current_longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-700 hover:text-slate-900"
            >
              View on OpenStreetMap →
            </a>
          </div>
        </div>
      )}

      {/* Route Info */}
      {route && (
        <div className="absolute top-4 right-4 bg-white/95 rounded-2xl shadow-lg p-3 border border-slate-200/70">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{route.name}</p>
              <p className="text-xs text-gray-500">
                {activeBuses.filter((b) => b.route_id === route.id).length} bus(es)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
