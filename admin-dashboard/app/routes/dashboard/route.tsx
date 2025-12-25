import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TruckIcon,
  UserGroupIcon,
  MapIcon,
  ClockIcon,
  BellIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowUpIcon,
  SparklesIcon,
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWelcome, setShowWelcome] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Calculate efficiency metrics
  const efficiency = formattedMetrics.totalActiveBuses > 0 
    ? Math.round((formattedMetrics.onTimePercentage / 100) * formattedMetrics.totalActiveBuses)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 space-y-8 pb-8">
      {/* Premium Header with Glassmorphism */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left side - Title and description */}
              <div className="space-y-4 animate-in fade-in slide-in-from-left duration-700">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                    <SparklesIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-2 tracking-tight">
                      Command Center
                    </h1>
                    <p className="text-blue-100 text-lg font-medium">
                      Real-time transport management dashboard
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side - Live stats and time */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 animate-in fade-in slide-in-from-right duration-700">
                {/* Live indicator */}
                <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-md rounded-xl px-5 py-3 border border-white/30 shadow-lg">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-ping absolute"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full relative"></div>
                  </div>
                  <div>
                    <p className="text-xs text-blue-100 font-medium uppercase tracking-wider">System Status</p>
                    <p className="text-sm text-white font-bold">Live & Operational</p>
                  </div>
                </div>

                {/* Current time */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl px-5 py-3 border border-white/30 shadow-lg">
                  <p className="text-xs text-blue-100 font-medium uppercase tracking-wider mb-1">Current Time</p>
                  <p className="text-lg text-white font-mono font-bold">
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit',
                      hour12: true 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick stats bar */}
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom duration-1000" style={{ animationDelay: '200ms' }}>
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                <p className="text-xs text-blue-100 font-medium mb-1">Total Fleet</p>
                <p className="text-2xl font-bold text-white">{formattedMetrics.totalActiveBuses}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                <p className="text-xs text-blue-100 font-medium mb-1">Active Routes</p>
                <p className="text-2xl font-bold text-white">{formattedMetrics.totalRoutes}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                <p className="text-xs text-blue-100 font-medium mb-1">On-Time Rate</p>
                <p className="text-2xl font-bold text-white">{formattedMetrics.onTimePercentage}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                <p className="text-xs text-blue-100 font-medium mb-1">Efficiency</p>
                <p className="text-2xl font-bold text-white">{efficiency}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Key Metrics Cards - Enhanced with glassmorphism */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Active Buses"
            value={formattedMetrics.totalActiveBuses}
            icon={<TruckIcon className="h-6 w-6" />}
            color="blue"
            change={{ value: 12, isPositive: true }}
          />
          <MetricCard
            title="Total Students"
            value={formattedMetrics.totalStudents}
            icon={<UserGroupIcon className="h-6 w-6" />}
            color="green"
            change={{ value: 8, isPositive: true }}
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
            change={{ value: 5, isPositive: true }}
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Real-time Status Panel */}
            <div className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '100ms' }}>
              <StatusPanel
                activeBuses={busStatus.activeBuses}
                busesOnRoute={busStatus.busesOnRoute}
                busesWithIssues={busStatus.busesWithIssues}
                activeRoutes={formattedMetrics.totalRoutes || 0}
              />
            </div>

            {/* Bus List with Filters */}
            <div className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
              <BusListPanel defaultFilter="all" />
            </div>

            {/* Route List with Filters */}
            <div className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '300ms' }}>
              <RouteListPanel defaultFilter="all" />
            </div>

            {/* Activity Feed */}
            <div className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '400ms' }}>
              <ActivityFeed activities={activities} />
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="animate-in fade-in slide-in-from-right duration-700" style={{ animationDelay: '100ms' }}>
              <QuickActions />
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-right duration-700" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <ChartBarIcon className="h-6 w-6 mr-2 text-indigo-600" />
                    Performance
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ArrowUpIcon className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">On-Time Rate</span>
                  <span className="text-lg font-bold text-indigo-600">{formattedMetrics.onTimePercentage}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Fleet Utilization</span>
                  <span className="text-lg font-bold text-green-600">
                    {formattedMetrics.totalActiveBuses > 0 
                      ? Math.round((busStatus.busesOnRoute / formattedMetrics.totalActiveBuses) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">Route Coverage</span>
                  <span className="text-lg font-bold text-purple-600">{formattedMetrics.totalRoutes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
