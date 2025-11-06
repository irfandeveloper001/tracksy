import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapIcon, FilterIcon } from '@heroicons/react/24/outline';
import busService from '../../lib/api/busService';
import routeService from '../../lib/api/routeService';
import LiveMap from '../../components/map/LiveMap';

export default function LiveMapPage() {
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all buses for map
  const { data: busesData, refetch: refetchBuses } = useQuery({
    queryKey: ['all-buses'],
    queryFn: () => busService.getBuses(1, 100), // Get all buses
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // Fetch routes for filter
  const { data: routesData } = useQuery({
    queryKey: ['routes-for-map'],
    queryFn: () => routeService.getRoutes(1, 100),
  });

  const buses = busesData?.buses || [];
  const routes = routesData?.routes || [];

  // Filter buses by selected route
  const filteredBuses =
    selectedRoute === 'all'
      ? buses
      : buses.filter((bus) => bus.route_id === selectedRoute);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Map</h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time monitoring of all buses on the map
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FilterIcon className="h-5 w-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Route
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Routes</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                  <span>Active Buses: {filteredBuses.filter((b) => b.status === 'active').length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full mr-2"></div>
                  <span>Maintenance: {filteredBuses.filter((b) => b.status === 'maintenance').length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-600 rounded-full mr-2"></div>
                  <span>Inactive: {filteredBuses.filter((b) => b.status === 'inactive').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Map */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <LiveMap
          buses={filteredBuses}
          routes={routes}
          selectedRoute={selectedRoute}
        />
      </div>
    </div>
  );
}
