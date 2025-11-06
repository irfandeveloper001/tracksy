import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface Booking {
  id: string;
  route_name?: string;
  bus_number?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  pickup_location?: string;
  dropoff_location?: string;
}

interface BookingHistoryProps {
  bookings: Booking[];
}

export default function BookingHistory({ bookings }: BookingHistoryProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No booking history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
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
                {booking.route_name || 'Route'}
              </p>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  booking.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'active'
                    ? 'bg-blue-100 text-blue-800'
                    : booking.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {booking.status || 'unknown'}
              </span>
            </div>
            {booking.bus_number && (
              <p className="text-sm text-gray-500 mt-1">Bus: {booking.bus_number}</p>
            )}
            {booking.pickup_location && (
              <p className="text-sm text-gray-500 mt-1">
                Pickup: {booking.pickup_location}
              </p>
            )}
            {booking.dropoff_location && (
              <p className="text-sm text-gray-500 mt-1">
                Dropoff: {booking.dropoff_location}
              </p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              {booking.start_time && (
                <span>
                  Start:{' '}
                  {formatDistanceToNow(new Date(booking.start_time), { addSuffix: true })}
                </span>
              )}
              {booking.end_time && (
                <span>
                  End: {formatDistanceToNow(new Date(booking.end_time), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

