import api from './client';

export interface AnalyticsData {
  usage_stats: {
    daily_trips: Array<{ date: string; count: number }>;
    weekly_trips: Array<{ week: string; count: number }>;
    monthly_trips: Array<{ month: string; count: number }>;
    peak_hours: Array<{ hour: number; count: number }>;
    route_popularity: Array<{ route_name: string; count: number }>;
  };
  performance_metrics: {
    on_time_percentage: number;
    average_wait_time: Array<{ date: string; minutes: number }>;
    bus_utilization: Array<{ bus_number: string; utilization: number }>;
  };
  financial_analytics?: {
    revenue_trends: Array<{ date: string; amount: number }>;
    cost_analysis: Array<{ category: string; amount: number }>;
  };
}

export interface ReportData {
  total_trips: number;
  student_usage: {
    total_students: number;
    active_students: number;
    total_bookings: number;
  };
  bus_performance: {
    total_buses: number;
    active_buses: number;
    average_utilization: number;
  };
  route_efficiency: Array<{
    route_name: string;
    trips_count: number;
    average_duration: number;
    on_time_percentage: number;
  }>;
  incidents: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
  financial_summary?: {
    total_revenue: number;
    total_costs: number;
    net_profit: number;
  };
}

class AnalyticsService {
  // Get analytics data
  async getAnalytics(
    startDate?: string,
    endDate?: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<AnalyticsData> {
    try {
      const params: any = { period };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/admin/analytics', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning default analytics');
        return {
          usage_stats: {
            daily_trips: [],
            weekly_trips: [],
            monthly_trips: [],
            peak_hours: [],
            route_popularity: [],
          },
          performance_metrics: {
            on_time_percentage: 0,
            average_wait_time: [],
            bus_utilization: [],
          },
        };
      }
      throw error;
    }
  }

  // Get report data
  async getReport(
    reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
    startDate?: string,
    endDate?: string
  ): Promise<ReportData> {
    try {
      const params: any = { type: reportType };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/admin/reports', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning default report');
        return {
          total_trips: 0,
          student_usage: {
            total_students: 0,
            active_students: 0,
            total_bookings: 0,
          },
          bus_performance: {
            total_buses: 0,
            active_buses: 0,
            average_utilization: 0,
          },
          route_efficiency: [],
          incidents: [],
        };
      }
      throw error;
    }
  }

  // Export analytics to PDF/Excel
  async exportAnalytics(
    format: 'pdf' | 'excel',
    startDate?: string,
    endDate?: string
  ): Promise<Blob> {
    try {
      const params: any = { format };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/admin/analytics/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export analytics');
    }
  }

  // Export report to PDF/Excel
  async exportReport(
    reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
    format: 'pdf' | 'excel',
    startDate?: string,
    endDate?: string
  ): Promise<Blob> {
    try {
      const params: any = { type: reportType, format };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/admin/reports/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export report');
    }
  }

  // Schedule automated report
  async scheduleReport(
    reportType: 'daily' | 'weekly' | 'monthly',
    email: string,
    schedule: string
  ): Promise<void> {
    try {
      await api.post('/admin/reports/schedule', {
        type: reportType,
        email,
        schedule,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to schedule report');
    }
  }
}

export default new AnalyticsService();
