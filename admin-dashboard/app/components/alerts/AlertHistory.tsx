import { ClockIcon, CheckCircleIcon, XCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface HistoryEntry {
  id: string;
  action: string;
  user?: string;
  timestamp: string;
  notes?: string;
}

interface AlertHistoryProps {
  history: HistoryEntry[];
}

export default function AlertHistory({ history }: AlertHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No history available</p>
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    if (action.includes('acknowledge')) {
      return CheckCircleIcon;
    }
    if (action.includes('resolve')) {
      return XCircleIcon;
    }
    return ClockIcon;
  };

  const getActionColor = (action: string) => {
    if (action.includes('acknowledge')) {
      return 'text-yellow-600 bg-yellow-50';
    }
    if (action.includes('resolve')) {
      return 'text-green-600 bg-green-50';
    }
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="space-y-4">
      {history.map((entry) => {
        const Icon = getActionIcon(entry.action);
        return (
          <div
            key={entry.id}
            className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
          >
            <div className={`p-2 rounded-lg ${getActionColor(entry.action)}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {entry.action.replace('_', ' ')}
                </p>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                </span>
              </div>
              {entry.user && (
                <div className="flex items-center mt-1">
                  <UserIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">{entry.user}</span>
                </div>
              )}
              {entry.notes && (
                <p className="text-sm text-gray-600 mt-2">{entry.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

