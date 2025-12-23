import api from './client';

export interface Stop {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  order?: number;
  estimated_time?: number;
}

export interface Route {
  id: number;
  name: string;
  start_point?: string;
  end_point?: string;
  origin?: string;
  destination?: string;
  distance?: number;
  estimated_duration?: number;
  is_active?: boolean;
  status?: string;
  stops?: Stop[];
}

class RouteService {
  // Get all routes
  async getRoutes(): Promise<Route[]> {
    try {
      const response = await api.get('/routes');
      const routes = response.data.data || response.data;
      return Array.isArray(routes) ? routes : [];
    } catch (error: any) {
      console.error('Error getting routes:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get routes';
      throw new Error(errorMessage);
    }
  }

  // Get route by ID
  async getRoute(id: number): Promise<Route> {
    try {
      const response = await api.get(`/routes/${id}`);
      const route = response.data.data || response.data;
      
      // Normalize route data
      return {
        ...route,
        origin: route.origin || route.start_point || '',
        destination: route.destination || route.end_point || '',
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get route';
      throw new Error(errorMessage);
    }
  }

  // Get route stops
  async getRouteStops(routeId: number): Promise<Stop[]> {
    try {
      const response = await api.get(`/routes/${routeId}/stops`);
      const stops = response.data.data || response.data;
      return Array.isArray(stops) ? stops : [];
    } catch (error: any) {
      console.error('Error getting route stops:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get route stops';
      throw new Error(errorMessage);
    }
  }
}

export default new RouteService();

