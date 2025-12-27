import api from './client';

export interface Booking {
  id: number;
  student_id: number;
  bus_id: number;
  trip_id?: number;
  seat_number: string;
  trip_date: string;
  booking_reference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  rejection_reason?: string;
  admin_approved_by?: number;
  approved_at?: string;
  rejected_at?: string;
  cancelled_at?: string;
  cancelled_by?: number;
  created_at: string;
  updated_at: string;
  student?: {
    id: number;
    name: string;
    email: string;
    student_id?: string;
  };
  bus?: {
    id: number;
    name: string;
    number: string;
    capacity: number;
    currentRoute?: {
      id: number;
      name: string;
    };
  };
  trip?: {
    id: number;
    start_time: string;
    end_time?: string;
    status: string;
  };
  admin_approved_by_user?: {
    id: number;
    name: string;
  };
  seat_available?: boolean;
}

export interface BookingStatistics {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
  cancelled: number;
  completed: number;
}

const bookingService = {
  async getBookings(params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
    student_id?: number;
    bus_id?: number;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<{ data: Booking[]; meta?: any }> {
    const response = await api.get('/admin/bookings', { params });
    const payload = response.data?.data ?? response.data;
    if (Array.isArray(payload)) {
      return { data: payload };
    }
    if (payload && Array.isArray(payload.data)) {
      const { data, ...meta } = payload;
      return { data, meta };
    }
    return { data: [] };
  },

  async getBooking(id: number): Promise<Booking> {
    const response = await api.get(`/admin/bookings/${id}`);
    return response.data?.data ?? response.data;
  },

  async approveBooking(id: number): Promise<Booking> {
    const response = await api.post(`/admin/bookings/${id}/approve`);
    return response.data?.data ?? response.data;
  },

  async rejectBooking(id: number, rejectionReason: string): Promise<Booking> {
    const response = await api.post(`/admin/bookings/${id}/reject`, {
      rejection_reason: rejectionReason,
    });
    return response.data?.data ?? response.data;
  },

  async getStatistics(): Promise<BookingStatistics> {
    const response = await api.get('/admin/bookings/statistics');
    return response.data?.data ?? response.data;
  },
};

export default bookingService;

