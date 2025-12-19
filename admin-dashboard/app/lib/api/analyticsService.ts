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
  // Get analytics overview
  async getOverview(): Promise<any> {
    try {
      const response = await api.get('/admin/analytics/overview');
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning default overview');
        return {
          total_buses: 0,
          active_buses: 0,
          total_students: 0,
          total_routes: 0,
          on_time_percentage: 0,
          current_alerts: 0,
        };
      }
      throw error;
    }
  }

  // Get usage statistics
  async getUsageStatistics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/admin/analytics/usage', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning default usage stats');
        return {
          date_range: { start: startDate, end: endDate },
          daily_trips: [],
          peak_hours: [],
          route_popularity: [],
        };
      }
      throw error;
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/admin/analytics/performance', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning default performance metrics');
        return {
          on_time_percentage: 0,
          average_duration: 0,
          bus_utilization_rate: 0,
          total_trips: 0,
          completed_trips: 0,
          total_passengers: 0,
        };
      }
      throw error;
    }
  }

  // Get analytics data (combined - for backward compatibility)
  async getAnalytics(
    startDate?: string,
    endDate?: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<AnalyticsData> {
    try {
      // Fetch all analytics endpoints and combine
      const [overview, usage, performance] = await Promise.all([
        this.getOverview().catch(() => null),
        this.getUsageStatistics(startDate, endDate).catch(() => null),
        this.getPerformanceMetrics(startDate, endDate).catch(() => null),
      ]);

      return {
        usage_stats: usage ? {
          daily_trips: usage.daily_trips || [],
          weekly_trips: [],
          monthly_trips: [],
          peak_hours: usage.peak_hours || [],
          route_popularity: usage.route_popularity || [],
        } : {
          daily_trips: [],
          weekly_trips: [],
          monthly_trips: [],
          peak_hours: [],
          route_popularity: [],
        },
        performance_metrics: performance ? {
          on_time_percentage: performance.on_time_percentage || 0,
          average_wait_time: [],
          bus_utilization: [],
        } : {
          on_time_percentage: 0,
          average_wait_time: [],
          bus_utilization: [],
        },
      };
    } catch (error: any) {
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
  }

  // Get report data
  async getReport(
    reportType: 'daily' | 'weekly' | 'monthly' | 'custom',
    startDate?: string,
    endDate?: string
  ): Promise<ReportData> {
    try {
      const params: any = { type: reportType };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/admin/reports/generate', { params });
      const reportData = response.data.data || response.data;
      
      // Transform backend response to match ReportData interface
      return {
        total_trips: reportData.summary?.total_trips || 0,
        student_usage: {
          total_students: 0,
          active_students: 0,
          total_bookings: reportData.summary?.total_bookings || 0,
        },
        bus_performance: {
          total_buses: 0,
          active_buses: 0,
          average_utilization: 0,
        },
        route_efficiency: [],
        incidents: [],
      };
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
