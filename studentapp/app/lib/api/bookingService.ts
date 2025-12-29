import api from './client';

export interface Booking {
  id: number;
  student_id: number;
  bus_id: number;
  route_id: number;
  booking_date: string;
  trip_date?: string;
  seat_number?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
  bus?: any;
  route?: any;
}

export interface CreateBookingData {
  bus_id: number;
  route_id?: number;
  trip_date: string;
  seat_number: string;
}

class BookingService {
  // Get all bookings
  async getBookings(): Promise<Booking[]> {
    try {
      const response = await api.get('/bookings');
      const payload = response.data.data || response.data;
      if (Array.isArray(payload)) {
        return payload;
      }
      if (payload && Array.isArray(payload.data)) {
        return payload.data;
      }
      return [];
    } catch (error: any) {
      console.error('Error getting bookings:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get bookings';
      throw new Error(errorMessage);
    }
  }

  // Get booking by ID
  async getBooking(id: number): Promise<Booking> {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get booking';
      throw new Error(errorMessage);
    }
  }

  // Create booking
  async createBooking(data: CreateBookingData): Promise<Booking> {
    try {
      const response = await api.post('/bookings', data);
      return response.data.data || response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create booking';
      throw new Error(errorMessage);
    }
  }

  // Cancel booking
  async cancelBooking(id: number): Promise<void> {
    try {
      await api.delete(`/bookings/${id}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to cancel booking';
      throw new Error(errorMessage);
    }
  }

  // Get booking statistics
  async getStatistics(): Promise<any> {
    try {
      const response = await api.get('/bookings/statistics');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error getting booking statistics:', error);
      return null;
    }
  }

  // Get monthly summary
  async getMonthlySummary(): Promise<any> {
    try {
      const response = await api.get('/bookings/monthly-summary');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error getting monthly summary:', error);
      return null;
    }
  }
}

export default new BookingService();
