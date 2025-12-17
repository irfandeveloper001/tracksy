import { useNavigate } from 'react-router';
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
  const navigate = useNavigate();

  const statusItems = [
    {
      label: 'Active Buses',
      value: activeBuses,
      icon: TruckIcon,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/30',
      filter: 'active', // Filter for active status buses
      onClick: () => {
        console.log('🚌 Navigating to buses with active filter');
        navigate('/buses?status=active');
      },
    },
    {
      label: 'On Route',
      value: busesOnRoute,
      icon: CheckCircleIcon,
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      text: 'text-green-700',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      shadow: 'shadow-green-500/30',
      filter: 'on_route', // Filter for buses on route
      onClick: () => {
        console.log('🗺️ Navigating to buses with on_route filter');
        // Show active buses (buses on route are typically active)
        navigate('/buses?status=active');
      },
    },
    {
      label: 'With Issues',
      value: busesWithIssues,
      icon: ExclamationTriangleIcon,
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-50',
      text: 'text-red-700',
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      shadow: 'shadow-red-500/30',
      filter: 'issues', // Filter for buses with issues
      onClick: () => {
        console.log('⚠️ Navigating to buses with issues filter');
        // Navigate with maintenance status (buses with issues are typically in maintenance or emergency)
        navigate('/buses?status=maintenance');
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Real-time Status</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 font-medium">Live</span>
        </div>
          </div>
      <div className="space-y-4">
        {statusItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`group relative overflow-hidden w-full flex items-center justify-between p-4 ${item.bg} rounded-xl border border-transparent hover:border-gray-300 transition-all duration-300 hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-4 pointer-events-none">
                <div className={`${item.iconBg} p-3 rounded-xl text-white shadow-lg ${item.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6" />
        </div>
                <span className="text-sm font-semibold text-gray-700">{item.label}</span>
          </div>
              <div className="flex items-center space-x-3 pointer-events-none">
                <span className={`text-3xl font-bold ${item.text}`}>{item.value}</span>
                <div className={`w-1 h-12 ${item.bg} rounded-full opacity-50`}></div>
                {/* Arrow indicator */}
                <svg className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
        </div>
              {/* Animated background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


