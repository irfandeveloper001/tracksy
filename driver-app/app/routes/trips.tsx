import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../src/store/store";
import { getCurrentTrip, endTrip } from "../../src/store/slices/tripSlice";
import Header from "../../src/components/layouts/Header";
import Sidebar from "../../src/components/layouts/Sidebar";
import {
  MapIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function TripsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentTrip, isLoading } = useSelector((state: RootState) => state.trip);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [endingTrip, setEndingTrip] = useState(false);

  useEffect(() => {
    loadCurrentTrip();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadCurrentTrip, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const loadCurrentTrip = async () => {
    try {
      await dispatch(getCurrentTrip());
    } catch (error) {
      console.warn('⚠️ Error loading current trip:', error);
    }
  };

  const handleEndTrip = async () => {
    if (!currentTrip || typeof currentTrip !== 'object' || !currentTrip.id) return;
    
    if (!window.confirm('Are you sure you want to end this trip?')) {
      return;
    }

    setEndingTrip(true);
    try {
      await dispatch(endTrip({
        tripId: currentTrip.id,
        data: {}
      })).unwrap();
      toast.success('Trip ended successfully');
      navigate('/trip/history');
    } catch (error: any) {
      toast.error(error || 'Failed to end trip');
    } finally {
      setEndingTrip(false);
    }
  };

  const formatDuration = (startTime?: string) => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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
                  My Trips
                </h1>
                <p className="mt-2 text-gray-600">
                  View and manage your active trip
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : currentTrip && typeof currentTrip === 'object' ? (
                <>
                  {/* Active Trip Card */}
                  <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border-2 border-indigo-200">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
                    
                    <div className="relative p-8">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                            <div className="relative bg-green-500 rounded-full p-3">
                              <PlayIcon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">Active Trip</h2>
                            <p className="text-sm text-gray-500">Trip ID: #{currentTrip.id}</p>
                          </div>
                        </div>
                        <span className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-sm font-semibold shadow-lg">
                          IN PROGRESS
                        </span>
                      </div>

                      {/* Trip Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <MapIcon className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Route</p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">
                            {currentTrip.route?.name || 'N/A'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <TruckIcon className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Bus</p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">
                            #{currentTrip.bus?.bus_number || 'N/A'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <ClockIcon className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Duration</p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">
                            {formatDuration(currentTrip.start_time)}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <MapPinIcon className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Started At</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {formatDate(currentTrip.start_time)}
                          </p>
                        </div>
                      </div>

                      {/* Route Information */}
                      {currentTrip.route && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 mb-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Route Details</h3>
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 mb-1">From</p>
                              <p className="text-base font-semibold text-gray-900">
                                {currentTrip.route.start_location || currentTrip.route.start_point || currentTrip.route.origin || 'N/A'}
                              </p>
                            </div>
                            <ArrowPathIcon className="h-6 w-6 text-indigo-500 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 mb-1">To</p>
                              <p className="text-base font-semibold text-gray-900">
                                {currentTrip.route.end_location || currentTrip.route.end_point || currentTrip.route.destination || 'N/A'}
                              </p>
                            </div>
                          </div>
                          {currentTrip.route.distance && (
                            <div className="mt-4 pt-4 border-t border-indigo-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Distance</span>
                                <span className="text-lg font-bold text-indigo-600">
                                  {(currentTrip.route.distance / 1000).toFixed(2)} km
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={handleEndTrip}
                          disabled={endingTrip}
                          className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <span className="relative z-10 flex items-center space-x-2">
                            <StopIcon className="h-5 w-5" />
                            <span>{endingTrip ? 'Ending Trip...' : 'End Trip'}</span>
                          </span>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <MapIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Trip</h3>
                  <p className="text-gray-500 mb-8">
                    You don't have an active trip at the moment. Start a new trip from the dashboard.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}





