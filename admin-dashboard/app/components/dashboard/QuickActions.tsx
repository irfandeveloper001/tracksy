import { useNavigate } from 'react-router';
import {
  TruckIcon,
  MapIcon,
  BellIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      name: 'Add New Bus',
      icon: TruckIcon,
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-600 to-blue-700',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/30',
      route: '/buses/new',
    },
    {
      name: 'Create Route',
      icon: MapIcon,
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'from-green-600 to-green-700',
      bg: 'bg-green-50',
      text: 'text-green-700',
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      shadow: 'shadow-green-500/30',
      route: '/routes/new',
    },
    {
      name: 'Generate Invoice',
      icon: ReceiptPercentIcon,
      gradient: 'from-indigo-500 to-purple-600',
      hoverGradient: 'from-indigo-600 to-purple-700',
      bg: 'bg-gradient-to-br from-indigo-50 to-purple-50',
      text: 'text-indigo-700',
      iconBg: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600',
      shadow: 'shadow-indigo-500/40',
      route: '/fees/invoices',
      featured: true,
    },
    {
      name: 'Send Announcement',
      icon: BellIcon,
      gradient: 'from-yellow-500 to-yellow-600',
      hoverGradient: 'from-yellow-600 to-yellow-700',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      shadow: 'shadow-yellow-500/30',
      route: '/notifications/new',
    },
    {
      name: 'Generate Report',
      icon: DocumentArrowDownIcon,
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/30',
      route: '/reports',
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-8 hover:shadow-2xl transition-all duration-500">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
          <SparklesIcon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Quick Actions
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={action.name}
              type="button"
              onClick={() => {
                console.log('🔘 Quick Action clicked:', action.name);
                console.log('📍 Navigating to:', action.route);
                navigate(action.route);
              }}
              className={`
                group relative overflow-hidden cursor-pointer
                flex items-center space-x-4 p-5 rounded-2xl border-2 border-transparent
                ${action.bg} hover:border-gray-300 backdrop-blur-sm
                transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl ${action.shadow}
                focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2
                ${action.featured ? 'ring-2 ring-indigo-500/50 border-indigo-200' : ''}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
              
              {/* Icon */}
              <div className={`relative z-10 ${action.iconBg} p-3 rounded-lg text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 pointer-events-none`}>
                <Icon className="h-5 w-5" />
              </div>
              
              {/* Text */}
              <div className="flex-1 flex items-center space-x-2">
                <span className={`relative z-10 text-sm font-semibold ${action.text} group-hover:translate-x-1 transition-transform duration-300 pointer-events-none`}>
                  {action.name}
                </span>
                {action.featured && (
                  <span className="relative z-10 px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-sm animate-pulse pointer-events-none">
                    NEW
                  </span>
                )}
              </div>
              
              {/* Arrow indicator */}
              <div className="relative z-10 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


