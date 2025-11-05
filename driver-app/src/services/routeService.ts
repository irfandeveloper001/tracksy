import api from './api/api';

export interface Route {
  id: number;
  name: string;
  origin: string;
  destination: string;
  distance?: number;
  estimated_duration?: number;
  stops?: Stop[];
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
  async getAssignedRoute(): Promise<Route> {
    try {
      const response = await api.get('/driver/route');
      const route = response.data.data || response.data;
      return route;
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
  async getRouteStops(): Promise<Stop[]> {
    try {
      const response = await api.get('/driver/route/stops');
      const stops = response.data.data || response.data;
      return Array.isArray(stops) ? stops : [];
    } catch (error: any) {
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

