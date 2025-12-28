import api from './client';

export interface Bus {
  id: number;
  bus_number: string;
  license_plate?: string;
  capacity?: number;
  status?: string;
  current_route_id?: number;
  driver_id?: number;
  current_location?: {
    latitude: number;
    longitude: number;
    timestamp?: string;
  };
}

export interface BusLocation {
  bus_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

class BusService {
  private normalizeBus(bus: any): Bus {
    const latestLocation = bus?.current_location || bus?.locations?.[0] || null;
    const timestamp =
      latestLocation?.timestamp ||
      latestLocation?.recorded_at ||
      latestLocation?.created_at ||
      undefined;

    return {
      ...bus,
      current_location: latestLocation
        ? {
            latitude: Number(latestLocation.latitude),
            longitude: Number(latestLocation.longitude),
            timestamp,
          }
        : undefined,
    };
  }

  // Get all buses
  async getBuses(): Promise<Bus[]> {
    try {
      const response = await api.get('/buses');
      const buses = response.data.data || response.data;
      return Array.isArray(buses) ? buses.map((bus) => this.normalizeBus(bus)) : [];
    } catch (error: any) {
      console.error('Error getting buses:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get buses';
      throw new Error(errorMessage);
    }
  }

  // Get bus by ID
  async getBus(id: number): Promise<Bus> {
    try {
      const response = await api.get(`/buses/${id}`);
      const bus = response.data.data || response.data;
      return this.normalizeBus(bus);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get bus';
      throw new Error(errorMessage);
    }
  }

  // Get bus location (real-time)
  async getBusLocation(busId: number): Promise<BusLocation | null> {
    try {
      const response = await api.get(`/buses/${busId}/location`);
      const location = response.data.data || response.data;
      
      if (location && location.latitude && location.longitude) {
        return location;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error getting bus location:', error);
      // Return null if no location available (not an error)
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Get seat availability
  async getSeatAvailability(busId: number): Promise<{ available: number; total: number }> {
    try {
      const response = await api.get(`/buses/${busId}/seats`);
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get seat availability';
      throw new Error(errorMessage);
    }
  }
}

export default new BusService();
