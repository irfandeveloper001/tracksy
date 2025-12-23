import api from './api';

export const bookingService = {
  // Get user bookings
  async getUserBookings(params = {}) {
    try {
      const response = await api.get('/bookings', { params });
      return {
        success: response.success !== false,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch bookings',
      };
    }
  },

  // Get booking details
  async getBookingDetails(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return {
        success: response.success !== false,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch booking details',
      };
    }
  },

  // Create booking
  async createBooking(bookingData) {
    try {
      const response = await api.post('/bookings', bookingData);
      return {
        success: response.success !== false,
        data: response.data || response,
        message: response.message || 'Booking created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create booking',
      };
    }
  },

  // Cancel booking
  async cancelBooking(bookingId) {
    try {
      const response = await api.delete(`/bookings/${bookingId}`);
      return {
        success: response.success !== false,
        message: response.message || 'Booking cancelled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to cancel booking',
      };
    }
  },
};

