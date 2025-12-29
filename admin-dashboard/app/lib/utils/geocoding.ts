/**
 * Geocoding and Distance Calculation Utility
 * Uses OpenRouteService API (free tier) for geocoding and routing
 */

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteResult {
  distance: number; // in meters
  duration: number; // in seconds
}

// OpenRouteService API (free tier - no API key required for basic usage, but limited)
// Using Nominatim (OpenStreetMap) for geocoding as it's completely free and doesn't require an API key
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Geocode an address to coordinates using Nominatim (OpenStreetMap)
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `${NOMINATIM_BASE_URL}?q=${encodedAddress}&format=json&limit=1&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Tracksy Admin Dashboard', // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Calculate distance and duration between two coordinates using Haversine formula
 * This provides straight-line distance, which is a good approximation
 */
function calculateDistanceAndTime(start: Coordinates, end: Coordinates): RouteResult {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (start.lat * Math.PI) / 180;
  const φ2 = (end.lat * Math.PI) / 180;
  const Δφ = ((end.lat - start.lat) * Math.PI) / 180;
  const Δλ = ((end.lng - start.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters

  // Estimate duration based on average city driving speed (30 km/h = 8.33 m/s)
  // Plus a factor for traffic and stops (multiply by 1.5 for realistic estimate)
  const averageSpeed = 8.33; // meters per second
  const duration = (distance / averageSpeed) * 1.5; // Duration in seconds

  return {
    distance: Math.round(distance),
    duration: Math.round(duration),
  };
}

/**
 * Calculate route distance and time between two addresses
 */
export async function calculateRouteDistanceAndTime(
  startAddress: string,
  endAddress: string
): Promise<RouteResult | null> {
  try {
    const startCoords = await geocodeAddress(startAddress);
    const endCoords = await geocodeAddress(endAddress);

    if (!startCoords || !endCoords) {
      return null;
    }

    return calculateDistanceAndTime(startCoords, endCoords);
  } catch (error) {
    console.error('Route calculation error:', error);
    return null;
  }
}

/**
 * Format distance in meters to a human-readable string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Format duration in seconds to a human-readable string
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}
