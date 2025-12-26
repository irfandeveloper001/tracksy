import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../src/store/store";
import { getTripHistory, getTripDetails } from "../../../src/store/slices/tripSlice";
import Header from "../../../src/components/layouts/Header";
import Sidebar from "../../../src/components/layouts/Sidebar";
import {
  ClockIcon,
  MapIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function TripHistoryPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { tripHistory, totalTrips, currentPage, isLoading } = useSelector(
    (state: RootState) => state.trip
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    loadTripHistory();
  }, [dispatch, selectedDate]);

  const loadTripHistory = async () => {
    try {
      const params: any = { limit: 10, page: currentPage };
      if (selectedDate) {
        params.startDate = selectedDate;
        params.endDate = selectedDate;
      }
      await dispatch(getTripHistory(params));
    } catch (error) {
      console.warn('⚠️ Error loading trip history:', error);
    }
  };

  const handleViewDetails = async (tripId: number) => {
    try {
      await dispatch(getTripDetails(tripId));
      navigate(`/trip/${tripId}`);
    } catch (error) {
      console.error('Error loading trip details:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
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
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Trip History
                  </h1>
                  <p className="mt-2 text-gray-600">
                    View all your past trips and completed journeys
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate('')}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Total Trips</p>
                      <p className="text-3xl font-bold text-gray-900">{totalTrips}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <MapIcon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Completed</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {tripHistory.filter(t => t.status === 'completed').length}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">This Month</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {tripHistory.filter(t => {
                          const tripDate = t.start_time ? new Date(t.start_time) : null;
                          const now = new Date();
                          return tripDate && tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
                        }).length}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <CalendarIcon className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip List */}
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : tripHistory.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                    <ClockIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Trip History</h3>
                  <p className="text-gray-500">
                    Your trip history will appear here once you complete trips.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tripHistory.map((trip: any) => (
                    <div
                      key={trip.id}
                      className="group bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 ${getStatusColor(trip.status)}`}>
                                {getStatusIcon(trip.status)}
                                <span className="text-sm font-semibold capitalize">{trip.status || 'Unknown'}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="font-semibold">Trip #{trip.id}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Route</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {trip.route?.name || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Bus</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  #{trip.bus?.bus_number || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatDate(trip.start_time)} {formatTime(trip.start_time)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Duration</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatDuration(trip.start_time, trip.end_time)}
                                </p>
                              </div>
                            </div>

                            {trip.route && (
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className="font-semibold text-gray-900">
                                    {trip.route.start_location || trip.route.start_point || trip.route.origin || 'N/A'}
                                  </span>
                                  <ArrowRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="font-semibold text-gray-900">
                                    {trip.route.end_location || trip.route.end_point || trip.route.destination || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleViewDetails(trip.id)}
                            className="ml-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                          >
                            <span>View Details</span>
                            <ArrowRightIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}












