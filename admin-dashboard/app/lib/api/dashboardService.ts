import api from './client';

export interface DashboardMetrics {
  totalActiveBuses: number;
  totalStudents: number;
  totalRoutes: number;
  onTimePercentage: number;
  currentAlerts: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export interface BusStatus {
  activeBuses: number;
  busesOnRoute: number;
  busesWithIssues: number;
}

export interface Activity {
  id: string;
  type: 'bus' | 'user' | 'route' | 'alert' | 'system';
  action: string;
  timestamp: string;
  user?: string;
}

class DashboardService {
  // Get dashboard metrics
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await api.get('/admin/analytics/overview');
      return response.data.data || response.data;
    } catch (error: any) {
      // If backend unavailable, return default metrics
      if (!error.response || error.response.status === 500) {
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
      throw error;
    }
  }

  // Get bus status
  async getBusStatus(): Promise<BusStatus> {
    try {
      const response = await api.get('/admin/buses/status');
      return response.data.data || response.data;
    } catch (error: any) {
      // If backend unavailable, return default status
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning default bus status');
        return {
          activeBuses: 0,
          busesOnRoute: 0,
          busesWithIssues: 0,
        };
      }
      throw error;
    }
  }

  // Get recent activities
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    try {
      const response = await api.get('/admin/activities', {
        params: { limit },
      });
      return response.data.data || response.data || [];
    } catch (error: any) {
      // If backend unavailable, return empty array
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning empty activities');
        return [];
      }
      return [];
    }
  }
}

export default new DashboardService();


