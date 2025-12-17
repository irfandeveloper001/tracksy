import api from './client';
import { supabase } from '../config/supabase';

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
  // Get all routes with filters and pagination - Try Supabase first, fallback to API
  async getRoutes(
    page: number = 1,
    perPage: number = 20,
    filters?: RouteFilters
  ): Promise<RouteListResponse> {
    try {
      // Try Supabase first
      const supabaseRoutes = await this.getRoutesFromSupabase(filters);
      if (supabaseRoutes && supabaseRoutes.length > 0) {
        // Apply pagination
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginatedRoutes = supabaseRoutes.slice(start, end);
        
        return {
          routes: paginatedRoutes,
          total: supabaseRoutes.length,
          current_page: page,
          per_page: perPage,
          last_page: Math.ceil(supabaseRoutes.length / perPage),
        };
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase fetch failed, trying API:', supabaseError);
    }

    // Fallback to API
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

  // Get routes directly from Supabase
  async getRoutesFromSupabase(filters?: RouteFilters): Promise<Route[]> {
    try {
      let query = supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,origin.ilike.%${filters.search}%,destination.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('⚠️ Supabase error fetching routes:', error);
        // Return empty array instead of throwing - form can work without routes
        return [];
      }

      // Map Supabase data to Route interface
      return (data || []).map((route: any) => ({
        id: route.id,
        name: route.name || route.route_name || 'Unnamed Route',
        start_location: route.origin || route.start_point || route.start_location || '',
        end_location: route.destination || route.end_point || route.end_location || '',
        distance: route.distance || null,
        estimated_duration: route.estimated_duration || null,
        status: (route.status || 'active') as 'active' | 'inactive',
        created_at: route.created_at,
        updated_at: route.updated_at,
      }));
    } catch (error) {
      console.warn('⚠️ Failed to fetch routes from Supabase:', error);
      // Return empty array - form can work without routes
      return [];
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

  // Create new route - Try Supabase first, fallback to API
  async createRoute(routeData: Partial<Route>): Promise<Route> {
    try {
      // First, try to create in Supabase directly
      const supabaseRoute = await this.createRouteInSupabase(routeData);
      if (supabaseRoute) {
        console.log('✅ Route created in Supabase:', supabaseRoute);
        return supabaseRoute;
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase creation failed, trying API:', supabaseError);
    }

    // Fallback to API if Supabase fails
    try {
      const response = await api.post('/admin/routes', routeData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create route');
    }
  }

  // Create route directly in Supabase
  async createRouteInSupabase(routeData: Partial<Route>): Promise<Route | null> {
    try {
      // Map the data to Supabase schema (uses origin/destination, not start_point/end_point)
      const supabaseData: any = {
        name: routeData.name,
        origin: routeData.start_location || routeData.start_point || '',
        destination: routeData.end_location || routeData.end_point || '',
        status: routeData.status || 'active',
      };

      // Add optional fields only if provided
      if (routeData.distance !== undefined && routeData.distance !== null) {
        supabaseData.distance = routeData.distance;
      }
      if (routeData.estimated_duration !== undefined && routeData.estimated_duration !== null) {
        supabaseData.estimated_duration = routeData.estimated_duration;
      }

      // Remove empty strings
      Object.keys(supabaseData).forEach(key => {
        if (supabaseData[key] === '' || supabaseData[key] === null) {
          delete supabaseData[key];
        }
      });

      console.log('🛣️ Inserting route into Supabase:', supabaseData);

      const { data, error } = await supabase
        .from('routes')
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        // Provide better error messages
        if (error.code === '23505') {
          throw new Error('A route with this name already exists');
        }
        throw error;
      }

      // Map Supabase response to Route interface
      const route: Route = {
        id: data.id,
        name: data.name,
        start_location: data.origin,
        end_location: data.destination,
        distance: data.distance,
        estimated_duration: data.estimated_duration,
        status: data.status as any,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      console.log('✅ Route created successfully in Supabase:', route);
      return route;
    } catch (error: any) {
      console.error('❌ Failed to create route in Supabase:', error);
      throw error;
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
