import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../src/store/store";
import { getAssignedRoute, getRouteStops } from "../../src/store/slices/routeSlice";
import { getCurrentUser } from "../../src/store/slices/authSlice";
import Header from "../../src/components/layouts/Header";
import Sidebar from "../../src/components/layouts/Sidebar";
import {
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function RoutePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { assignedRoute, stops, isLoading } = useSelector(
    (state: RootState) => state.route
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadRouteData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRouteData, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const loadRouteData = async () => {
    try {
      await Promise.allSettled([
        dispatch(getCurrentUser()),
        dispatch(getAssignedRoute()),
        dispatch(getRouteStops()),
      ]);
    } catch (error) {
      console.warn('⚠️ Error loading route data:', error);
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return 'N/A';
    const km = (meters / 1000).toFixed(2);
    return `${km} km`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 lg:ml-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My Route
                </h1>
                <p className="mt-2 text-gray-600">
                  View your assigned route and stops
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : assignedRoute ? (
                <>
                  {/* Route Information Card */}
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {assignedRoute.name || 'Unnamed Route'}
                      </h2>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <MapPinIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Distance</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatDistance(assignedRoute.distance)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <ClockIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estimated Duration</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatDuration(assignedRoute.estimated_duration)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <MapPinIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Stops</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {stops.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500 mb-1">Start Location</p>
                          <p className="text-base text-gray-900">
                            {assignedRoute.start_location || assignedRoute.start_point || assignedRoute.origin || 'N/A'}
                          </p>
                        </div>
                        <ChevronRightIcon className="h-6 w-6 text-gray-400 mt-6" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500 mb-1">End Location</p>
                          <p className="text-base text-gray-900">
                            {assignedRoute.end_location || assignedRoute.end_point || assignedRoute.destination || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stops List */}
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Route Stops ({stops.length})
                    </h3>

                    {stops.length > 0 ? (
                      <div className="space-y-4">
                        {stops.map((stop: any, index: number) => (
                          <div
                            key={stop.id}
                            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {index + 1}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{stop.name}</p>
                              <p className="text-sm text-gray-500">{stop.address}</p>
                              {stop.estimated_arrival_time && (
                                <p className="text-xs text-indigo-600 mt-1">
                                  ETA: {new Date(stop.estimated_arrival_time).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                            {stop.arrived && (
                              <CheckCircleIcon className="h-6 w-6 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No stops assigned to this route</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-12 text-center">
                  <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Route Assigned</h3>
                  <p className="text-gray-500 mb-6">
                    You don't have an assigned route yet. Please contact your administrator.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}











