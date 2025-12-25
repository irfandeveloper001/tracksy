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
      toast.loading(`Generating ${format.toUpperCase()} report...`);
      
      // Generate actual file download
      if (format === 'excel') {
        await downloadExcelReport();
      } else {
        await downloadPDFReport();
      }
      
      toast.dismiss();
      toast.success(`${format.toUpperCase()} report downloaded successfully!`, {
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error('Failed to download report. Please try again.', { duration: 3000 });
    }
  };

  const downloadExcelReport = async () => {
    // Create CSV content (Excel-compatible)
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tracksy-report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDFReport = async () => {
    // Create HTML content for PDF
    const htmlContent = generatePDFContent();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const generateCSVContent = () => {
    const data = reportData;
    let csv = 'Tracksy Bus Tracking System - Daily Operations Report\n\n';
    csv += `Generated on: ${new Date().toLocaleString()}\n\n`;
    
    // Summary Statistics
    csv += 'Summary Statistics\n';
    csv += 'Metric,Value\n';
    csv += `Total Trips,${data.total_trips}\n`;
    csv += `Total Students,${data.student_usage.total_students}\n`;
    csv += `Active Students,${data.student_usage.active_students}\n`;
    csv += `Total Bookings,${data.student_usage.total_bookings}\n`;
    csv += `Total Buses,${data.bus_performance.total_buses}\n`;
    csv += `Active Buses,${data.bus_performance.active_buses}\n`;
    csv += `Average Utilization,${data.bus_performance.average_utilization}%\n\n`;
    
    // Route Efficiency
    if (data.route_efficiency.length > 0) {
      csv += 'Route Efficiency\n';
      csv += 'Route Name,Trips Count,Avg Duration (min),On-Time %\n';
      data.route_efficiency.forEach(route => {
        csv += `${route.route_name},${route.trips_count},${route.average_duration},${route.on_time_percentage}%\n`;
      });
      csv += '\n';
    }
    
    // Incidents
    if (data.incidents.length > 0) {
      csv += 'Incidents\n';
      csv += 'Type,Description,Timestamp,Status\n';
      data.incidents.forEach(incident => {
        csv += `${incident.type},${incident.description},${incident.timestamp},${incident.status}\n`;
      });
    }
    
    return csv;
  };

  const generatePDFContent = () => {
    const data = reportData;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tracksy Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #4F46E5;
            margin: 0;
          }
          .header p {
            color: #666;
            margin: 10px 0 0 0;
          }
          .section {
            margin: 30px 0;
          }
          .section h2 {
            color: #4F46E5;
            border-bottom: 2px solid #E5E7EB;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #E5E7EB;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #4F46E5;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #F9FAFB;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .stat-box {
            border: 1px solid #E5E7EB;
            padding: 20px;
            border-radius: 8px;
            background: #F9FAFB;
          }
          .stat-label {
            color: #666;
            font-size: 14px;
          }
          .stat-value {
            color: #4F46E5;
            font-size: 24px;
            font-weight: bold;
            margin-top: 5px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚌 Tracksy Bus Tracking System</h1>
          <p><strong>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Operations Report</strong></p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <h2>📊 Summary Statistics</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Total Trips</div>
              <div class="stat-value">${data.total_trips}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Active Students</div>
              <div class="stat-value">${data.student_usage.active_students}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total Bookings</div>
              <div class="stat-value">${data.student_usage.total_bookings}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Active Buses</div>
              <div class="stat-value">${data.bus_performance.active_buses}</div>
            </div>
          </div>
        </div>

        ${data.route_efficiency.length > 0 ? `
        <div class="section">
          <h2>🗺️ Route Efficiency</h2>
          <table>
            <thead>
              <tr>
                <th>Route Name</th>
                <th>Trips Count</th>
                <th>Avg Duration (min)</th>
                <th>On-Time %</th>
              </tr>
            </thead>
            <tbody>
              ${data.route_efficiency.map(route => `
                <tr>
                  <td>${route.route_name}</td>
                  <td>${route.trips_count}</td>
                  <td>${route.average_duration}</td>
                  <td>${route.on_time_percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.incidents.length > 0 ? `
        <div class="section">
          <h2>⚠️ Incidents Report</h2>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.incidents.map(incident => `
                <tr>
                  <td>${incident.type}</td>
                  <td>${incident.description}</td>
                  <td>${new Date(incident.timestamp).toLocaleString()}</td>
                  <td>${incident.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="section">
          <p style="text-align: center; color: #666; margin-top: 40px;">
            <strong>Tracksy Bus Tracking System</strong><br>
            Professional Bus Management Solution
          </p>
        </div>
      </body>
      </html>
    `;
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
    <div className="space-y-6 animate-in fade-in duration-300 p-6">
      {/* Header with gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <DocumentTextIcon className="w-10 h-10 mr-3" />
                Generate Reports
              </h1>
              <p className="text-indigo-100 text-lg">Create and export comprehensive analytics reports</p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 text-center">
                <p className="text-3xl font-bold">📊</p>
                <p className="text-sm text-indigo-100 mt-1">Analytics</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleExport('excel')}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <EnvelopeIcon className="w-5 h-5" />
              <span>Schedule Report</span>
            </button>
          </div>
        </div>
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Report Type Selection */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Report Type</h2>
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
    </div>
  );
}
