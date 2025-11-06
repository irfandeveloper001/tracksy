import api from './client';

export interface Route {
  id: string;
  name: string;
  start_location: string;
  end_location: string;
  start_latitude?: number;
  start_longitude?: number;
  end_latitude?: number;
  end_longitude?: number;
  distance?: number; // in km
  estimated_duration?: number; // in minutes
  stops_count?: number;
  active_buses_count?: number;
  student_count?: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Stop {
  id: string;
  route_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  sequence: number;
  estimated_arrival_time?: number; // minutes from start
  student_count?: number;
}

export interface RouteFilters {
  status?: string;
  search?: string;
}

export interface RouteListResponse {
  routes: Route[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

class RouteService {
  // Get all routes with filters and pagination
  async getRoutes(
    page: number = 1,
    perPage: number = 20,
    filters?: RouteFilters
  ): Promise<RouteListResponse> {
    try {
      const params: any = {
        page,
        per_page: perPage,
        ...filters,
      };

      const response = await api.get('/admin/routes', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning empty routes list');
        return {
          routes: [],
          total: 0,
          current_page: 1,
          per_page: perPage,
          last_page: 1,
        };
      }
      throw error;
    }
  }

  // Get single route by ID
  async getRouteById(routeId: string): Promise<Route> {
    try {
      const response = await api.get(`/admin/routes/${routeId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        throw new Error('Backend unavailable');
      }
      throw error;
    }
  }

  // Get route stops
  async getRouteStops(routeId: string): Promise<Stop[]> {
    try {
      const response = await api.get(`/admin/routes/${routeId}/stops`);
      return response.data.data || response.data || [];
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return [];
      }
      return [];
    }
  }

  // Create new route
  async createRoute(routeData: Partial<Route>): Promise<Route> {
    try {
      const response = await api.post('/admin/routes', routeData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create route');
    }
  }

  // Update route
  async updateRoute(routeId: string, routeData: Partial<Route>): Promise<Route> {
    try {
      const response = await api.put(`/admin/routes/${routeId}`, routeData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update route');
    }
  }

  // Delete route
  async deleteRoute(routeId: string): Promise<void> {
    try {
      await api.delete(`/admin/routes/${routeId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete route');
    }
  }

  // Add stop to route
  async addStop(routeId: string, stopData: Partial<Stop>): Promise<Stop> {
    try {
      const response = await api.post(`/admin/routes/${routeId}/stops`, stopData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add stop');
    }
  }

  // Update stop
  async updateStop(routeId: string, stopId: string, stopData: Partial<Stop>): Promise<Stop> {
    try {
      const response = await api.put(`/admin/routes/${routeId}/stops/${stopId}`, stopData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update stop');
    }
  }

  // Delete stop from route
  async deleteStop(routeId: string, stopId: string): Promise<void> {
    try {
      await api.delete(`/admin/routes/${routeId}/stops/${stopId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete stop');
    }
  }

  // Reorder stops
  async reorderStops(routeId: string, stopIds: string[]): Promise<void> {
    try {
      await api.patch(`/admin/routes/${routeId}/stops/reorder`, { stop_ids: stopIds });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reorder stops');
    }
  }

  // Get all stops (for stop management page)
  async getAllStops(page: number = 1, perPage: number = 50): Promise<any> {
    try {
      const response = await api.get('/admin/stops', {
        params: { page, per_page: perPage },
      });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return { stops: [], total: 0 };
      }
      return { stops: [], total: 0 };
    }
  }
}

export default new RouteService();
