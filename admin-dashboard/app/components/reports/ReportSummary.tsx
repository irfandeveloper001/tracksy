import {
  TruckIcon,
  UserGroupIcon,
  MapIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { ReportData } from '../../lib/api/analyticsService';

interface ReportSummaryProps {
  report: ReportData;
  reportType: string;
}

export default function ReportSummary({ report, reportType }: ReportSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Operations Report
        </h2>
        <p className="text-sm text-gray-600">
          Generated on {new Date().toLocaleString()}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900">{report.total_trips}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {report.student_usage.active_students}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Buses</p>
              <p className="text-2xl font-bold text-gray-900">
                {report.bus_performance.active_buses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{report.incidents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Usage */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.student_usage.total_students}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Students</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.student_usage.active_students}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.student_usage.total_bookings}
            </p>
          </div>
        </div>
      </div>

      {/* Bus Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bus Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Buses</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.bus_performance.total_buses}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Buses</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.bus_performance.active_buses}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Utilization</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.bus_performance.average_utilization.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Route Efficiency */}
      {report.route_efficiency.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Efficiency</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trips
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Avg Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    On-Time %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.route_efficiency.map((route, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {route.route_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.trips_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.average_duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.on_time_percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Incidents */}
      {report.incidents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Incidents</h3>
          <div className="space-y-3">
            {report.incidents.map((incident) => (
              <div
                key={incident.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{incident.type}</p>
                    <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        incident.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : incident.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {incident.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(incident.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {report.financial_summary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${report.financial_summary.total_revenue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Costs</p>
              <p className="text-2xl font-bold text-red-600">
                ${report.financial_summary.total_costs.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold text-blue-600">
                ${report.financial_summary.net_profit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

