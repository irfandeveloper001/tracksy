import api from './api/api';

export interface Trip {
  id: number;
  driver_id: number;
  bus_id: number;
  route_id: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  start_location?: {
    latitude: number;
    longitude: number;
  };
  end_location?: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
  duration?: number;
  passenger_count?: number;
  bus?: any;
  route?: any;
  stops?: any[];
  passengers?: any[];
}

export interface StartTripRequest {
  route_id: number;
  start_location?: {
    latitude: number;
    longitude: number;
  };
}

export interface EndTripRequest {
  end_location?: {
    latitude: number;
    longitude: number;
  };
}

class TripService {
  // Start a new trip
  async startTrip(data: StartTripRequest): Promise<Trip> {
    try {
      const response = await api.post('/driver/trips/start', data);
      const trip = response.data.data || response.data;
      return trip;
    } catch (error: any) {
      // If backend unavailable, provide helpful error
      if (error.response?.status === 500 || !error.response) {
        console.error('❌ Backend unavailable - cannot start trip');
        throw new Error('Backend service unavailable. Please check your connection and try again.');
      }
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to start trip';
      throw new Error(errorMessage);
    }
  }

  // End a trip
  async endTrip(tripId: number, data: EndTripRequest): Promise<Trip> {
    try {
      const response = await api.post(`/driver/trips/${tripId}/end`, data);
      const trip = response.data.data || response.data;
      return trip;
    } catch (error: any) {
      // If backend unavailable, provide helpful error
      if (error.response?.status === 500 || !error.response) {
        console.error('❌ Backend unavailable - cannot end trip');
        throw new Error('Backend service unavailable. Please check your connection and try again.');
      }
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to end trip';
      throw new Error(errorMessage);
    }
  }

  // Get current active trip
  async getCurrentTrip(): Promise<Trip | null> {
    try {
      const response = await api.get('/driver/trips/current');
      const trip = response.data.data || response.data;
      return trip;
    } catch (error: any) {
      // If no active trip or backend unavailable, return null
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.warn('⚠️ Backend unavailable or no active trip, returning null');
        return null;
      }
      // For network errors, also return null gracefully
      if (!error.response) {
        console.warn('⚠️ Network error getting current trip, returning null');
        return null;
      }
      throw new Error('Failed to get current trip');
    }
  }

  // Get trip history
  async getTripHistory(params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
  }): Promise<{ trips: Trip[]; total: number; current_page: number } | Trip[]> {
    try {
      const response = await api.get('/driver/trips', { params });
      const data = response.data.data || response.data;
      
      // Handle paginated response
      if (data.data && Array.isArray(data.data)) {
        return {
          trips: data.data,
          total: data.total || data.data.length,
          current_page: data.current_page || 1,
        };
      }
      
      // Handle array response (non-paginated)
      if (Array.isArray(data)) {
        return {
          trips: data,
          total: data.length,
          current_page: 1,
        };
      }
      
      return {
        trips: [],
        total: 0,
        current_page: 1,
      };
    } catch (error: any) {
      // If backend unavailable, return empty data gracefully
      if (error.response?.status === 500 || !error.response) {
        console.warn('⚠️ Backend unavailable getting trip history, returning empty array');
        return {
          trips: [],
          total: 0,
          current_page: 1,
        };
      }
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get trip history';
      throw new Error(errorMessage);
    }
  }

  // Get trip details
  async getTripDetails(tripId: number): Promise<Trip> {
    try {
      const response = await api.get(`/driver/trips/${tripId}`);
      const trip = response.data.data || response.data;
      return trip;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get trip details';
      throw new Error(errorMessage);
    }
  }
}

export default new TripService();

