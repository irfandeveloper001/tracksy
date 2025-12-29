import api from './api/api';

export interface Route {
  id: number;
  name: string;
  origin?: string;
  destination?: string;
  start_location?: string;
  end_location?: string;
  start_point?: string;
  end_point?: string;
  distance?: number;
  estimated_duration?: number;
  stops?: Stop[];
}

// Helper function to normalize route data from backend
function normalizeRoute(route: any): Route {
  return {
    ...route,
    // Ensure origin and destination are set (use start_point/end_point as fallback)
    origin: route.origin || route.start_point || route.start_location || '',
    destination: route.destination || route.end_point || route.end_location || '',
  };
}

export interface Stop {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  order?: number;
  expected_arrival_time?: string;
  actual_arrival_time?: string;
  arrived?: boolean;
  students_boarding?: number;
  students_alighting?: number;
}

class RouteService {
  // Get assigned route
  async getAssignedRoute(): Promise<Route | null> {
    try {
      const response = await api.get('/driver/route');
      const route = response.data.data || response.data;
      if (route && route.id) {
        return normalizeRoute(route);
      }
      return null;
    } catch (error: any) {
      // If route not found (404), return null gracefully - this is expected if no route assigned
      if (error.response?.status === 404) {
        console.log('ℹ️ No route assigned to driver');
        return null;
      }
      // If backend unavailable or server error, return null gracefully
      if (error.response?.status === 500 || !error.response) {
        console.warn('⚠️ Backend unavailable getting route, returning null');
        return null;
      }
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get route';
      console.error('❌ Error getting route:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get route stops
  async getRouteStops(): Promise<Stop[]> {
    try {
      const response = await api.get('/driver/route/stops');
      const stops = response.data.data || response.data;
      return Array.isArray(stops) ? stops : [];
    } catch (error: any) {
      // If backend unavailable, return empty array gracefully
      if (error.response?.status === 404 || error.response?.status === 500 || !error.response) {
        console.warn('⚠️ Backend unavailable getting route stops, returning empty array');
        return [];
      }
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get route stops';
      throw new Error(errorMessage);
    }
  }

  // Mark stop arrival
  async markStopArrival(stopId: number): Promise<any> {
    try {
      const response = await api.post(`/driver/stops/${stopId}/arrive`);
      const result = response.data.data || response.data;
      return result;
    } catch (error: any) {
      // If backend unavailable, provide helpful error
      if (error.response?.status === 500 || !error.response) {
        console.warn('⚠️ Backend unavailable marking stop arrival');
        throw new Error('Backend service unavailable. Stop arrival will be synced when online.');
      }
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to mark stop arrival';
      throw new Error(errorMessage);
    }
  }
}

export default new RouteService();

