import {
  TruckIcon,
  UserGroupIcon,
  MapIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { ReportData } from '../../lib/api/analyticsService';

interface ReportSummaryProps {
  report: ReportData;
  reportType: string;
}

export default function ReportSummary({ report, reportType }: ReportSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-indigo-500/10 via-white to-slate-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Report</p>
            <h2 className="text-2xl font-semibold text-gray-900">
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Operations Report
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ClockIcon className="h-4 w-4" />
            Snapshot view
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Trips',
            value: report.total_trips,
            icon: ClockIcon,
            accent: 'from-indigo-500/10 to-indigo-500/0',
            iconBg: 'bg-indigo-500',
          },
          {
            label: 'Active Students',
            value: report.student_usage.active_students,
            icon: UserGroupIcon,
            accent: 'from-emerald-500/10 to-emerald-500/0',
            iconBg: 'bg-emerald-500',
          },
          {
            label: 'Active Buses',
            value: report.bus_performance.active_buses,
            icon: TruckIcon,
            accent: 'from-fuchsia-500/10 to-fuchsia-500/0',
            iconBg: 'bg-fuchsia-500',
          },
          {
            label: 'Incidents',
            value: report.incidents.length,
            icon: ExclamationTriangleIcon,
            accent: 'from-amber-500/10 to-amber-500/0',
            iconBg: 'bg-amber-500',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm bg-gradient-to-br ${item.accent}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
                <div className={`h-11 w-11 rounded-xl ${item.iconBg} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Usage */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Students', value: report.student_usage.total_students },
            { label: 'Active Students', value: report.student_usage.active_students },
            { label: 'Total Bookings', value: report.student_usage.total_bookings },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bus Performance */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bus Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Buses', value: report.bus_performance.total_buses },
            { label: 'Active Buses', value: report.bus_performance.active_buses },
            { label: 'Average Utilization', value: `${report.bus_performance.average_utilization.toFixed(1)}%` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Route Efficiency */}
      {report.route_efficiency.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
