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
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import BusListPanel from '../../components/dashboard/BusListPanel';
import RouteListPanel from '../../components/dashboard/RouteListPanel';
import dashboardService from '../../lib/api/dashboardService';
import realtimeService from '../../lib/services/realtimeService';

// Define types locally to avoid import issues
type DashboardMetrics = {
  totalActiveBuses: number;
  totalStudents: number;
  totalRoutes: number;
  onTimePercentage: number;
  currentAlerts: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
};

type BusStatus = {
  activeBuses: number;
  busesOnRoute: number;
  busesWithIssues: number;
};

type Activity = {
  id: string;
  type: 'bus' | 'user' | 'route' | 'alert' | 'system';
  action: string;
  timestamp: string;
  user?: string;
};

export default function DashboardPage() {
  const [busStatus, setBusStatus] = useState<BusStatus>({
    activeBuses: 0,
    busesOnRoute: 0,
    busesWithIssues: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);

  // Fetch dashboard metrics - non-blocking, always show UI
  const { data: metrics, isLoading: metricsLoading, isError: metricsError, refetch: refetchMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => dashboardService.getMetrics(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1, // Retry once on failure
    staleTime: 10000, // Consider data fresh for 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: true, // Always refetch on mount to get latest data
  });

  // Fetch bus status - non-blocking, always show UI
  const { data: initialBusStatus, isLoading: busStatusLoading, isError: busStatusError, refetch: refetchBusStatus } = useQuery({
    queryKey: ['bus-status'],
    queryFn: () => dashboardService.getBusStatus(),
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: 1, // Retry once on failure
    staleTime: 5000, // Consider data fresh for 5 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: true, // Always refetch on mount to get latest data
  });

  // Fetch recent activities - non-blocking, always show UI
  const { data: initialActivities, isLoading: activitiesLoading, isError: activitiesError, refetch: refetchActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => dashboardService.getRecentActivities(10),
    refetchInterval: 15000, // Refetch every 15 seconds
    retry: 0, // Don't retry - fail fast
    staleTime: 10000, // Consider data fresh for 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: false, // Don't refetch on mount if we have cached data
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
      <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-blue-100 text-lg">
          Real-time overview of your transport system
        </p>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Key Metrics Cards - Always show, data loads in background */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Main Content Grid - Always show, data loads in background */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Status Panel */}
          <StatusPanel
            activeBuses={busStatus.activeBuses}
            busesOnRoute={busStatus.busesOnRoute}
            busesWithIssues={busStatus.busesWithIssues}
            activeRoutes={formattedMetrics.totalRoutes || 0}
          />

          {/* Bus List with Filters */}
          <BusListPanel defaultFilter="all" />

          {/* Route List with Filters */}
          <RouteListPanel defaultFilter="all" />

          {/* Activity Feed */}
          <ActivityFeed activities={activities} />
        </div>

        {/* Right Column */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Info Message - Only show in dev mode when backend is unavailable */}
      {import.meta.env.DEV && (metricsError || busStatusError || activitiesError) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-xl p-5 shadow-lg animate-in slide-in-from-bottom duration-500">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-blue-900 text-lg">ℹ️</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Development Mode
              </p>
              <p className="text-sm text-blue-800">
                Dashboard is using Supabase data directly. Backend API is optional and used for advanced analytics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

