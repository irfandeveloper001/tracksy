import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import analyticsService from '../../lib/api/analyticsService';
import DateRangePicker from '../../components/analytics/DateRangePicker';
import ReportSummary from '../../components/reports/ReportSummary';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Fetch report data
  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['report', reportType, dateRange.start, dateRange.end],
    queryFn: () =>
      analyticsService.getReport(reportType, dateRange.start, dateRange.end),
    enabled: reportType !== 'custom' || (!!dateRange.start && !!dateRange.end),
  });

  // Schedule report mutation
  const scheduleMutation = useMutation({
    mutationFn: ({ email, schedule }: { email: string; schedule: string }) =>
      analyticsService.scheduleReport(reportType, email, schedule),
    onSuccess: () => {
      toast.success('Report scheduled successfully');
      setShowScheduleModal(false);
      setScheduleEmail('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to schedule report');
    },
  });

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const blob = await analyticsService.exportReport(
        reportType,
        format,
        dateRange.start,
        dateRange.end
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${dateRange.start}-${dateRange.end}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to export report');
    }
  };

  const handleSchedule = () => {
    if (!scheduleEmail) {
      toast.error('Please enter an email address');
      return;
    }
    scheduleMutation.mutate({
      email: scheduleEmail,
      schedule: 'daily', // Can be enhanced with schedule options
    });
  };

  const reportData = report || {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Generate and export comprehensive reports
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <EnvelopeIcon className="h-5 w-5 mr-2" />
            Schedule Report
          </button>
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

      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-3 rounded-lg border-2 transition-colors ${
              reportType === 'daily'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <DocumentTextIcon className="h-6 w-6 mx-auto mb-2" />
            <p className="font-medium">Daily Report</p>
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`px-4 py-3 rounded-lg border-2 transition-colors ${
              reportType === 'weekly'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <DocumentTextIcon className="h-6 w-6 mx-auto mb-2" />
            <p className="font-medium">Weekly Report</p>
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-3 rounded-lg border-2 transition-colors ${
              reportType === 'monthly'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <DocumentTextIcon className="h-6 w-6 mx-auto mb-2" />
            <p className="font-medium">Monthly Report</p>
          </button>
          <button
            onClick={() => setReportType('custom')}
            className={`px-4 py-3 rounded-lg border-2 transition-colors ${
              reportType === 'custom'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <CalendarIcon className="h-6 w-6 mx-auto mb-2" />
            <p className="font-medium">Custom Range</p>
          </button>
        </div>

        {/* Date Range for Custom */}
        {reportType === 'custom' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateRangePicker
              startDate={dateRange.start}
              endDate={dateRange.end}
              onDateChange={setDateRange}
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Generating report...</span>
        </div>
      )}

      {/* Report Summary */}
      {!isLoading && <ReportSummary report={reportData} reportType={reportType} />}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={scheduleEmail}
                  onChange={(e) => setScheduleEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={scheduleMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
