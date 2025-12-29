import { useState, useEffect } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import DashboardLayout from "../components/layout/DashboardLayout";
import routeService from "../lib/api/routeService";
import authService from "../lib/api/authService";
import {
  MapIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
  TruckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function RoutesList() {
  const [user, setUser] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, routesData] = await Promise.all([
        authService.me(),
        routeService.getRoutes(),
      ]);
      setUser(userData);
      setRoutes(routesData);
    } catch (error: any) {
      toast.error("Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter((route) =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (route.origin && route.origin.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (route.destination && route.destination.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center">
                <MapIcon className="w-8 h-8 sm:w-10 sm:h-10 mr-3" />
                Available Routes
              </h1>
              <p className="text-indigo-100 text-base sm:text-lg">
                Discover and explore all available bus routes
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 sm:p-6 text-center">
                <p className="text-2xl sm:text-3xl font-bold">{routes.length}</p>
                <p className="text-xs sm:text-sm text-indigo-100">Total Routes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search routes by name, origin, or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Routes Grid */}
        {filteredRoutes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No routes found</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your search or check back later
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((route) => (
              <Link
                key={route.id}
                to={`/routes/${route.id}`}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
              >
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <TruckIcon className="w-8 h-8 text-white" />
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-semibold">
                        Active
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {route.name}
                    </h3>
                    <p className="text-indigo-100 text-sm">Route {route.id}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Journey */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPinIcon className="w-4 h-4 mr-1 text-green-500" />
                        Origin
                      </div>
                      <p className="font-semibold text-gray-900 truncate">
                        {route.origin || route.start_point || "N/A"}
                      </p>
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPinIcon className="w-4 h-4 mr-1 text-red-500" />
                        Destination
                      </div>
                      <p className="font-semibold text-gray-900 truncate">
                        {route.destination || route.end_point || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <MapIcon className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Distance</p>
                      <p className="text-sm font-bold text-gray-900">
                        {route.distance
                          ? `${(parseFloat(route.distance) / 1000).toFixed(1)} km`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <ClockIcon className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="text-sm font-bold text-gray-900">
                        {route.estimated_duration
                          ? `${route.estimated_duration} min`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold group-hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
                    <span>View Details</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
