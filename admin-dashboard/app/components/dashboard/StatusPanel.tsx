import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TruckIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowRightIcon, MapIcon } from '@heroicons/react/24/outline';

interface StatusPanelProps {
  activeBuses: number;
  busesOnRoute: number;
  busesWithIssues: number;
  activeRoutes?: number;
}

export default function StatusPanel({
  activeBuses,
  busesOnRoute,
  busesWithIssues,
  activeRoutes = 0,
}: StatusPanelProps) {
  const navigate = useNavigate();
  const [clickedItem, setClickedItem] = useState<string | null>(null);

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
      borderHover: 'hover:border-blue-300',
      filter: 'active',
      type: 'buses',
      description: 'View all active buses in your fleet',
    },
    {
      label: 'Active Routes',
      value: activeRoutes,
      icon: MapIcon,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      shadow: 'shadow-purple-500/30',
      borderHover: 'hover:border-purple-300',
      filter: 'active',
      type: 'routes',
      description: 'View all active routes',
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
      borderHover: 'hover:border-green-300',
      filter: 'on_route',
      type: 'buses',
      description: 'Buses currently assigned to routes',
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
      borderHover: 'hover:border-red-300',
      filter: 'issues',
      type: 'buses',
      description: 'Buses requiring maintenance or attention',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Real-time Status</h3>
          <p className="text-xs text-gray-500 mt-1">Click any item to view details</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 font-medium">Live</span>
        </div>
      </div>
      <div className="space-y-4">
        {statusItems.map((item, index) => {
          const Icon = item.icon;
          const isClicked = clickedItem === item.label;
          const isEmpty = item.value === 0;
          
          // Build navigation URL based on type and filter
          const getNavigationUrl = () => {
            if (item.type === 'routes') {
              if (item.filter === 'active') return '/routes?status=active';
              return '/routes';
            } else {
              // buses
            if (item.filter === 'active') return '/buses?status=active';
            if (item.filter === 'on_route') return '/buses?status=active';
            if (item.filter === 'issues') return '/buses?status=maintenance';
            return '/buses';
            }
          };

          const navUrl = getNavigationUrl();
          
          // Render empty state (non-clickable)
          if (isEmpty) {
            return (
              <div
                key={item.label}
                className={`group relative overflow-hidden w-full flex items-center justify-between p-5 ${item.bg} rounded-xl border-2 border-gray-200 cursor-not-allowed opacity-60 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-left-4`}
                style={{ 
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-center space-x-4 relative z-10 pointer-events-none">
                  <div className={`${item.iconBg} p-3 rounded-xl text-white shadow-lg ${item.shadow}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-gray-800">{item.label}</span>
                    <span className="text-xs mt-0.5 text-gray-400">
                      {item.type === 'routes' ? 'No routes available' : 'No buses available'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 relative z-10 pointer-events-none">
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${item.text} opacity-50`}>
                      {item.value}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          
          // Render clickable button for non-empty items
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                console.log('🖱️ Card clicked:', item.label, 'Navigating to:', navUrl);
                setClickedItem(item.label);
                // Try React Router navigation first
                try {
                  navigate(navUrl);
                  // Fallback after short delay if navigation didn't work
                  setTimeout(() => {
                    if (window.location.pathname + window.location.search !== navUrl) {
                      console.warn('⚠️ React Router navigation failed, using window.location');
                      window.location.href = navUrl;
                    }
                  }, 100);
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  // Fallback to window.location
                  window.location.href = navUrl;
                }
              }}
              className={`group relative overflow-hidden w-full flex items-center justify-between p-5 ${item.bg} rounded-xl border-2 border-transparent ${item.borderHover} cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 animate-in fade-in slide-in-from-left-4`}
              style={{ 
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Click animation overlay */}
              {isClicked && (
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 animate-pulse pointer-events-none`}></div>
              )}
              
              {/* Left side - Icon and Label */}
              <div className="flex items-center space-x-4 relative z-0 pointer-events-none">
                <div className={`${item.iconBg} p-3 rounded-xl text-white shadow-lg ${item.shadow} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-gray-800">{item.label}</span>
                  <span className="text-xs mt-0.5 text-gray-600">
                    {item.description}
                  </span>
                </div>
              </div>
              
              {/* Right side - Value and Arrow */}
              <div className="flex items-center space-x-4 relative z-0 pointer-events-none">
                <div className="text-right">
                  <div className={`text-4xl font-bold ${item.text} transition-all duration-300 group-hover:scale-110`}>
                    {item.value}
                  </div>
                </div>
                
                  <div className={`flex items-center transition-all duration-300 ${
                    isClicked ? 'translate-x-2' : 'group-hover:translate-x-1'
                  }`}>
                    <ArrowRightIcon className={`w-6 h-6 ${item.text.replace('text-', 'text-').replace('-700', '-600')} transition-opacity duration-300 ${
                      isClicked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`} />
                  </div>
              </div>
              
              {/* Animated background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none z-0`}></div>
              
              {/* Ripple effect on click */}
              {isClicked && (
                <div className="absolute inset-0 bg-white/30 rounded-xl animate-ping pointer-events-none z-0"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
