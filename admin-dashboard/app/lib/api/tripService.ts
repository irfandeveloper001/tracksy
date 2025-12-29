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
  private normalizeStatus(status?: string): Trip['status'] {
    if (status === 'not_started') return 'scheduled';
    if (status === 'in_progress' || status === 'completed' || status === 'cancelled') {
      return status;
    }
    return 'scheduled';
  }

  private formatLocation(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.latitude && value.longitude) {
      return `${value.latitude}, ${value.longitude}`;
    }
    return undefined;
  }

  private normalizeTrip(trip: any): Trip {
    return {
      id: trip?.id?.toString() || '',
      route_id: trip?.route_id?.toString() || trip?.route?.id?.toString() || '',
      route_name: trip?.route?.name || trip?.route_name || '',
      bus_id: trip?.bus_id?.toString() || trip?.bus?.id?.toString() || '',
      bus_number: trip?.bus?.number || trip?.bus_number || '',
      driver_id: trip?.driver_id?.toString() || trip?.driver?.id?.toString() || '',
      driver_name: trip?.driver?.name || trip?.driver_name || '',
      start_time: trip?.start_time || '',
      end_time: trip?.end_time || '',
      status: this.normalizeStatus(trip?.status),
      student_count:
        trip?.student_count ??
        trip?.passenger_count ??
        trip?.bookings_count ??
        0,
      duration: trip?.duration ?? undefined,
      start_location: this.formatLocation(trip?.start_location),
      end_location: this.formatLocation(trip?.end_location),
      created_at: trip?.created_at || '',
      updated_at: trip?.updated_at || '',
    };
  }

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
      const payload = response.data?.data ?? response.data;

      if (payload && Array.isArray(payload.data)) {
        const trips = payload.data.map((trip: any) => this.normalizeTrip(trip));
        return {
          trips,
          total: payload.total || trips.length,
          current_page: payload.current_page || page,
          per_page: payload.per_page || perPage,
          last_page: payload.last_page || 1,
        };
      }

      if (Array.isArray(payload)) {
        const trips = payload.map((trip: any) => this.normalizeTrip(trip));
        return {
          trips,
          total: trips.length,
          current_page: page,
          per_page: perPage,
          last_page: Math.ceil(trips.length / perPage) || 1,
        };
      }

      return {
        trips: [],
        total: 0,
        current_page: page,
        per_page: perPage,
        last_page: 1,
      };
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
      const payload = response.data?.data ?? response.data;
      return this.normalizeTrip(payload?.data ?? payload);
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
