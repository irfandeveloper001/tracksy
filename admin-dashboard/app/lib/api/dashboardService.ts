import api from './client';
import busService from './busService';
import routeService from './routeService';

// Types removed - defined locally in components to avoid import issues

class DashboardService {
  // Get dashboard metrics - Fetch from Laravel API
  async getMetrics(): Promise<{
  totalActiveBuses: number;
  totalStudents: number;
  totalRoutes: number;
  onTimePercentage: number;
  currentAlerts: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  }> {
    try {
      console.log('🔍 Fetching dashboard metrics from Laravel API...');
      
      // Fetch from Laravel analytics endpoint
      const response = await api.get('/admin/analytics/overview');
      const data = response.data.data || response.data;
      
      console.log('✅ Dashboard metrics fetched:', data);
      
      // Map Laravel response to frontend format
      const metrics = {
        totalActiveBuses: data.active_buses || 0,
        totalStudents: data.total_students || 0,
        totalRoutes: data.total_routes || 0,
        onTimePercentage: data.on_time_percentage || 0,
        currentAlerts: data.current_alerts || 0,
        systemHealth: this.determineSystemHealth(data.current_alerts || 0, data.active_buses || 0),
      };
      
        return metrics;
    } catch (error: any) {
      console.error('❌ Failed to fetch dashboard metrics from Laravel API:', error);
      
      // Fallback: Try to fetch from individual endpoints
      try {
        console.log('⚠️ Trying fallback: fetching from individual endpoints...');
        const [busesResult, routesResult] = await Promise.all([
          busService.getBuses(1, 1, { status: 'active' }).catch(() => ({ buses: [], total: 0 })),
          routeService.getRoutes(1, 1, { status: 'active' }).catch(() => ({ routes: [], total: 0 })),
        ]);
        
        return {
          totalActiveBuses: busesResult.total || 0,
          totalStudents: 0, // Would need separate endpoint
          totalRoutes: routesResult.total || 0,
          onTimePercentage: 0,
          currentAlerts: 0,
          systemHealth: 'healthy',
        };
      } catch (fallbackError) {
        console.warn('⚠️ Fallback also failed, using defaults');
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
  }

      // Determine system health based on alerts and buses
  private determineSystemHealth(alerts: number, activeBuses: number): 'healthy' | 'warning' | 'critical' {
    if (alerts > 5) {
      return 'critical';
    } else if (alerts > 2 || activeBuses === 0) {
      return 'warning';
      }
    return 'healthy';
    }


  // Get bus status - Fetch from Laravel API
  async getBusStatus(): Promise<{ activeBuses: number; busesOnRoute: number; busesWithIssues: number }> {
    try {
      console.log('🔍 Fetching bus status from Laravel API...');
      
      // Fetch all active buses (with pagination to get all)
      const activeBusesResult = await busService.getBuses(1, 100, { status: 'active' }).catch(() => ({ buses: [], total: 0 }));
      
      // Count active buses
      const activeBuses = activeBusesResult.total || 0;
      
      // Count buses on route (active buses with route_id or current_route_id)
      const busesOnRoute = activeBusesResult.buses?.filter(bus => bus.route_id || bus.current_route_id).length || 0;
      
      // Fetch buses with issues (maintenance + emergency) in parallel
      const [maintenanceResult, emergencyResult] = await Promise.all([
        busService.getBuses(1, 100, { status: 'maintenance' }).catch(() => ({ buses: [], total: 0 })),
        busService.getBuses(1, 100, { status: 'emergency' }).catch(() => ({ buses: [], total: 0 })),
      ]);
      
      const busesWithIssues = (maintenanceResult.total || 0) + (emergencyResult.total || 0);
      
      console.log('✅ Bus status fetched:', { activeBuses, busesOnRoute, busesWithIssues });

      return {
        activeBuses,
        busesOnRoute,
        busesWithIssues,
      };
    } catch (error: any) {
      console.error('❌ Failed to fetch bus status from Laravel API:', error);
      
      // Return defaults on error
      return {
        activeBuses: 0,
        busesOnRoute: 0,
        busesWithIssues: 0,
      };
    }
  }


  // Get recent activities - Fetch from Laravel API
  async getRecentActivities(limit: number = 10): Promise<Array<{
    id: string;
    type: 'bus' | 'user' | 'route' | 'alert' | 'system';
    action: string;
    timestamp: string;
    user?: string;
  }>> {
    try {
      console.log('🔍 Fetching recent activities from Laravel API...');
      
      // Fetch alerts from Laravel API
      const response = await api.get('/admin/alerts', {
        params: {
          per_page: limit,
          sort: 'created_at',
          order: 'desc',
        },
      });
      
      // Handle different response formats from Laravel API
      let alerts: any[] = [];
      const responseData = response.data.data || response.data;
      
      if (Array.isArray(responseData)) {
        alerts = responseData;
      } else if (responseData && Array.isArray(responseData.alerts)) {
        alerts = responseData.alerts;
      } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
        alerts = responseData.data;
      }

      // Map alerts to activities format
      const activities = alerts.map((alert: any) => ({
        id: alert.id?.toString() || Date.now().toString(),
        type: (alert.type || 'alert') as 'bus' | 'user' | 'route' | 'alert' | 'system',
        action: alert.title || alert.message || 'New alert',
        timestamp: alert.created_at || new Date().toISOString(),
        user: alert.user?.name || alert.created_by?.name,
      }));
      
      console.log('✅ Recent activities fetched:', activities.length);
      
      return activities;
    } catch (error: any) {
      console.warn('⚠️ Failed to fetch recent activities from Laravel API:', error);
      // Return empty array on error
      return [];
    }
  }
}

export default new DashboardService();


