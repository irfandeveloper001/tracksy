import { MapPinIcon } from '@heroicons/react/24/solid';

interface Location {
  name: string;
  lat?: number;
  lng?: number;
}

interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sequence: number;
}

interface RouteMapProps {
  routeId: string;
  routeName: string;
  startLocation: Location;
  endLocation: Location;
  stops: Stop[];
}

export default function RouteMap({
  routeId,
  routeName,
  startLocation,
  endLocation,
  stops,
}: RouteMapProps) {
  // Check if we have coordinates
  const hasCoordinates =
    startLocation.lat &&
    startLocation.lng &&
    endLocation.lat &&
    endLocation.lng;

  // Build waypoints for Google Maps
  const waypoints = stops
    .sort((a, b) => a.sequence - b.sequence)
    .map((stop) => `${stop.lat},${stop.lng}`)
    .join('|');

  // Build Google Maps directions URL
  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/${startLocation.lat},${startLocation.lng}/${waypoints}/${endLocation.lat},${endLocation.lng}`
    : null;

  if (!hasCoordinates) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Map coordinates not available</p>
          <p className="text-sm text-gray-400 mt-1">
            Add coordinates to start and end locations to view map
          </p>
          <div className="mt-4 text-left bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-gray-900">Route Information:</p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Start:</strong> {startLocation.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>End:</strong> {endLocation.name}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Stops:</strong> {stops.length}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Google Maps iframe embed
  const centerLat = startLocation.lat!;
  const centerLng = startLocation.lng!;
  const zoom = 12;

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg relative overflow-hidden">
      <iframe
        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${centerLat},${centerLng}&zoom=${zoom}`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg"
      />
      <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900">{routeName}</p>
        <p className="text-xs text-gray-500">{stops.length} stops</p>
      </div>
      {mapsUrl && (
        <div className="absolute bottom-4 right-4">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View on Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

