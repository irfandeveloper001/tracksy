import { TruckIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface StatusPanelProps {
  activeBuses: number;
  busesOnRoute: number;
  busesWithIssues: number;
}

export default function StatusPanel({
  activeBuses,
  busesOnRoute,
  busesWithIssues,
}: StatusPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Status</h3>
      <div className="space-y-4">
        {/* Active Buses */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <TruckIcon className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Active Buses</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">{activeBuses}</span>
        </div>

        {/* Buses on Route */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">On Route</span>
          </div>
          <span className="text-2xl font-bold text-green-600">{busesOnRoute}</span>
        </div>

        {/* Buses with Issues */}
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">With Issues</span>
          </div>
          <span className="text-2xl font-bold text-red-600">{busesWithIssues}</span>
        </div>
      </div>
    </div>
  );
}


