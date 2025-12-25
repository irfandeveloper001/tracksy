import { useState, useEffect } from 'react';
import feeService from '../../lib/api/feeService';
import {
  DocumentTextIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function FeeReportsPage() {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    status: '',
    semester: '',
    startDate: '',
    endDate: '',
    feeType: '',
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await feeService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setExporting(true);
      const blob = await feeService.exportReport(format, reportFilters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fee-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert(`Report exported successfully as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. This feature may need backend implementation.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const collectionRate = statistics?.collection_rate || 0;
  const totalFees = parseFloat(statistics?.total_fees || 0);
  const totalPaid = parseFloat(statistics?.total_paid || 0);
  const pendingAmount = parseFloat(statistics?.pending_amount || 0);
  const overdueAmount = parseFloat(statistics?.overdue_amount || 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fee Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Generate comprehensive reports and analyze fee collection data</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalFees.toFixed(2)}</p>
            </div>
            <BanknotesIcon className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${totalPaid.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">{collectionRate.toFixed(1)}% rate</p>
            </div>
            <ArrowTrendingUpIcon className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${pendingAmount.toFixed(2)}</p>
            </div>
            <ChartBarIcon className="w-10 h-10 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${overdueAmount.toFixed(2)}</p>
              <p className="text-xs text-red-600 mt-1">{statistics?.students_with_pending_fees || 0} students</p>
            </div>
            <UserGroupIcon className="w-10 h-10 text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Collection Rate Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Collection Rate</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Collected</span>
              <span>{collectionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Collected</p>
              <p className="text-xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-xl font-bold text-red-600">${overdueAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Report Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <DocumentArrowDownIcon className="w-6 h-6" />
          <span>Export Report</span>
        </h2>
        
        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={reportFilters.status}
                onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
              <select
                value={reportFilters.feeType}
                onChange={(e) => setReportFilters({ ...reportFilters, feeType: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                <option value="transport">Transportation</option>
                <option value="tuition">Tuition</option>
                <option value="library">Library</option>
                <option value="hostel">Hostel</option>
                <option value="exam">Examination</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <input
                type="text"
                value={reportFilters.semester}
                onChange={(e) => setReportFilters({ ...reportFilters, semester: e.target.value })}
                placeholder="e.g., Spring 2025"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={reportFilters.startDate}
                onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={reportFilters.endDate}
                onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center space-x-4 pt-4 border-t">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {exporting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  <span>Export as CSV</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {exporting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  <span>Export as PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{statistics?.total_students || 0}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">With Pending Fees</p>
            <p className="text-2xl font-bold text-gray-900">{statistics?.students_with_pending_fees || 0}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Collection Rate</p>
            <p className="text-2xl font-bold text-gray-900">{collectionRate.toFixed(1)}%</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="text-2xl font-bold text-gray-900">${(totalFees - totalPaid).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <DocumentTextIcon className="w-8 h-8 text-indigo-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Fee Summary Report</h3>
            <p className="text-sm text-gray-600 mt-1">Overview of all fees by status and type</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <ChartBarIcon className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Collection Report</h3>
            <p className="text-sm text-gray-600 mt-1">Detailed payment collection analysis</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <CalendarIcon className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Overdue Report</h3>
            <p className="text-sm text-gray-600 mt-1">List of all overdue fees and students</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <UserGroupIcon className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Student Account Report</h3>
            <p className="text-sm text-gray-600 mt-1">Individual student fee accounts</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <BanknotesIcon className="w-8 h-8 text-yellow-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Revenue Report</h3>
            <p className="text-sm text-gray-600 mt-1">Financial revenue analysis</p>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <ArrowTrendingUpIcon className="w-8 h-8 text-red-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Trend Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">Fee collection trends over time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

