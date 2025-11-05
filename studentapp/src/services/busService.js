import api from './api';

export const busService = {
  // Get all buses
  async getAllBuses(params = {}) {
    try {
      const response = await api.get('/buses', { params });
      return {
        success: response.success !== false,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch buses',
      };
    }
  },

  // Get bus details
  async getBusDetails(busId) {
    try {
      const response = await api.get(`/buses/${busId}`);
      return {
        success: response.success !== false,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch bus details',
      };
    }
  },

  // Get bus current location
  async getBusLocation(busId) {
    try {
      const response = await api.get(`/buses/${busId}/location`);
      return {
        success: response.success !== false,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch bus location',
      };
    }
  },

  // Get seat availability
  async getSeatAvailability(busId, tripDate) {
    try {
      const response = await api.get(`/buses/${busId}/seats`, {
        params: { tripDate },
      });
      return {
        success: response.success !== false,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch seat availability',
      };
    }
  },
};

