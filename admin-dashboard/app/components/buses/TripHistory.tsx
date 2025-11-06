import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface Trip {
  id: string;
  route_name?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  driver_name?: string;
}

interface TripHistoryProps {
  trips: Trip[];
}

export default function TripHistory({ trips }: TripHistoryProps) {
  if (trips.length === 0) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No trip history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <div
          key={trip.id}
          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPinIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {trip.route_name || 'Route'}
              </p>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  trip.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : trip.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {trip.status || 'unknown'}
              </span>
            </div>
            {trip.driver_name && (
              <p className="text-sm text-gray-500 mt-1">Driver: {trip.driver_name}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              {trip.start_time && (
                <span>
                  Start:{' '}
                  {formatDistanceToNow(new Date(trip.start_time), { addSuffix: true })}
                </span>
              )}
              {trip.end_time && (
                <span>
                  End: {formatDistanceToNow(new Date(trip.end_time), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

