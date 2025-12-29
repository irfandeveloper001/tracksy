import api from './api';

export const routeService = {
  // Get all routes
  async getAllRoutes(params = {}) {
    try {
      const response = await api.get('/routes', { params });
      return {
        success: response.success !== false,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch routes',
      };
    }
  },

  // Get route details
  async getRouteDetails(routeId) {
    try {
      const response = await api.get(`/routes/${routeId}`);
      return {
        success: response.success !== false,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch route details',
      };
    }
  },

  // Get route stops
  async getRouteStops(routeId) {
    try {
      const response = await api.get(`/routes/${routeId}/stops`);
      return {
        success: response.success !== false,
        data: response.data || response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch route stops',
      };
    }
  },
};

