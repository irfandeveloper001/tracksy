import api from './client';

export interface Route {
  id: string;
  name: string;
  start_location: string;
  end_location: string;
  // Backend uses start_point/end_point, frontend uses start_location/end_location
  start_point?: string;
  end_point?: string;
  // Supabase uses origin/destination
  origin?: string;
  destination?: string;
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
  is_active?: boolean; // Backend uses this
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
  // Get all routes with filters and pagination - Use Laravel backend API only
  async getRoutes(
    page: number = 1,
    perPage: number = 20,
    filters?: RouteFilters
  ): Promise<RouteListResponse> {
    try {
      const params: any = {
        page,
        limit: perPage,
      };

      // Add filters to params
      if (filters?.status) {
        params.status = filters.status;
      }
      if (filters?.search) {
        params.search = filters.search;
      }

      const response = await api.get('/admin/routes', { params });
      const backendData = response.data.data || response.data;

      // Handle Laravel pagination response format
      if (backendData.data && Array.isArray(backendData.data)) {
        // Laravel paginated response
        const routes = backendData.data.map((route: any) => this.mapBackendRouteToFrontend(route));
        
        return {
          routes,
          total: backendData.total || 0,
          current_page: backendData.current_page || page,
          per_page: backendData.per_page || perPage,
          last_page: backendData.last_page || 1,
        };
      } else if (Array.isArray(backendData)) {
        // Simple array response
        const routes = backendData.map((route: any) => this.mapBackendRouteToFrontend(route));
        
        return {
          routes,
          total: routes.length,
          current_page: page,
          per_page: perPage,
          last_page: Math.ceil(routes.length / perPage) || 1,
        };
      }
      
      return {
        routes: [],
        total: 0,
        current_page: page,
        per_page: perPage,
        last_page: 1,
      };
    } catch (error: any) {
      console.error('❌ Failed to fetch routes from backend:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch routes');
    }
  }

  // Map backend route data to frontend Route interface
  private mapBackendRouteToFrontend(route: any): Route {
    return {
      id: route.id,
      name: route.name || 'Unnamed Route',
      start_location: route.start_point || route.origin || route.start_location || '',
      end_location: route.end_point || route.destination || route.end_location || '',
      start_latitude: route.start_latitude || null,
      start_longitude: route.start_longitude || null,
      end_latitude: route.end_latitude || null,
      end_longitude: route.end_longitude || null,
      distance: route.distance || null,
      estimated_duration: route.estimated_duration || null,
      stops_count: route.stops?.length || 0,
      status: (route.status || (route.is_active ? 'active' : 'inactive')) as 'active' | 'inactive',
      created_at: route.created_at,
      updated_at: route.updated_at,
        };
  }

  // Get routes directly from Supabase (DEPRECATED - Use Laravel API)
  async getRoutesFromSupabase(filters?: RouteFilters): Promise<Route[]> {
    // This method is deprecated - use getRoutes() instead
    console.warn('⚠️ getRoutesFromSupabase is deprecated. Use getRoutes() with Laravel API instead.');
    return [];
  }

  // Get single route by ID - Use Laravel backend API only
  async getRouteById(routeId: string): Promise<Route> {
    try {
      const response = await api.get(`/admin/routes/${routeId}`);
      const backendRoute = response.data.data || response.data;
      
      if (!backendRoute) {
        throw new Error('Route not found');
      }

      return this.mapBackendRouteToFrontend(backendRoute);
    } catch (error: any) {
      console.error('❌ Failed to fetch route:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch route details');
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

  // Create new route - Laravel API only
  async createRoute(routeData: Partial<Route>): Promise<Route> {
    try {
      // Map frontend Route interface to backend format
      const backendData: any = {
        name: routeData.name?.trim(),
        start_point: (routeData.start_location || routeData.start_point || '').trim(),
        end_point: (routeData.end_location || routeData.end_point || '').trim(),
      };

      // Add optional fields only if provided
      if (routeData.distance !== undefined && routeData.distance !== null) {
        backendData.distance = routeData.distance;
      }
      if (routeData.estimated_duration !== undefined && routeData.estimated_duration !== null) {
        backendData.estimated_duration = routeData.estimated_duration;
      }

      // Handle status - Laravel accepts both 'status' and 'is_active'
      if (routeData.status) {
        backendData.status = routeData.status;
        backendData.is_active = routeData.status === 'active';
      } else if (routeData.is_active !== undefined) {
        backendData.is_active = routeData.is_active;
        backendData.status = routeData.is_active ? 'active' : 'inactive';
      } else {
        backendData.status = 'active';
        backendData.is_active = true;
      }

      // Remove undefined/null fields
      Object.keys(backendData).forEach(key => {
        if (backendData[key] === undefined || backendData[key] === null) {
          delete backendData[key];
        }
      });

      console.log('🛣️ Creating route with data:', backendData);
      const response = await api.post('/admin/routes', backendData);
      const backendRoute = response.data.data || response.data;
      
      if (!backendRoute) {
        throw new Error('Route creation succeeded but no data returned');
      }

      console.log('✅ Route created successfully:', backendRoute);
      return this.mapBackendRouteToFrontend(backendRoute);
    } catch (error: any) {
      console.error('❌ Failed to create route:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to create route. Please try again.';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          // Laravel validation errors
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return `${field}: ${msg}`;
            })
            .join(', ');
          errorMessage = validationErrors;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Create route directly in Supabase (DEPRECATED - Use Laravel API)
  async createRouteInSupabase(routeData: Partial<Route>): Promise<Route | null> {
    // This method is deprecated - use createRoute() instead
    console.warn('⚠️ createRouteInSupabase is deprecated. Use createRoute() with Laravel API instead.');
    return null;
  }

  // Update route - Use Laravel backend API only
  async updateRoute(routeId: string, routeData: Partial<Route>): Promise<Route> {
    try {
      // Map Route interface to backend format
      const backendData: any = {
        name: routeData.name?.trim(),
        start_point: (routeData.start_location || routeData.start_point || '').trim(),
        end_point: (routeData.end_location || routeData.end_point || '').trim(),
      };

      // Add optional fields only if provided
      if (routeData.distance !== undefined && routeData.distance !== null) {
        backendData.distance = routeData.distance;
      }
      if (routeData.estimated_duration !== undefined && routeData.estimated_duration !== null) {
        backendData.estimated_duration = routeData.estimated_duration;
      }

      // Handle status - Laravel accepts both 'status' and 'is_active'
      if (routeData.status) {
        backendData.status = routeData.status;
        backendData.is_active = routeData.status === 'active';
      } else if (routeData.is_active !== undefined) {
        backendData.is_active = routeData.is_active;
        backendData.status = routeData.is_active ? 'active' : 'inactive';
      }

      // Remove undefined/null fields
      Object.keys(backendData).forEach(key => {
        if (backendData[key] === undefined || backendData[key] === null) {
          delete backendData[key];
        }
      });

      console.log('🛣️ Updating route with data:', backendData);
      const response = await api.put(`/admin/routes/${routeId}`, backendData);
      const backendRoute = response.data.data || response.data;
      
      if (!backendRoute) {
        throw new Error('Route update succeeded but no data returned');
      }
      
      return this.mapBackendRouteToFrontend(backendRoute);
    } catch (error: any) {
      console.error('❌ Failed to update route:', error);
      throw new Error(error.response?.data?.message || 'Failed to update route');
    }
  }

  // Delete route - Use Laravel backend API only
  async deleteRoute(routeId: string): Promise<void> {
    try {
      await api.delete(`/admin/routes/${routeId}`);
    } catch (error: any) {
      console.error('❌ Failed to delete route:', error);
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
