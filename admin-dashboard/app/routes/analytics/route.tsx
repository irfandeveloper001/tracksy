import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import analyticsService from '../../lib/api/analyticsService';
import DateRangePicker from '../../components/analytics/DateRangePicker';
import TripCountsChart from '../../components/analytics/TripCountsChart';
import PeakHoursChart from '../../components/analytics/PeakHoursChart';
import RoutePopularityChart from '../../components/analytics/RoutePopularityChart';
import PerformanceMetrics from '../../components/analytics/PerformanceMetrics';
import BusUtilizationChart from '../../components/analytics/BusUtilizationChart';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Fetch analytics data
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['analytics', dateRange.start, dateRange.end, period],
    queryFn: () =>
      analyticsService.getAnalytics(dateRange.start, dateRange.end, period),
    refetchInterval: 60000, // Refetch every minute
  });

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const blob = await analyticsService.exportAnalytics(
        format,
        dateRange.start,
        dateRange.end
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${dateRange.start}-${dateRange.end}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to export analytics');
    }
  };

  const analyticsData = analytics || {
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

  const periodTrips =
    period === 'daily'
      ? analyticsData.usage_stats.daily_trips
      : period === 'weekly'
      ? analyticsData.usage_stats.weekly_trips
      : analyticsData.usage_stats.monthly_trips;

  const totalTrips = periodTrips.reduce((sum, item) => sum + item.count, 0);
  const peakHour = analyticsData.usage_stats.peak_hours.reduce(
    (max, item) => (!max || item.count > max.count ? item : max),
    null as null | { hour: number; count: number }
  );
  const topRoute = analyticsData.usage_stats.route_popularity.reduce(
    (max, item) => (!max || item.count > max.count ? item : max),
    null as null | { route_name: string; count: number }
  );

  const insightCards = [
    {
      label: 'Total Trips',
      value: totalTrips.toLocaleString(),
      meta: `Across ${period}`,
      icon: ArrowTrendingUpIcon,
      accent: 'from-indigo-500/10 to-indigo-500/0',
      iconBg: 'bg-indigo-500',
    },
    {
      label: 'On-Time Rate',
      value: `${analyticsData.performance_metrics.on_time_percentage}%`,
      meta: 'Current performance',
      icon: ChartBarIcon,
      accent: 'from-emerald-500/10 to-emerald-500/0',
      iconBg: 'bg-emerald-500',
    },
    {
      label: 'Peak Hour',
      value: peakHour ? `${peakHour.hour}:00` : '—',
      meta: peakHour ? `${peakHour.count} trips` : 'No data yet',
      icon: ClockIcon,
      accent: 'from-amber-500/10 to-amber-500/0',
      iconBg: 'bg-amber-500',
    },
    {
      label: 'Top Route',
      value: topRoute ? topRoute.route_name : '—',
      meta: topRoute ? `${topRoute.count} trips` : 'No data yet',
      icon: MapIcon,
      accent: 'from-fuchsia-500/10 to-fuchsia-500/0',
      iconBg: 'bg-fuchsia-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-indigo-500/10 via-white to-slate-50 px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Insights</p>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Real-time insights and performance metrics
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onDateChange={setDateRange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      )}

      {/* Quick Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {insightCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm bg-gradient-to-br ${card.accent}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{card.meta}</p>
                </div>
                <div className={`h-11 w-11 rounded-xl ${card.iconBg} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage Statistics */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
            Usage Statistics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Trip Counts ({period})
              </h3>
              <TripCountsChart
                data={
                  period === 'daily'
                    ? analyticsData.usage_stats.daily_trips
                    : period === 'weekly'
                    ? analyticsData.usage_stats.weekly_trips
                    : analyticsData.usage_stats.monthly_trips
                }
                period={period}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Peak Hours</h3>
              <PeakHoursChart data={analyticsData.usage_stats.peak_hours} />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Route Popularity</h3>
              <RoutePopularityChart data={analyticsData.usage_stats.route_popularity} />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-green-600" />
            Performance Metrics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <PerformanceMetrics
                onTimePercentage={analyticsData.performance_metrics.on_time_percentage}
                averageWaitTime={analyticsData.performance_metrics.average_wait_time}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bus Utilization</h3>
              <BusUtilizationChart data={analyticsData.performance_metrics.bus_utilization} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
