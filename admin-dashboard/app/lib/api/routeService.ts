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
  // Get all routes with filters and pagination - ALWAYS use Supabase first (primary source)
  async getRoutes(
    page: number = 1,
    perPage: number = 20,
    filters?: RouteFilters
  ): Promise<RouteListResponse> {
    try {
      // PRIMARY: Always try Supabase first - this is our main data source
      const supabaseRoutes = await this.getRoutesFromSupabase(filters);
      
      if (supabaseRoutes && supabaseRoutes.length >= 0) {
        // Apply pagination
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginatedRoutes = supabaseRoutes.slice(start, end);
        
        console.log(`✅ Returning ${supabaseRoutes.length} routes from Supabase (showing ${paginatedRoutes.length} on page ${page})`);
        
        return {
          routes: paginatedRoutes,
          total: supabaseRoutes.length,
          current_page: page,
          per_page: perPage,
          last_page: Math.ceil(supabaseRoutes.length / perPage) || 1,
        };
      }
      
      // Return empty result if Supabase fails
      console.warn('⚠️ Supabase returned empty routes - check RLS policies and authentication');
      return {
        routes: [],
        total: 0,
        current_page: page,
        per_page: perPage,
        last_page: 1,
      };
    } catch (supabaseError: any) {
      console.error('❌ Supabase fetch error:', supabaseError);
      // Return empty result instead of falling back to API
      // This ensures we always use Supabase as the source of truth
      return {
        routes: [],
        total: 0,
        current_page: page,
        per_page: perPage,
        last_page: 1,
      };
    }
  }

  // Get routes directly from Supabase
  async getRoutesFromSupabase(filters?: RouteFilters): Promise<Route[]> {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Route query - Session status:', session ? 'Authenticated' : 'Not authenticated');
      
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
        console.error('❌ Supabase error fetching routes:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        // Return empty array instead of throwing - form can work without routes
        return [];
      }
      
      console.log(`✅ Supabase returned ${data?.length || 0} routes`);

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

  // Create new route - ALWAYS use Supabase (primary database)
  async createRoute(routeData: Partial<Route>): Promise<Route> {
    try {
      // PRIMARY: Always create in Supabase first - this is our main database
      const supabaseRoute = await this.createRouteInSupabase(routeData);
      if (supabaseRoute) {
        console.log('✅ Route created in Supabase database:', supabaseRoute);
        console.log('💾 Data is now stored in Supabase and will be fetched directly from there');
        return supabaseRoute;
      }
      throw new Error('Route creation returned null');
    } catch (supabaseError: any) {
      console.error('❌ Supabase creation failed:', supabaseError);
      // Don't fallback to API - Supabase is our source of truth
      throw new Error(supabaseError.message || 'Failed to create route in database. Please check your connection and try again.');
    }
  }

  // Create route directly in Supabase
  async createRouteInSupabase(routeData: Partial<Route>): Promise<Route | null> {
    try {
      // Check if user is authenticated before making request
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('❌ No active session found:', sessionError);
        throw new Error('You must be logged in to create routes. Please sign in and try again.');
      }
      
      console.log('✅ Active session found, user ID:', session.user.id);
      
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
      
      // Add coordinates if provided (only if columns exist in schema)
      // These columns are optional - if they don't exist, Supabase will ignore them
      // To add them, run ADD_ROUTE_COORDINATES.sql in Supabase
      if (routeData.start_latitude !== undefined && routeData.start_latitude !== null) {
        supabaseData.start_latitude = routeData.start_latitude;
      }
      if (routeData.start_longitude !== undefined && routeData.start_longitude !== null) {
        supabaseData.start_longitude = routeData.start_longitude;
      }
      if (routeData.end_latitude !== undefined && routeData.end_latitude !== null) {
        supabaseData.end_latitude = routeData.end_latitude;
      }
      if (routeData.end_longitude !== undefined && routeData.end_longitude !== null) {
        supabaseData.end_longitude = routeData.end_longitude;
      }
      
      // Remove any undefined/null values to avoid Supabase errors
      Object.keys(supabaseData).forEach(key => {
        if (supabaseData[key] === undefined || supabaseData[key] === null || supabaseData[key] === '') {
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
          throw new Error('A route with this name already exists. Please use a different name.');
        }
        
        // Handle missing coordinate columns - retry without them
        if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('schema cache')) {
          console.warn('⚠️ Coordinate columns not found in routes table, retrying without coordinates...');
          const retryData: any = {
            name: routeData.name,
            origin: routeData.start_location || routeData.start_point || '',
            destination: routeData.end_location || routeData.end_point || '',
            status: routeData.status || 'active',
          };
          
          // Add optional fields (but not coordinates)
          if (routeData.distance !== undefined && routeData.distance !== null) {
            retryData.distance = routeData.distance;
          }
          if (routeData.estimated_duration !== undefined && routeData.estimated_duration !== null) {
            retryData.estimated_duration = routeData.estimated_duration;
          }
          
          const { data: retryResult, error: retryError } = await supabase
            .from('routes')
            .insert(retryData)
            .select()
            .single();
            
          if (retryError) {
            throw new Error(retryError.message || 'Failed to create route in database');
          }
          
          // Return the retry result
          const route: Route = {
            id: retryResult.id,
            name: retryResult.name,
            start_location: retryResult.origin,
            end_location: retryResult.destination,
            distance: retryResult.distance,
            estimated_duration: retryResult.estimated_duration,
            status: retryResult.status as any,
            created_at: retryResult.created_at,
            updated_at: retryResult.updated_at,
          };
          
          console.log('✅ Route created successfully (without coordinates)');
          return route;
        }
        
        throw new Error(error.message || 'Failed to create route in database');
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
