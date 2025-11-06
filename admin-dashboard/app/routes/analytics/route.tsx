import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
