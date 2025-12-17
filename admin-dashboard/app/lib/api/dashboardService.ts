import api from './client';

// Types removed - defined locally in components to avoid import issues

class DashboardService {
  // Get dashboard metrics
  async getMetrics(): Promise<{
  totalActiveBuses: number;
  totalStudents: number;
  totalRoutes: number;
  onTimePercentage: number;
  currentAlerts: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  }> {
    try {
      const response = await api.get('/admin/analytics/overview', {
        skipErrorToast: true, // Suppress error toast - we have fallback
      } as any);
      return response.data.data || response.data;
    } catch (error: any) {
      // If backend unavailable or network error, return default metrics
      if (!error.response || error.response.status >= 500 || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        console.warn('⚠️ Backend unavailable, returning default metrics');
        return {
          totalActiveBuses: 0,
          totalStudents: 0,
          totalRoutes: 0,
          onTimePercentage: 0,
          currentAlerts: 0,
          systemHealth: 'healthy',
        };
      }
      // For other errors, still return defaults to prevent UI blocking
      console.warn('⚠️ Error fetching metrics, returning defaults:', error.message);
      return {
        totalActiveBuses: 0,
        totalStudents: 0,
        totalRoutes: 0,
        onTimePercentage: 0,
        currentAlerts: 0,
        systemHealth: 'healthy',
      };
    }
  }

  // Get bus status
  async getBusStatus(): Promise<{ activeBuses: number; busesOnRoute: number; busesWithIssues: number }> {
    try {
      const response = await api.get('/admin/buses/status', {
        skipErrorToast: true, // Suppress error toast - we have fallback
      } as any);
      return response.data.data || response.data;
    } catch (error: any) {
      // If backend unavailable or network error, return default status
      if (!error.response || error.response.status >= 500 || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        console.warn('⚠️ Backend unavailable, returning default bus status');
        return {
          activeBuses: 0,
          busesOnRoute: 0,
          busesWithIssues: 0,
        };
      }
      // For other errors, still return defaults to prevent UI blocking
      console.warn('⚠️ Error fetching bus status, returning defaults:', error.message);
      return {
        activeBuses: 0,
        busesOnRoute: 0,
        busesWithIssues: 0,
      };
    }
  }

  // Get recent activities
  async getRecentActivities(limit: number = 10): Promise<Array<{
    id: string;
    type: 'bus' | 'user' | 'route' | 'alert' | 'system';
    action: string;
    timestamp: string;
    user?: string;
  }>> {
    try {
      const response = await api.get('/admin/activities', {
        params: { limit },
        skipErrorToast: true, // Suppress error toast - we have fallback
      } as any);
      return response.data.data || response.data || [];
    } catch (error: any) {
      // If backend unavailable or network error, return empty array
      if (!error.response || error.response.status >= 500 || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        console.warn('⚠️ Backend unavailable, returning empty activities');
        return [];
      }
      // For other errors, return empty array to prevent UI blocking
      console.warn('⚠️ Error fetching activities, returning empty array:', error.message);
      return [];
    }
  }
}

export default new DashboardService();


