import { useState, useEffect } from "react";
import { Link } from "react-router";
import DashboardLayout from "../../components/layout/DashboardLayout";
import routeService from "../../lib/api/routeService";
import authService from "../../lib/api/authService";
import toast from "react-hot-toast";
import { MapIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Routes() {
  const [user, setUser] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = routes.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route.origin || route.start_point || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route.destination || route.end_point || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoutes(filtered);
    } else {
      setFilteredRoutes(routes);
    }
  }, [searchTerm, routes]);

  const loadData = async () => {
    try {
      const [userData, routesData] = await Promise.all([
        authService.me(),
        routeService.getRoutes(),
      ]);
      setUser(userData);
      setRoutes(routesData);
      setFilteredRoutes(routesData);
    } catch (error) {
      toast.error("Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading routes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Routes</h1>
          <p className="text-gray-600">Browse and book your preferred routes</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search routes by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Routes Grid */}
        {filteredRoutes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No routes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((route) => (
              <Link
                key={route.id}
                to={`/routes/${route.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-500 transform hover:scale-105 duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{route.name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500">From</p>
                        <p className="text-gray-900 font-medium">{route.origin || route.start_point}</p>
                      </div>
                    </div>
                    <div className="ml-4 border-l-2 border-gray-300 h-6"></div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-500">To</p>
                        <p className="text-gray-900 font-medium">{route.destination || route.end_point}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm">
                      <p className="text-gray-500">Distance</p>
                      <p className="font-semibold text-gray-900">
                        {route.distance ? `${(parseFloat(route.distance) / 1000).toFixed(1)} km` : 'N/A'}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">
                        {route.estimated_duration ? `${route.estimated_duration} min` : 'N/A'}
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
