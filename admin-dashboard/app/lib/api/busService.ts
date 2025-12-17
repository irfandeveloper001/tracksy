import api from './client';
import { supabase } from '../config/supabase';

export interface Bus {
  id: string;
  bus_number: string;
  license_plate: string;
  bus_type: 'standard' | 'premium' | 'luxury';
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance' | 'emergency';
  route_id?: string;
  route_name?: string;
  driver_id?: string;
  driver_name?: string;
  current_latitude?: number;
  current_longitude?: number;
  last_location_update?: string;
  created_at: string;
  updated_at: string;
}

export interface BusFilters {
  status?: string;
  route_id?: string;
  driver_id?: string;
  search?: string;
}

export interface BusListResponse {
  buses: Bus[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

class BusService {
  // Get all buses with filters and pagination - Try Supabase first, fallback to API
  async getBuses(
    page: number = 1,
    perPage: number = 20,
    filters?: BusFilters
  ): Promise<BusListResponse> {
    try {
      // Try Supabase first
      const supabaseBuses = await this.getBusesFromSupabase(filters);
      if (supabaseBuses && supabaseBuses.length > 0) {
        // Apply pagination
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginatedBuses = supabaseBuses.slice(start, end);
        
        return {
          buses: paginatedBuses,
          total: supabaseBuses.length,
          current_page: page,
          per_page: perPage,
          last_page: Math.ceil(supabaseBuses.length / perPage),
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

      const response = await api.get('/admin/buses', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning empty buses list');
        return {
          buses: [],
          total: 0,
          current_page: 1,
          per_page: perPage,
          last_page: 1,
        };
      }
      throw error;
    }
  }

  // Get buses directly from Supabase
  async getBusesFromSupabase(filters?: BusFilters): Promise<Bus[]> {
    try {
      let query = supabase
        .from('buses')
        .select('*, routes(id, name), drivers(id, name, license_number)')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.route_id) {
        query = query.eq('route_id', filters.route_id);
      }

      if (filters?.driver_id) {
        query = query.eq('driver_id', filters.driver_id);
      }

      if (filters?.search) {
        query = query.or(`bus_number.ilike.%${filters.search}%,license_plate.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase error fetching buses:', error);
        throw error;
      }

      // Map Supabase data to Bus interface
      return (data || []).map((bus: any) => ({
        id: bus.id,
        bus_number: bus.bus_number,
        license_plate: bus.license_plate,
        bus_type: 'standard', // Default since Supabase doesn't have this field
        capacity: bus.capacity,
        status: bus.status as any,
        route_id: bus.route_id,
        route_name: bus.routes?.name,
        driver_id: bus.driver_id,
        driver_name: bus.drivers?.name,
        current_latitude: bus.current_latitude,
        current_longitude: bus.current_longitude,
        created_at: bus.created_at,
        updated_at: bus.updated_at,
      }));
    } catch (error) {
      console.error('❌ Failed to fetch buses from Supabase:', error);
      return [];
    }
  }

  // Get single bus by ID
  async getBusById(busId: string): Promise<Bus> {
    try {
      const response = await api.get(`/admin/buses/${busId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        throw new Error('Backend unavailable');
      }
      throw error;
    }
  }

  // Create new bus - Try Supabase first, fallback to API
  async createBus(busData: Partial<Bus>): Promise<Bus> {
    try {
      // First, try to create in Supabase directly
      const supabaseBus = await this.createBusInSupabase(busData);
      if (supabaseBus) {
        console.log('✅ Bus created in Supabase:', supabaseBus);
        return supabaseBus;
      }
    } catch (supabaseError: any) {
      console.warn('⚠️ Supabase creation failed, trying API:', supabaseError);
    }

    // Fallback to API if Supabase fails
    try {
      const response = await api.post('/admin/buses', busData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create bus');
    }
  }

  // Create bus directly in Supabase
  async createBusInSupabase(busData: Partial<Bus>): Promise<Bus | null> {
    try {
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

  // Update bus
  async updateBus(busId: string, busData: Partial<Bus>): Promise<Bus> {
    try {
      const response = await api.put(`/admin/buses/${busId}`, busData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update bus');
    }
  }

  // Delete/Deactivate bus
  async deleteBus(busId: string): Promise<void> {
    try {
      await api.delete(`/admin/buses/${busId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete bus');
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

export default new BusService();
