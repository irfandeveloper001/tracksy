import api from './api/api';

export interface PerformanceMetrics {
  tripsCompleted: number;
  totalDistance: number; // in meters
  totalDrivingTime: number; // in seconds
  averageSpeed: number; // in km/h
  onTimePercentage: number;
  totalPassengers: number;
}

export interface DailyStats {
  date: string;
  trips: number;
  distance: number;
  duration: number;
  passengers: number;
}

export interface WeeklyStats {
  week: string;
  trips: number;
  distance: number;
  duration: number;
  passengers: number;
}

export interface MonthlyStats {
  month: string;
  trips: number;
  distance: number;
  duration: number;
  passengers: number;
}

class AnalyticsService {
  // Get today's performance metrics
  async getTodayMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await api.get('/driver/analytics/today');
      const data = response.data.data || response.data;
      return data;
    } catch (error: any) {
      // If endpoint doesn't exist or backend unavailable, return empty metrics
      if (error.response?.status === 404 || error.response?.status === 500 || !error.response) {
        console.warn('⚠️ Backend unavailable getting today metrics, returning empty metrics');
        return {
          tripsCompleted: 0,
          totalDistance: 0,
          totalDrivingTime: 0,
          averageSpeed: 0,
          onTimePercentage: 0,
          totalPassengers: 0,
        };
      }
      throw new Error('Failed to get today metrics');
    }
  }

  // Get weekly statistics
  async getWeeklyStats(): Promise<WeeklyStats[]> {
    try {
      const response = await api.get('/driver/analytics/weekly');
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 500 || !error.response) {
        console.warn('⚠️ Backend unavailable getting weekly stats, returning empty array');
        return [];
      }
      throw new Error('Failed to get weekly stats');
    }
  }

  // Get monthly statistics
  async getMonthlyStats(): Promise<MonthlyStats[]> {
    try {
      const response = await api.get('/driver/analytics/monthly');
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 500 || !error.response) {
        console.warn('⚠️ Backend unavailable getting monthly stats, returning empty array');
        return [];
      }
      throw new Error('Failed to get monthly stats');
    }
  }

  // Get daily statistics for chart
  async getDailyStats(startDate: string, endDate: string): Promise<DailyStats[]> {
    try {
      const response = await api.get('/driver/analytics/daily', {
        params: { startDate, endDate },
      });
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 500 || !error.response) {
        console.warn('⚠️ Backend unavailable getting daily stats, returning empty array');
        return [];
      }
      throw new Error('Failed to get daily stats');
    }
  }
}

export default new AnalyticsService();

