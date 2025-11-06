import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TruckIcon,
  UserGroupIcon,
  MapIcon,
  ClockIcon,
  BellIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import MetricCard from '../../components/dashboard/MetricCard';
import StatusPanel from '../../components/dashboard/StatusPanel';
import QuickActions from '../../components/dashboard/QuickActions';
import ActivityFeed, { Activity } from '../../components/dashboard/ActivityFeed';
import dashboardService, { DashboardMetrics, BusStatus } from '../../lib/api/dashboardService';
import realtimeService from '../../lib/services/realtimeService';

export default function DashboardPage() {
  const [busStatus, setBusStatus] = useState<BusStatus>({
    activeBuses: 0,
    busesOnRoute: 0,
    busesWithIssues: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);

  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => dashboardService.getMetrics(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch bus status
  const { data: initialBusStatus, refetch: refetchBusStatus } = useQuery({
    queryKey: ['bus-status'],
    queryFn: () => dashboardService.getBusStatus(),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch recent activities
  const { data: initialActivities, refetch: refetchActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => dashboardService.getRecentActivities(10),
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  // Update local state when data changes
  useEffect(() => {
    if (initialBusStatus) {
      setBusStatus(initialBusStatus);
    }
  }, [initialBusStatus]);

  useEffect(() => {
    if (initialActivities) {
      setActivities(initialActivities);
    }
  }, [initialActivities]);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to bus updates
    const unsubscribeBus = realtimeService.subscribeToAllBuses((payload) => {
      console.log('Bus update received:', payload);
      // Refetch bus status when bus updates
      refetchBusStatus();
      refetchMetrics();
    });

    // Subscribe to alerts
    const unsubscribeAlerts = realtimeService.subscribeToAlerts((payload) => {
      console.log('Alert received:', payload);
      // Add new alert to activities
      const newActivity: Activity = {
        id: payload.new?.id || Date.now().toString(),
        type: 'alert',
        action: `New alert: ${payload.new?.title || 'Alert created'}`,
        timestamp: payload.new?.created_at || new Date().toISOString(),
      };
      setActivities((prev) => [newActivity, ...prev].slice(0, 10));
      // Refetch metrics
      refetchMetrics();
    });

    // Subscribe to dashboard updates
    const unsubscribeDashboard = realtimeService.subscribeToDashboard((payload) => {
      console.log('Dashboard update received:', payload);
      // Refetch all data
      refetchMetrics();
      refetchBusStatus();
      refetchActivities();
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeBus();
      unsubscribeAlerts();
      unsubscribeDashboard();
    };
  }, [refetchMetrics, refetchBusStatus, refetchActivities]);

  // Format metrics for display
  const formattedMetrics: DashboardMetrics = metrics || {
    totalActiveBuses: 0,
    totalStudents: 0,
    totalRoutes: 0,
    onTimePercentage: 0,
    currentAlerts: 0,
    systemHealth: 'healthy',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Real-time overview of your transport system
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Active Buses"
          value={formattedMetrics.totalActiveBuses}
          icon={<TruckIcon className="h-6 w-6" />}
          color="blue"
        />
        <MetricCard
          title="Total Students"
          value={formattedMetrics.totalStudents}
          icon={<UserGroupIcon className="h-6 w-6" />}
          color="green"
        />
        <MetricCard
          title="Total Routes"
          value={formattedMetrics.totalRoutes}
          icon={<MapIcon className="h-6 w-6" />}
          color="purple"
        />
        <MetricCard
          title="On-Time Percentage"
          value={`${formattedMetrics.onTimePercentage}%`}
          icon={<ClockIcon className="h-6 w-6" />}
          color="yellow"
        />
        <MetricCard
          title="Current Alerts"
          value={formattedMetrics.currentAlerts}
          icon={<BellIcon className="h-6 w-6" />}
          color="red"
        />
        <MetricCard
          title="System Health"
          value={
            formattedMetrics.systemHealth === 'healthy'
              ? 'Healthy'
              : formattedMetrics.systemHealth === 'warning'
              ? 'Warning'
              : 'Critical'
          }
          icon={<ShieldCheckIcon className="h-6 w-6" />}
          color={
            formattedMetrics.systemHealth === 'healthy'
              ? 'green'
              : formattedMetrics.systemHealth === 'warning'
              ? 'yellow'
              : 'red'
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Status Panel */}
          <StatusPanel
            activeBuses={busStatus.activeBuses}
            busesOnRoute={busStatus.busesOnRoute}
            busesWithIssues={busStatus.busesWithIssues}
          />

          {/* Activity Feed */}
          <ActivityFeed activities={activities} />
        </div>

        {/* Right Column */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Loading State */}
      {metricsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      )}
    </div>
  );
}
