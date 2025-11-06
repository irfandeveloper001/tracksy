import api from './client';

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
  // Get all buses with filters and pagination
  async getBuses(
    page: number = 1,
    perPage: number = 20,
    filters?: BusFilters
  ): Promise<BusListResponse> {
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

  // Create new bus
  async createBus(busData: Partial<Bus>): Promise<Bus> {
    try {
      const response = await api.post('/admin/buses', busData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create bus');
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
