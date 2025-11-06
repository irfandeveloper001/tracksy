import { PencilIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Stop } from '../../lib/api/routeService';

interface StopsListProps {
  stops: Stop[];
  onEdit: (stopId: string) => void;
  onDelete: (stopId: string) => void;
}

export default function StopsList({ stops, onEdit, onDelete }: StopsListProps) {
  if (stops.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No stops added yet</p>
        <p className="text-sm text-gray-400 mt-1">Add stops to create a route</p>
      </div>
    );
  }

  // Sort stops by sequence
  const sortedStops = [...stops].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-3">
      {sortedStops.map((stop, index) => (
        <div
          key={stop.id}
          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">{stop.sequence}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">{stop.name}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(stop.id)}
                  className="text-yellow-600 hover:text-yellow-900"
                  title="Edit Stop"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(stop.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Stop"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{stop.address}</p>
            {stop.estimated_arrival_time !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                Arrival: ~{stop.estimated_arrival_time} min
              </p>
            )}
            {stop.student_count !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                Students: {stop.student_count}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

