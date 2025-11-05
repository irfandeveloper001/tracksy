import api from './api/api';

export interface Passenger {
  id: number;
  name: string;
  student_id: string;
  seat_number?: string;
  booking_id: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'cancelled';
  boarding_stop?: string;
  alighting_stop?: string;
  boarding_stop_id?: number;
  alighting_stop_id?: number;
}

export interface CheckInRequest {
  student_id: number;
  trip_id: number;
  seat_number?: string;
}

class PassengerService {
  // Get passengers for a trip
  async getPassengers(tripId: number): Promise<Passenger[]> {
    try {
      const response = await api.get(`/driver/trips/${tripId}/passengers`);
      const passengers = response.data.data || response.data;
      return Array.isArray(passengers) ? passengers : [];
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get passengers';
      throw new Error(errorMessage);
    }
  }

  // Check-in a passenger
  async checkIn(data: CheckInRequest): Promise<any> {
    try {
      const response = await api.post('/driver/passengers/check-in', data);
      const result = response.data.data || response.data;
      return result;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to check-in passenger';
      throw new Error(errorMessage);
    }
  }
}

export default new PassengerService();

