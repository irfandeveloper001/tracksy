import api from './client';
import { supabase } from '../config/supabase';
// Import types from centralized types file to avoid Vite HMR cache issues
import type { Bus, BusFilters, BusListResponse } from './types';

// Re-export types for backward compatibility
export type { Bus, BusFilters, BusListResponse };

class BusService {
  // Get all buses with filters and pagination - Use Laravel backend API only
  async getBuses(
    page: number = 1,
    perPage: number = 20,
    filters?: BusFilters
  ): Promise<BusListResponse> {
    try {
      const params: any = {
        page,
        limit: perPage,
      };

      // Add filters to params
      if (filters?.status) {
        params.status = filters.status;
      }
      if (filters?.route_id) {
        params.route_id = filters.route_id;
      }
      if (filters?.driver_id) {
        params.driver_id = filters.driver_id;
      }
      if (filters?.search) {
        params.search = filters.search;
      }

      const response = await api.get('/admin/buses', { params });
      const backendData = response.data.data || response.data;

      // Handle Laravel pagination response format
      if (backendData.data && Array.isArray(backendData.data)) {
        // Laravel paginated response
        const buses = backendData.data.map((bus: any) => this.mapBackendBusToFrontend(bus));
        
        return {
          buses,
          total: backendData.total || 0,
          current_page: backendData.current_page || page,
          per_page: backendData.per_page || perPage,
          last_page: backendData.last_page || 1,
        };
      } else if (Array.isArray(backendData)) {
        // Simple array response
        const buses = backendData.map((bus: any) => this.mapBackendBusToFrontend(bus));
        
        return {
          buses,
          total: buses.length,
          current_page: page,
          per_page: perPage,
          last_page: Math.ceil(buses.length / perPage) || 1,
        };
      }

      return {
        buses: [],
        total: 0,
        current_page: page,
        per_page: perPage,
        last_page: 1,
      };
    } catch (error: any) {
      console.error('❌ Failed to fetch buses from backend:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch buses');
    }
  }

  // Map backend bus data to frontend Bus interface
  private mapBackendBusToFrontend(bus: any): Bus {
    return {
      id: bus.id,
      bus_number: bus.bus_number,
      license_plate: bus.license_plate,
      bus_type: bus.bus_type || 'standard',
      capacity: bus.capacity,
      status: bus.status || 'active',
      route_id: bus.current_route_id || bus.route_id,
      route_name: bus.current_route?.name || bus.route_name || null,
      driver_id: bus.current_driver_id || bus.driver_id,
      driver_name: bus.current_driver?.name || bus.driver_name || null,
      current_latitude: bus.locations?.[0]?.latitude || bus.current_latitude || null,
      current_longitude: bus.locations?.[0]?.longitude || bus.current_longitude || null,
      last_location_update: bus.locations?.[0]?.recorded_at || bus.last_location_update || null,
      created_at: bus.created_at,
      updated_at: bus.updated_at,
    };
  }

  // Get buses directly from Supabase - DEPRECATED, use getBuses() instead
  async getBusesFromSupabase(filters?: BusFilters): Promise<Bus[] | null> {
    try {
      console.log('🔍 getBusesFromSupabase called with filters:', filters);
      
      // Check authentication first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('⚠️ Session error:', sessionError);
      }
      console.log('🔐 Session status:', session ? `Authenticated (${session.user.id})` : 'Not authenticated');
      
      // Check if user is admin (for RLS)
      if (session) {
        const { data: adminProfile, error: adminError } = await supabase
          .from('admin_profiles')
          .select('id, role')
          .eq('id', session.user.id)
          .maybeSingle();
        if (adminError && adminError.code !== 'PGRST116') {
          console.warn('⚠️ Error checking admin profile:', adminError);
        }
        console.log('👤 Admin profile check:', adminProfile ? `Admin (${adminProfile.role})` : 'Not an admin');
      }
      
      // Use simple query (more reliable with RLS, then fetch related data separately)
      let query = supabase
        .from('buses')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        const statusValue = filters.status.toLowerCase().trim();
        // Try exact match first
        query = query.eq('status', statusValue);
        console.log('✅ Applied status filter to Supabase query:', statusValue);
        console.log('🔍 Filtering for status exactly:', statusValue);
      } else {
        console.log('ℹ️ No status filter applied - fetching all buses');
      }

      if (filters?.route_id) {
        query = query.eq('route_id', filters.route_id);
        console.log('✅ Applied route filter:', filters.route_id);
      }

      if (filters?.driver_id) {
        query = query.eq('driver_id', filters.driver_id);
        console.log('✅ Applied driver filter:', filters.driver_id);
      }

      if (filters?.search) {
        query = query.or(`bus_number.ilike.%${filters.search}%,license_plate.ilike.%${filters.search}%`);
        console.log('✅ Applied search filter:', filters.search);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase error fetching buses:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // If it's an RLS error, try to provide helpful message
        if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('policy')) {
          console.error('🚫 RLS Policy Error: User may not have permission to view buses');
          console.error('💡 Solution: Ensure user is logged in and has admin profile in admin_profiles table');
        }
        
        return null;
      }

      const buses = data || [];
      console.log(`✅ Supabase returned ${buses.length} buses`);
      
      if (buses.length > 0) {
        console.log('Sample buses:', buses.slice(0, 3).map((b: any) => ({ 
        id: b.id, 
        bus_number: b.bus_number, 
        status: b.status,
        route_id: b.route_id 
      })));
      } else {
        console.log('⚠️ Supabase returned 0 buses');
        console.log('🔍 Checking if this is due to RLS or no data...');
        
        // DEBUG: Try fetching ALL buses without filter to see if RLS is the issue
        const { data: allBuses, error: allBusesError } = await supabase
          .from('buses')
          .select('id, bus_number, status')
          .limit(10);
        
        if (allBusesError) {
          console.error('❌ Error fetching all buses (RLS might be blocking):', allBusesError);
        } else {
          console.log(`📊 Total buses accessible (no filter): ${allBuses?.length || 0}`);
          if (allBuses && allBuses.length > 0) {
            console.log('Sample accessible buses:', allBuses.slice(0, 3));
            console.log('⚠️ RLS allows access to buses, but filter might be too restrictive');
            
            // If we have a status filter and got 0 results, try without filter
            if (filters?.status) {
              console.log(`🔍 Filter "${filters.status}" returned 0 results, but ${allBuses.length} buses exist`);
              console.log('💡 This suggests the status filter is not matching any buses');
            }
          }
        }
      }

      // OPTIMIZED: Batch fetch all route and driver names in parallel (much faster!)
      const uniqueRouteIds = [...new Set(buses.filter(b => b.route_id).map(b => b.route_id))];
      const uniqueDriverIds = [...new Set(buses.filter(b => b.driver_id).map(b => b.driver_id))];
      
      // Fetch all routes and drivers in parallel (2 queries instead of N*2 queries)
      const [routesResult, driversResult] = await Promise.all([
        uniqueRouteIds.length > 0 
          ? supabase.from('routes').select('id, name').in('id', uniqueRouteIds)
          : Promise.resolve({ data: [], error: null }),
        uniqueDriverIds.length > 0
          ? supabase.from('drivers').select('id, name').in('id', uniqueDriverIds)
          : Promise.resolve({ data: [], error: null })
      ]);
      
      // Create lookup maps for O(1) access
      const routeMap = new Map((routesResult.data || []).map(r => [r.id, r.name]));
      const driverMap = new Map((driversResult.data || []).map(d => [d.id, d.name]));
      
      // Map buses with route and driver names (fast lookup)
      const busesWithDetails = buses.map((bus: any) => ({
        ...bus,
        route_name: bus.route_id ? (routeMap.get(bus.route_id) || null) : null,
        driver_name: bus.driver_id ? (driverMap.get(bus.driver_id) || null) : null,
      }));

      // Map Supabase data to Bus interface
      const mappedBuses: Bus[] = busesWithDetails.map((bus: any): Bus => ({
        id: bus.id,
        bus_number: bus.bus_number,
        license_plate: bus.license_plate,
        bus_type: 'standard' as 'standard' | 'premium' | 'luxury', // Default since Supabase doesn't have this field
        capacity: bus.capacity,
        status: bus.status as 'active' | 'inactive' | 'maintenance' | 'emergency',
        route_id: bus.route_id,
        route_name: bus.route_name || null,
        driver_id: bus.driver_id,
        driver_name: bus.driver_name || null,
        current_latitude: bus.current_latitude,
        current_longitude: bus.current_longitude,
        created_at: bus.created_at,
        updated_at: bus.updated_at,
      }));
      
      console.log(`✅ Mapped ${mappedBuses.length} buses from Supabase (fast batch query)`);
      return mappedBuses;
    } catch (error) {
      console.error('❌ Failed to fetch buses from Supabase:', error);
      return null; // Return null - Supabase is primary source, no API fallback
    }
  }

  // Get single bus by ID - Use Laravel backend API only
  async getBusById(busId: string): Promise<Bus> {
    try {
      console.log('🔍 Fetching bus by ID:', busId);
      
      // Try the standard REST endpoint first (from apiResource)
      let response;
      try {
        response = await api.get(`/admin/buses/${busId}`);
      } catch (firstError: any) {
        // If 404, try the /view endpoint
        if (firstError.response?.status === 404) {
          console.log('⚠️ Standard endpoint returned 404, trying /view endpoint...');
          response = await api.get(`/admin/buses/${busId}/view`);
        } else {
          throw firstError;
        }
      }
      
      const backendBus = response.data.data || response.data;
      
      if (!backendBus) {
        throw new Error('Bus not found');
      }

      console.log('✅ Bus fetched successfully:', backendBus);
      return this.mapBackendBusToFrontend(backendBus);
    } catch (error: any) {
      console.error('❌ Failed to fetch bus:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch bus details';
      throw new Error(errorMessage);
    }
  }

  // Get bus by ID directly from Supabase - DEPRECATED, use getBusById() instead
  async getBusByIdFromSupabase(busId: string): Promise<Bus | null> {
    try {
      console.log('🔍 Fetching bus by ID from Supabase:', busId);
      
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No session found');
      }

      // Fetch bus from Supabase
      const { data: bus, error } = await supabase
        .from('buses')
        .select('*')
        .eq('id', busId)
        .single();

      if (error) {
        console.error('❌ Supabase error fetching bus:', error);
        if (error.code === 'PGRST116') {
          throw new Error('Bus not found');
        }
        throw new Error(error.message || 'Failed to fetch bus');
      }

      if (!bus) {
        console.warn('⚠️ Bus not found in Supabase');
        return null;
      }

      // Fetch route and driver names if they exist
      let routeName = null;
      let driverName = null;

      if (bus.route_id) {
        const { data: routeData } = await supabase
          .from('routes')
          .select('name')
          .eq('id', bus.route_id)
          .maybeSingle();
        routeName = routeData?.name || null;
      }

      if (bus.driver_id) {
        const { data: driverData } = await supabase
          .from('drivers')
          .select('name')
          .eq('id', bus.driver_id)
          .maybeSingle();
        driverName = driverData?.name || null;
      }

      // Map to Bus interface
      const mappedBus: Bus = {
        id: bus.id,
        bus_number: bus.bus_number,
        license_plate: bus.license_plate,
        bus_type: 'standard' as 'standard' | 'premium' | 'luxury',
        capacity: bus.capacity,
        status: bus.status as 'active' | 'inactive' | 'maintenance' | 'emergency',
        route_id: bus.route_id,
        route_name: routeName,
        driver_id: bus.driver_id,
        driver_name: driverName,
        current_latitude: bus.current_latitude,
        current_longitude: bus.current_longitude,
        last_location_update: bus.last_location_update,
        created_at: bus.created_at,
        updated_at: bus.updated_at,
      };

      console.log('✅ Bus mapped successfully:', mappedBus.bus_number);
      return mappedBus;
    } catch (error: any) {
      console.error('❌ Failed to fetch bus from Supabase:', error);
      throw error;
    }
  }

  // Create new bus - Use Laravel backend API only
  async createBus(busData: Partial<Bus>): Promise<Bus> {
    try {
      // Map frontend Bus interface to backend format
      const backendData: any = {
        bus_number: busData.bus_number?.trim(),
        license_plate: busData.license_plate?.trim(),
        bus_type: busData.bus_type || 'standard',
        capacity: busData.capacity || 50,
        status: busData.status || 'active',
      };

      // Add route and driver only if provided
      if (busData.route_id && busData.route_id !== '') {
        backendData.current_route_id = busData.route_id;
      }
      
      if (busData.driver_id && busData.driver_id !== '') {
        backendData.current_driver_id = busData.driver_id;
      }

      console.log('🚌 Creating bus with data:', backendData);
      console.log('🔗 API URL:', api.defaults.baseURL);
      console.log('🔑 Auth token present:', !!localStorage.getItem('laravel_token'));

      const response = await api.post('/admin/buses', backendData);
      const backendBus = response.data.data || response.data;
      
      if (!backendBus) {
        throw new Error('Bus creation succeeded but no data returned');
      }
      
      console.log('✅ Bus created successfully:', backendBus);
      return this.mapBackendBusToFrontend(backendBus);
    } catch (error: any) {
      console.error('❌ Failed to create bus:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to create bus';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors
        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages) ? messages[0] : messages;
              return `${field}: ${msg}`;
            })
            .join(', ');
          errorMessage = validationErrors;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Create bus directly in Supabase - DEPRECATED, use createBus() instead
  async createBusInSupabase(busData: Partial<Bus>): Promise<Bus | null> {
    try {
      // Check if user is authenticated before making request
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('❌ No active session found:', sessionError);
        throw new Error('You must be logged in to create buses. Please sign in and try again.');
      }
      
      console.log('✅ Active session found, user ID:', session.user.id);
      
      // Validate required fields
      if (!busData.bus_number || !busData.license_plate) {
        throw new Error('Bus number and license plate are required');
      }

      // Map the data to Supabase schema
      const supabaseData: any = {
        bus_number: busData.bus_number.trim(),
        license_plate: busData.license_plate.trim(),
        capacity: busData.capacity || 50,
        status: busData.status || 'active',
      };

      // Add route_id only if provided and not empty
      if (busData.route_id && (typeof busData.route_id === 'string' ? busData.route_id.trim() !== '' : true)) {
        supabaseData.route_id = busData.route_id;
      }

      // Add driver_id only if provided and not empty
      if (busData.driver_id && (typeof busData.driver_id === 'string' ? busData.driver_id.trim() !== '' : true)) {
        supabaseData.driver_id = busData.driver_id;
      }

      // Initialize location tracking fields (optional, can be null)
      // These will be updated when the bus starts moving

      console.log('🚌 Inserting bus into Supabase:', supabaseData);

      const { data, error } = await supabase
        .from('buses')
        .insert(supabaseData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        
        // Provide user-friendly error messages
        if (error.code === '23505') {
          // Unique constraint violation
          if (error.message.includes('bus_number') || error.details?.includes('bus_number')) {
            throw new Error('A bus with this bus number already exists. Please use a different bus number.');
          }
          if (error.message.includes('license_plate') || error.details?.includes('license_plate')) {
            throw new Error('A bus with this license plate already exists. Please use a different license plate.');
          }
          throw new Error('A bus with these details already exists in the database.');
        }
        
        if (error.code === '23503') {
          // Foreign key violation
          if (error.message.includes('route_id')) {
            throw new Error('The selected route does not exist. Please select a valid route.');
          }
          if (error.message.includes('driver_id')) {
            throw new Error('The selected driver does not exist. Please select a valid driver.');
          }
        }
        
        throw new Error(error.message || 'Failed to create bus in database');
      }

      if (!data) {
        throw new Error('Bus was created but no data was returned');
      }

      console.log('✅ Bus successfully created in Supabase:', data);

      // Map Supabase response to Bus interface
      const bus: Bus = {
        id: data.id,
        bus_number: data.bus_number,
        license_plate: data.license_plate,
        bus_type: 'standard', // Default since Supabase schema doesn't have this
        capacity: data.capacity,
        status: data.status as any,
        route_id: data.route_id,
        driver_id: data.driver_id,
        current_latitude: data.current_latitude,
        current_longitude: data.current_longitude,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return bus;
    } catch (error: any) {
      console.error('❌ Failed to create bus in Supabase:', error);
      throw error;
    }
  }

  // Update bus - Use Laravel backend API only
  async updateBus(busId: string, busData: Partial<Bus>): Promise<Bus> {
    try {
      // Map Bus interface to backend format
      const backendData: any = {
        bus_number: busData.bus_number,
        license_plate: busData.license_plate,
        bus_type: busData.bus_type,
        capacity: busData.capacity,
        status: busData.status,
      };

      // Add route and driver only if provided
      if (busData.route_id && busData.route_id !== '') {
        backendData.current_route_id = busData.route_id;
      } else {
        backendData.current_route_id = null;
      }
      
      if (busData.driver_id && busData.driver_id !== '') {
        backendData.current_driver_id = busData.driver_id;
      } else {
        backendData.current_driver_id = null;
      }

      // Remove undefined fields
      Object.keys(backendData).forEach(key => {
        if (backendData[key] === undefined) {
          delete backendData[key];
        }
      });

      // Use standard REST PUT endpoint
      const response = await api.put(`/admin/buses/${busId}`, backendData);
      const backendBus = response.data.data || response.data;
      
      return this.mapBackendBusToFrontend(backendBus);
    } catch (error: any) {
      console.error('❌ Failed to update bus:', error);
      throw new Error(error.response?.data?.message || 'Failed to update bus');
    }
  }

  // Update bus directly in Supabase - DEPRECATED, use updateBus() instead
  async updateBusInSupabase(busId: string, busData: Partial<Bus>): Promise<Bus | null> {
    try {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('❌ No active session found:', sessionError);
        throw new Error('You must be logged in to update buses. Please sign in and try again.');
      }
      
      console.log('✅ Active session found, updating bus:', busId);

      // Map the data to Supabase schema
      const supabaseData: any = {};

      if (busData.bus_number !== undefined) {
        supabaseData.bus_number = busData.bus_number.trim();
      }
      if (busData.license_plate !== undefined) {
        supabaseData.license_plate = busData.license_plate.trim();
      }
      if (busData.capacity !== undefined) {
        supabaseData.capacity = busData.capacity;
      }
      if (busData.status !== undefined) {
        supabaseData.status = busData.status;
      }
      if (busData.route_id !== undefined) {
        supabaseData.route_id = busData.route_id || null;
      }
      if (busData.driver_id !== undefined) {
        supabaseData.driver_id = busData.driver_id || null;
      }

      console.log('🚌 Updating bus in Supabase:', { busId, supabaseData });

      const { data, error } = await supabase
        .from('buses')
        .update(supabaseData)
        .eq('id', busId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        
        if (error.code === '23505') {
          if (error.message.includes('bus_number')) {
            throw new Error('A bus with this bus number already exists.');
          }
          if (error.message.includes('license_plate')) {
            throw new Error('A bus with this license plate already exists.');
          }
          throw new Error('A bus with these details already exists.');
        }
        
        if (error.code === '23503') {
          if (error.message.includes('route_id')) {
            throw new Error('The selected route does not exist.');
          }
          if (error.message.includes('driver_id')) {
            throw new Error('The selected driver does not exist.');
          }
        }
        
        throw new Error(error.message || 'Failed to update bus in database');
      }

      if (!data) {
        throw new Error('Bus was updated but no data was returned');
      }

      console.log('✅ Bus successfully updated in Supabase:', data);

      // Fetch route and driver names if they exist
      let routeName = null;
      let driverName = null;

      if (data.route_id) {
        const { data: routeData } = await supabase
          .from('routes')
          .select('name')
          .eq('id', data.route_id)
          .maybeSingle();
        routeName = routeData?.name || null;
      }

      if (data.driver_id) {
        const { data: driverData } = await supabase
          .from('drivers')
          .select('name')
          .eq('id', data.driver_id)
          .maybeSingle();
        driverName = driverData?.name || null;
      }

      // Map Supabase response to Bus interface
      const bus: Bus = {
        id: data.id,
        bus_number: data.bus_number,
        license_plate: data.license_plate,
        bus_type: 'standard',
        capacity: data.capacity,
        status: data.status as any,
        route_id: data.route_id,
        route_name: routeName,
        driver_id: data.driver_id,
        driver_name: driverName,
        current_latitude: data.current_latitude,
        current_longitude: data.current_longitude,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return bus;
    } catch (error: any) {
      console.error('❌ Failed to update bus in Supabase:', error);
      throw error;
    }
  }

  // Delete/Deactivate bus - Use Laravel backend API only
  async deleteBus(busId: string): Promise<void> {
    try {
      await api.delete(`/admin/buses/${busId}/delete`);
    } catch (error: any) {
      console.error('❌ Failed to delete bus:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete bus');
    }
  }

  // Delete bus directly from Supabase - DEPRECATED, use deleteBus() instead
  async deleteBusFromSupabase(busId: string): Promise<void> {
    try {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('❌ No active session found:', sessionError);
        throw new Error('You must be logged in to delete buses. Please sign in and try again.');
      }
      
      console.log('✅ Active session found, deleting bus:', busId);

      // Delete bus from Supabase
      const { error } = await supabase
        .from('buses')
        .delete()
        .eq('id', busId);

      if (error) {
        console.error('❌ Supabase error deleting bus:', error);
        
        if (error.code === '23503') {
          throw new Error('Cannot delete bus: It is referenced by other records (e.g., trips, assignments).');
        }
        
        throw new Error(error.message || 'Failed to delete bus from database');
      }

      console.log('✅ Bus successfully deleted from Supabase');
    } catch (error: any) {
      console.error('❌ Failed to delete bus from Supabase:', error);
      throw error;
    }
  }

  // Get bus location
  async getBusLocation(busId: string): Promise<{ latitude: number; longitude: number; recorded_at: string }> {
    try {
      const response = await api.get(`/admin/buses/${busId}/location`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        throw new Error('Backend unavailable');
      }
      throw error;
    }
  }

  // Get bus history
  async getBusHistory(
    busId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get(`/admin/buses/${busId}/history`, { params });
      return response.data.data || response.data || [];
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return [];
      }
      return [];
    }
  }

  // Update bus status
  async updateBusStatus(
    busId: string,
    status: 'active' | 'inactive' | 'maintenance' | 'emergency'
  ): Promise<Bus> {
    try {
      const response = await api.patch(`/admin/buses/${busId}/status`, { status });
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update bus status');
    }
  }

  // Get bus location history
  async getBusLocationHistory(
    busId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get(`/admin/buses/${busId}/location-history`, { params });
      return response.data.data || response.data || [];
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return [];
      }
      return [];
    }
  }

  // Get bus trip history
  async getBusTripHistory(
    busId: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<any> {
    try {
      const response = await api.get(`/admin/buses/${busId}/trips`, {
        params: { page, per_page: perPage },
      });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return { trips: [], total: 0 };
      }
      return { trips: [], total: 0 };
    }
  }
}

// Export the service instance as default
const busServiceInstance = new BusService();
export default busServiceInstance;

// Also export the class for advanced use cases
export { BusService };
