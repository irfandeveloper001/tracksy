import { formatDistanceToNow } from 'date-fns';
import {
  TruckIcon,
  UserIcon,
  MapIcon,
  BellIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export interface Activity {
  id: string;
  type: 'bus' | 'user' | 'route' | 'alert' | 'system';
  action: string;
  timestamp: string;
  user?: string;
}

interface ActivityFeedProps {
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

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No recent activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${getIconColor(activity.type)}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <div className="flex items-center mt-1 space-x-2">
                  {activity.user && (
                    <span className="text-xs text-gray-500">{activity.user}</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


