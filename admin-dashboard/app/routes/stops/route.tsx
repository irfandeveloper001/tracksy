import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { MapPinIcon, PlusIcon } from '@heroicons/react/24/outline';
import routeService from '../../lib/api/routeService';

export default function StopsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // Fetch all stops
  const { data, isLoading } = useQuery({
    queryKey: ['stops', page],
    queryFn: () => routeService.getAllStops(page, 50),
  });

  const stops = data?.stops || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <MapPinIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Stops Management</h1>
                  <p className="text-white/90 text-lg mt-1">
                    {total} {total === 1 ? 'stop' : 'stops'} in the system
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : stops.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No stops found</h3>
          <p className="text-sm text-gray-500">Get started by creating stops for your routes.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {stops.map((stop: any) => (
              <div
                key={stop.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900">{stop.name}</h3>
                <p className="text-sm text-gray-600">{stop.address}</p>
                {stop.latitude && stop.longitude && (
                  <p className="text-xs text-gray-500 mt-1">
                    {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
