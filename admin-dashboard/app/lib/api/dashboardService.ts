import { supabase } from '../config/supabase';

// Types removed - defined locally in components to avoid import issues

class DashboardService {
  // Get dashboard metrics - Fetch from Supabase directly
  async getMetrics(): Promise<{
  totalActiveBuses: number;
  totalStudents: number;
  totalRoutes: number;
  onTimePercentage: number;
  currentAlerts: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  }> {
    try {
      // Try Supabase first (preferred method)
      const metrics = await this.getMetricsFromSupabase();
      if (metrics) {
        return metrics;
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase fetch failed:', supabaseError);
    }

    // Skip API fallback to avoid CORS errors - just return defaults
    console.log('ℹ️ Using default metrics (API skipped to avoid CORS)');
    return {
      totalActiveBuses: 0,
      totalStudents: 0,
      totalRoutes: 0,
      onTimePercentage: 0,
      currentAlerts: 0,
      systemHealth: 'healthy',
    };
  }

  // Get metrics directly from Supabase
  async getMetricsFromSupabase(): Promise<{
    totalActiveBuses: number;
    totalStudents: number;
    totalRoutes: number;
    onTimePercentage: number;
    currentAlerts: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  } | null> {
    try {
      // Fetch all metrics in parallel
      const [busesResult, studentsResult, routesResult, alertsResult] = await Promise.all([
        // Count active buses
        supabase
          .from('buses')
          .select('id, status', { count: 'exact', head: false })
          .eq('status', 'active'),
        
        // Count students (from user_profiles where role is student)
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: false })
          .eq('role', 'student'),
        
        // Count active routes
        supabase
          .from('routes')
          .select('id', { count: 'exact', head: false })
          .eq('status', 'active'),
        
        // Count active alerts
        supabase
          .from('alerts')
          .select('id', { count: 'exact', head: false })
          .eq('status', 'active')
          .or('status.is.null'),
      ]);

      const totalActiveBuses = busesResult.count || busesResult.data?.length || 0;
      const totalStudents = studentsResult.count || studentsResult.data?.length || 0;
      const totalRoutes = routesResult.count || routesResult.data?.length || 0;
      const currentAlerts = alertsResult.count || alertsResult.data?.length || 0;
      
      // Note: totalRoutes now represents active routes count (filtered by .eq('status', 'active'))

      // Calculate on-time percentage (simplified - you can enhance this with actual trip data)
      const onTimePercentage = 0; // TODO: Calculate from trips table

      // Determine system health based on alerts and buses
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (currentAlerts > 5) {
        systemHealth = 'critical';
      } else if (currentAlerts > 2 || totalActiveBuses === 0) {
        systemHealth = 'warning';
      }

      return {
        totalActiveBuses,
        totalStudents,
        totalRoutes,
        onTimePercentage,
        currentAlerts,
        systemHealth,
      };
    } catch (error: any) {
      console.error('❌ Error fetching metrics from Supabase:', error);
      return null;
    }
  }

  // Get bus status - Fetch from Supabase directly
  async getBusStatus(): Promise<{ activeBuses: number; busesOnRoute: number; busesWithIssues: number }> {
    try {
      // Try Supabase first
      const status = await this.getBusStatusFromSupabase();
      if (status) {
        return status;
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase fetch failed, trying API:', supabaseError);
    }

    // Skip API fallback to avoid CORS errors - just return defaults
    console.log('ℹ️ Using default bus status (API skipped to avoid CORS)');
    return {
      activeBuses: 0,
      busesOnRoute: 0,
      busesWithIssues: 0,
    };
  }

  // Get bus status directly from Supabase
  async getBusStatusFromSupabase(): Promise<{ activeBuses: number; busesOnRoute: number; busesWithIssues: number } | null> {
    try {
      // Get all buses with their status
      const { data: buses, error } = await supabase
        .from('buses')
        .select('id, status, route_id');

      if (error) {
        console.error('❌ Error fetching buses:', error);
        return null;
      }

      const activeBuses = buses?.filter(bus => bus.status === 'active').length || 0;
      const busesOnRoute = buses?.filter(bus => bus.status === 'active' && bus.route_id).length || 0;
      const busesWithIssues = buses?.filter(bus => bus.status === 'maintenance' || bus.status === 'emergency').length || 0;

      return {
        activeBuses,
        busesOnRoute,
        busesWithIssues,
      };
    } catch (error: any) {
      console.error('❌ Error fetching bus status from Supabase:', error);
      return null;
    }
  }

  // Get recent activities - Try Supabase first, skip API to avoid CORS errors
  async getRecentActivities(limit: number = 10): Promise<Array<{
    id: string;
    type: 'bus' | 'user' | 'route' | 'alert' | 'system';
    action: string;
    timestamp: string;
    user?: string;
  }>> {
    try {
      // Try Supabase first (preferred method)
      const activities = await this.getRecentActivitiesFromSupabase(limit);
      if (activities) {
        return activities;
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase activities fetch failed:', supabaseError);
    }

    // Skip backend API call to avoid CORS errors
    // Return empty array if Supabase fails
    console.log('ℹ️ Using empty activities list (backend API skipped to avoid CORS)');
    return [];
  }

  // Get recent activities directly from Supabase
  async getRecentActivitiesFromSupabase(limit: number = 10): Promise<Array<{
    id: string;
    type: 'bus' | 'user' | 'route' | 'alert' | 'system';
    action: string;
    timestamp: string;
    user?: string;
  }> | null> {
    try {
      // Try to get activities from audit_logs or alerts table
      // For now, we'll check alerts as they're the most recent activities
      const { data: alerts, error } = await supabase
        .from('alerts')
        .select('id, title, created_at, type')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching activities from Supabase:', error);
        return null;
      }

      // Map alerts to activities format
      return (alerts || []).map((alert: any) => ({
        id: alert.id,
        type: (alert.type || 'alert') as 'bus' | 'user' | 'route' | 'alert' | 'system',
        action: alert.title || 'New alert',
        timestamp: alert.created_at || new Date().toISOString(),
      }));
    } catch (error: any) {
      console.error('❌ Error fetching activities from Supabase:', error);
      return null;
    }
  }
}

export default new DashboardService();


