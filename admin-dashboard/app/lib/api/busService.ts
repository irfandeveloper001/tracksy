import api from './client';
import { supabase } from '../config/supabase';
// Import types from centralized types file to avoid Vite HMR cache issues
import type { Bus, BusFilters, BusListResponse } from './types';

// Re-export types for backward compatibility
export type { Bus, BusFilters, BusListResponse };

class BusService {
  // Get all buses with filters and pagination - ALWAYS use Supabase first (primary source)
  async getBuses(
    page: number = 1,
    perPage: number = 20,
    filters?: BusFilters
  ): Promise<BusListResponse> {
    try {
      // PRIMARY: Always try Supabase first - this is our main data source
      const supabaseBuses = await this.getBusesFromSupabase(filters);
      
      if (supabaseBuses !== null && supabaseBuses !== undefined) {
        // Apply pagination
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginatedBuses = supabaseBuses.slice(start, end);
        
        console.log(`✅ Returning ${supabaseBuses.length} buses from Supabase (showing ${paginatedBuses.length} on page ${page})`);
        console.log(`📊 Filter applied:`, filters);
        if (supabaseBuses.length > 0) {
          console.log(`📋 Bus statuses in result:`, [...new Set(supabaseBuses.map(b => b.status))]);
        }
        
        // FALLBACK: If we got 0 buses with a status filter, try fetching all and filtering in memory
        // This matches how the dashboard works and handles RLS edge cases
        if (supabaseBuses.length === 0 && filters?.status) {
          console.log('⚠️ Got 0 buses with status filter, trying fallback: fetch all buses and filter in memory...');
          const allBuses = await this.getBusesFromSupabase({ ...filters, status: undefined });
          if (allBuses && allBuses.length > 0) {
            const statusValue = filters.status.toLowerCase().trim();
            const filteredBuses = allBuses.filter(b => {
              const busStatus = b.status?.toLowerCase().trim();
              return busStatus === statusValue;
            });
            console.log(`✅ Fallback: Found ${filteredBuses.length} buses after in-memory filtering (from ${allBuses.length} total)`);
            
            if (filteredBuses.length > 0) {
              const fallbackStart = (page - 1) * perPage;
              const fallbackEnd = fallbackStart + perPage;
              const paginatedFiltered = filteredBuses.slice(fallbackStart, fallbackEnd);
              
              return {
                buses: paginatedFiltered,
                total: filteredBuses.length,
                current_page: page,
                per_page: perPage,
                last_page: Math.ceil(filteredBuses.length / perPage) || 1,
              };
            }
          }
        }
        
        return {
          buses: paginatedBuses,
          total: supabaseBuses.length,
          current_page: page,
          per_page: perPage,
          last_page: Math.ceil(supabaseBuses.length / perPage) || 1,
        };
      }
      
      // If Supabase returns null, it means there was an error - log it but don't fallback
      console.warn('⚠️ Supabase returned null - check RLS policies and authentication');
      return {
        buses: [],
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
        buses: [],
        total: 0,
        current_page: page,
        per_page: perPage,
        last_page: 1,
      };
    }
  }

  // Get buses directly from Supabase
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

  // Get single bus by ID - Try backend API first, fallback to Supabase
  async getBusById(busId: string): Promise<Bus> {
    try {
      // PRIMARY: Try backend API first
      try {
        console.log(`🔍 Fetching bus from backend API: GET /admin/buses/${busId}/view`);
        const response = await api.get(`/admin/buses/${busId}/view`);
        if (response.data?.success && response.data?.data) {
          const backendBus = response.data.data;
          // Map backend response to Bus interface
          const mappedBus: Bus = {
            id: backendBus.id,
            bus_number: backendBus.bus_number,
            license_plate: backendBus.license_plate,
            bus_type: backendBus.bus_type || 'standard',
            capacity: backendBus.capacity,
            status: backendBus.status || 'active',
            route_id: backendBus.current_route_id,
            route_name: backendBus.current_route?.name || null,
            driver_id: backendBus.current_driver_id,
            driver_name: backendBus.current_driver?.name || null,
            current_latitude: backendBus.locations?.[0]?.latitude || null,
            current_longitude: backendBus.locations?.[0]?.longitude || null,
            last_location_update: backendBus.locations?.[0]?.recorded_at || null,
            created_at: backendBus.created_at,
            updated_at: backendBus.updated_at,
          };
          console.log('✅ Bus fetched from backend API:', mappedBus.bus_number);
          return mappedBus;
        }
      } catch (backendError: any) {
        console.warn('⚠️ Backend API unavailable, falling back to Supabase:', backendError.message);
      }

      // FALLBACK: Fetch from Supabase directly
      const bus = await this.getBusByIdFromSupabase(busId);
      if (bus) {
        console.log('✅ Bus fetched from Supabase:', bus.bus_number);
        return bus;
      }
      throw new Error('Bus not found');
    } catch (error: any) {
      console.error('❌ Failed to fetch bus:', error);
      throw new Error(error.message || 'Failed to fetch bus details');
    }
  }

  // Get bus by ID directly from Supabase
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

  // Create new bus - ALWAYS use Supabase (primary database)
  async createBus(busData: Partial<Bus>): Promise<Bus> {
    try {
      // PRIMARY: Always create in Supabase first - this is our main database
      const supabaseBus = await this.createBusInSupabase(busData);
      if (supabaseBus) {
        console.log('✅ Bus created in Supabase database:', supabaseBus);
        console.log('💾 Data is now stored in Supabase and will be fetched directly from there');
        return supabaseBus;
      }
      throw new Error('Bus creation returned null');
    } catch (supabaseError: any) {
      console.error('❌ Supabase creation failed:', supabaseError);
      // Don't fallback to API - Supabase is our source of truth
      throw new Error(supabaseError.message || 'Failed to create bus in database. Please check your connection and try again.');
    }
  }

  // Create bus directly in Supabase
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

  // Update bus - ALWAYS use Supabase (primary database)
  async updateBus(busId: string, busData: Partial<Bus>): Promise<Bus> {
    try {
      // PRIMARY: Try backend API first
      try {
        // Map Bus interface to backend format
        const backendData: any = {
          bus_number: busData.bus_number,
          license_plate: busData.license_plate,
          bus_type: busData.bus_type,
          capacity: busData.capacity,
          status: busData.status,
          current_route_id: busData.route_id || null,
          current_driver_id: busData.driver_id || null,
        };

        console.log(`🔍 Updating bus via backend API: PUT /admin/buses/${busId}/edit`, backendData);
        const response = await api.put(`/admin/buses/${busId}/edit`, backendData);
        if (response.data?.success && response.data?.data) {
          const backendBus = response.data.data;
          // Map backend response to Bus interface
          const mappedBus: Bus = {
            id: backendBus.id,
            bus_number: backendBus.bus_number,
            license_plate: backendBus.license_plate,
            bus_type: backendBus.bus_type || 'standard',
            capacity: backendBus.capacity,
            status: backendBus.status || 'active',
            route_id: backendBus.current_route_id,
            route_name: backendBus.current_route?.name || null,
            driver_id: backendBus.current_driver_id,
            driver_name: backendBus.current_driver?.name || null,
            current_latitude: backendBus.locations?.[0]?.latitude || null,
            current_longitude: backendBus.locations?.[0]?.longitude || null,
            last_location_update: backendBus.locations?.[0]?.recorded_at || null,
            created_at: backendBus.created_at,
            updated_at: backendBus.updated_at,
          };
          console.log('✅ Bus updated via backend API:', mappedBus.bus_number);
          return mappedBus;
        }
      } catch (backendError: any) {
        console.warn('⚠️ Backend API unavailable, falling back to Supabase:', backendError.message);
      }

      // FALLBACK: Update in Supabase
      const updatedBus = await this.updateBusInSupabase(busId, busData);
      if (updatedBus) {
        console.log('✅ Bus updated in Supabase database:', updatedBus);
        return updatedBus;
      }
      throw new Error('Bus update returned null');
    } catch (error: any) {
      console.error('❌ Failed to update bus:', error);
      throw new Error(error.message || 'Failed to update bus in database. Please check your connection and try again.');
    }
  }

  // Update bus directly in Supabase
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

  // Delete/Deactivate bus - ALWAYS use Supabase (primary database)
  async deleteBus(busId: string): Promise<void> {
    try {
      // PRIMARY: Try backend API first
      try {
        console.log(`🔍 Deleting bus via backend API: DELETE /admin/buses/${busId}/delete`);
        const response = await api.delete(`/admin/buses/${busId}/delete`);
        if (response.data?.success) {
          console.log('✅ Bus deleted via backend API:', busId);
          return;
        }
      } catch (backendError: any) {
        console.warn('⚠️ Backend API unavailable, falling back to Supabase:', backendError.message);
      }

      // FALLBACK: Delete from Supabase
      await this.deleteBusFromSupabase(busId);
      console.log('✅ Bus deleted from Supabase database:', busId);
    } catch (error: any) {
      console.error('❌ Failed to delete bus:', error);
      throw new Error(error.message || 'Failed to delete bus. Please check your connection and try again.');
    }
  }

  // Delete bus directly from Supabase
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
