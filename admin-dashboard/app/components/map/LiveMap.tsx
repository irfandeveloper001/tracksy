import { useState } from 'react';
import { TruckIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { Bus } from '../../lib/api/types';
import { Route } from '../../lib/api/routeService';

interface LiveMapProps {
  buses: Bus[];
  routes: Route[];
  selectedRoute?: string;
}

export default function LiveMap({ buses, routes, selectedRoute }: LiveMapProps) {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  // Get active buses with location
  const activeBuses = buses.filter(
    (bus) => bus.status === 'active' && bus.current_latitude && bus.current_longitude
  );

  // Get selected route for visualization
  const route = selectedRoute && selectedRoute !== 'all' 
    ? routes.find((r) => r.id === selectedRoute)
    : null;

  if (activeBuses.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No active buses with location data</p>
          <p className="text-sm text-gray-400 mt-1">
            Buses will appear on the map when they are active and have location data
          </p>
        </div>
      </div>
    );
  }

  // Calculate center point (average of all bus locations)
  const centerLat =
    activeBuses.reduce((sum, bus) => sum + (bus.current_latitude || 0), 0) /
    activeBuses.length;
  const centerLng =
    activeBuses.reduce((sum, bus) => sum + (bus.current_longitude || 0), 0) /
    activeBuses.length;

  // Build Google Maps URL with markers
  const markers = activeBuses
    .map(
      (bus) =>
        `${bus.current_latitude},${bus.current_longitude}|${bus.bus_number}`
    )
    .join('&markers=');

  const mapsUrl = `https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&center=${centerLat},${centerLng}&zoom=12`;

  return (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
      {/* Google Maps iframe */}
      <iframe
        src={mapsUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg"
      />

      {/* Bus List Overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Active Buses</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activeBuses.map((bus) => (
            <button
              key={bus.id}
              onClick={() => setSelectedBus(selectedBus?.id === bus.id ? null : bus)}
              className={`w-full text-left p-2 rounded-lg transition-colors ${
                selectedBus?.id === bus.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TruckIcon className="h-4 w-4 text-blue-600" />
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
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
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
                    ? 'bg-green-100 text-green-800'
                    : selectedBus.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
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
              href={`https://www.google.com/maps?q=${selectedBus.current_latitude},${selectedBus.current_longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View on Google Maps →
            </a>
          </div>
        </div>
      )}

      {/* Route Info */}
      {route && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
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

