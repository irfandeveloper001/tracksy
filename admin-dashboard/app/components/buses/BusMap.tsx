import { useEffect, useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/solid';

interface BusMapProps {
  busId: string;
  busNumber: string;
  currentLocation?: { lat: number; lng: number };
}

export default function BusMap({ busId, busNumber, currentLocation }: BusMapProps) {
  const [mapError, setMapError] = useState(false);

  // For now, we'll use a placeholder map
  // In production, integrate with Google Maps or Mapbox
  useEffect(() => {
    // Check if Google Maps API key is available
    const hasMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!hasMapsKey) {
      setMapError(true);
    }
  }, []);

  if (mapError || !currentLocation) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center relative">
        {!currentLocation ? (
          <div className="text-center">
            <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No location data available</p>
            <p className="text-sm text-gray-400 mt-1">
              Location will appear when bus is active
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500">Map integration required</p>
            <p className="text-sm text-gray-400 mt-1">
              Configure Google Maps API key to view map
            </p>
            <div className="mt-4 text-left bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-gray-900">Current Location:</p>
              <p className="text-sm text-gray-600">
                Lat: {currentLocation.lat.toFixed(6)}
              </p>
              <p className="text-sm text-gray-600">
                Lng: {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Google Maps integration would go here
  // For now, show a placeholder
  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center relative">
      <iframe
        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${currentLocation.lat},${currentLocation.lng}&zoom=15`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg"
      />
      <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">Bus #{busNumber}</p>
        <p className="text-xs text-gray-500">Live Location</p>
      </div>
    </div>
  );
}

