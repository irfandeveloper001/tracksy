import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FunnelIcon, SignalIcon } from '@heroicons/react/24/outline';
import busService from '../../lib/api/busService';
import routeService from '../../lib/api/routeService';
import LiveMap from '../../components/map/LiveMap';

export default function LiveMapPage() {
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      <div className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Live Map</h1>
            <p className="mt-1 text-sm text-slate-500">
              Real-time monitoring of buses with offline-ready tiles.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <SignalIcon className="h-4 w-4" />
              Updates every 5s
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Route
              </label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
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
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-slate-700 rounded-full mr-2"></div>
                  <span>Active Buses: {filteredBuses.filter((b) => b.status === 'active').length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-slate-400 rounded-full mr-2"></div>
                  <span>Maintenance: {filteredBuses.filter((b) => b.status === 'maintenance').length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-slate-300 rounded-full mr-2"></div>
                  <span>Inactive: {filteredBuses.filter((b) => b.status === 'inactive').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Map */}
      <div className="rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200/70">
        <div className="relative">
          {isClient ? (
            <LiveMap
              buses={filteredBuses}
              routes={routes}
              selectedRoute={selectedRoute}
            />
          ) : (
            <div className="flex h-[600px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
              <div className="text-sm text-slate-500">Preparing map…</div>
            </div>
          )}
          <div className="absolute bottom-4 right-4 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Tiles</div>
            <div>OpenStreetMap (switchable to offline)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
