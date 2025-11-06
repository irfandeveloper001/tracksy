import api from './client';

export interface Trip {
  id: string;
  route_id: string;
  route_name?: string;
  bus_id: string;
  bus_number?: string;
  driver_id: string;
  driver_name?: string;
  start_time: string;
  end_time?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  student_count: number;
  duration?: number; // in minutes
  start_location?: string;
  end_location?: string;
  created_at: string;
  updated_at: string;
}

export interface TripFilters {
  status?: string;
  route_id?: string;
  bus_id?: string;
  driver_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface TripListResponse {
  trips: Trip[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

class TripService {
  // Get all trips with filters and pagination
  async getTrips(
    page: number = 1,
    perPage: number = 20,
    filters?: TripFilters
  ): Promise<TripListResponse> {
    try {
      const params: any = {
        page,
        per_page: perPage,
        ...filters,
      };

      const response = await api.get('/admin/trips', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning empty trips list');
        return {
          trips: [],
          total: 0,
          current_page: 1,
          per_page: perPage,
          last_page: 1,
        };
      }
      throw error;
    }
  }

  // Get single trip by ID
  async getTripById(tripId: string): Promise<Trip> {
    try {
      const response = await api.get(`/admin/trips/${tripId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        throw new Error('Backend unavailable');
      }
      throw error;
    }
  }

  // Get trip analytics
  async getTripAnalytics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/admin/trips/analytics', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return {};
      }
      return {};
    }
  }

  // Cancel trip
  async cancelTrip(tripId: string, reason?: string): Promise<void> {
    try {
      await api.post(`/admin/trips/${tripId}/cancel`, { reason });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel trip');
    }
  }
}

export default new TripService();

