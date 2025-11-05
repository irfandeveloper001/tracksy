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
      // If no active trip, return null
      if (error.response?.status === 404) {
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
  }): Promise<{ trips: Trip[]; total: number; current_page: number }> {
    try {
      const response = await api.get('/driver/trips', { params });
      const data = response.data.data || response.data;
      return {
        trips: data.data || data,
        total: data.total || 0,
        current_page: data.current_page || 1,
      };
    } catch (error: any) {
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

