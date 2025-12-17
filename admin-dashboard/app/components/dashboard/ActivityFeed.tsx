import { formatDistanceToNow } from 'date-fns';
import {
  TruckIcon,
  UserIcon,
  MapIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
// Define Activity type locally
type Activity = {
  id: string;
  type: 'bus' | 'user' | 'route' | 'alert' | 'system';
  action: string;
  timestamp: string;
  user?: string;
};

export interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'bus':
        return TruckIcon;
      case 'user':
        return UserIcon;
      case 'route':
        return MapIcon;
      case 'alert':
        return ExclamationTriangleIcon;
      default:
        return BellIcon;
    }
  };

  const getIconColor = (type: Activity['type']) => {
    switch (type) {
      case 'bus':
        return 'text-blue-600 bg-blue-50';
      case 'user':
        return 'text-green-600 bg-green-50';
      case 'route':
        return 'text-purple-600 bg-purple-50';
      case 'alert':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const iconConfig = {
    bus: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
    user: { gradient: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-700' },
    route: { gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700' },
    alert: { gradient: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-700' },
    system: { gradient: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-700' },
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h3>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <BellIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No recent activities</p>
          <p className="text-sm text-gray-400 mt-1">Activities will appear here as they occur</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
          {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
        </span>
      </div>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = getIcon(activity.type);
          const config = iconConfig[activity.type] || iconConfig.system;
          return (
            <div
              key={activity.id}
              className="group flex items-start space-x-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-300 hover:scale-[1.01]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`relative ${config.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300`}></div>
                <Icon className={`relative h-5 w-5 ${config.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 group-hover:text-gray-950 transition-colors">
                  {activity.action}
                </p>
                <div className="flex items-center mt-2 space-x-3">
                  {activity.user && (
                    <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {activity.user}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 font-medium">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
              {/* Timeline connector */}
              {index < activities.length - 1 && (
                <div className="absolute left-8 top-12 w-0.5 h-8 bg-gray-200 -ml-4"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


