import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../src/store/store";
import {
  getCurrentTrip,
  getTripHistory,
} from "../../src/store/slices/tripSlice";
import { getCurrentUser } from "../../src/store/slices/authSlice";
import { getUnreadCount } from "../../src/store/slices/notificationSlice";
import Header from "../../src/components/layouts/Header";
import Sidebar from "../../src/components/layouts/Sidebar";
import MetricCard from "../../src/components/dashboard/MetricCard";
import {
  TruckIcon,
  BellIcon,
  IdentificationIcon,
  MapIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { currentTrip, tripHistory, isLoading } = useSelector(
    (state: RootState) => state.trip
  );
  const { unreadCount } = useSelector(
    (state: RootState) => state.notification
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check authentication on client side
    const checkAuth = async () => {
      const token = localStorage.getItem('@tracksy_driver:auth_token');
      if (!token) {
        navigate("/login");
        return;
      }
      // If not authenticated in Redux, try to get user
      if (!isAuthenticated && token) {
        await dispatch(getCurrentUser());
      }
    };
    checkAuth();
    loadDashboardData();
  }, [dispatch, navigate, isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      await Promise.allSettled([
        dispatch(getCurrentUser()),
        dispatch(getCurrentTrip()),
        dispatch(getTripHistory({ limit: 5 })),
        dispatch(getUnreadCount()),
      ]);
    } catch (error) {
      console.warn('⚠️ Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const hasActiveTrip = currentTrip && typeof currentTrip === 'object' ? true : currentTrip ? true : false;
  const tripCount = tripHistory && Array.isArray(tripHistory) ? tripHistory.length : 0;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Welcome back, <span className="font-semibold text-indigo-600">{user?.name || "Driver"}</span>
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Current Trip Card */}
                <MetricCard
                  title="Current Trip"
                  value={hasActiveTrip ? "Active" : "No Active Trip"}
                  icon={<MapIcon />}
                  color={hasActiveTrip ? "green" : "gray"}
                />

                {/* Notifications Card */}
                <MetricCard
                  title="Notifications"
                  value={typeof unreadCount === 'number' ? unreadCount : 0}
                  icon={<BellIcon />}
                  color={unreadCount > 0 ? "yellow" : "blue"}
                />

                {/* Driver ID Card */}
                <MetricCard
                  title="Driver ID"
                  value={user?.driver_id ? String(user.driver_id) : "N/A"}
                  icon={<IdentificationIcon />}
                  color="indigo"
                />

                {/* Trip History Card */}
                <MetricCard
                  title="Total Trips"
                  value={tripCount}
                  icon={<ClockIcon />}
                  color="purple"
                />

                {/* Assigned Bus Card */}
                <MetricCard
                  title="Assigned Bus"
                  value={user?.assigned_bus?.bus_number || "Not Assigned"}
                  icon={<TruckIcon />}
                  color={user?.assigned_bus ? "green" : "gray"}
                />
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <button
                    onClick={() => navigate("/trips")}
                    className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <MapIcon className="h-5 w-5 mr-2" />
                      My Trips
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>

                  <button
                    onClick={() => navigate("/trip/history")}
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 mr-2" />
                      Trip History
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>

                  <button
                    onClick={() => navigate("/profile")}
                    className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      Profile
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>

                </div>
              </div>

              {/* Loading Indicator */}
              {isLoading && (
                <div className="mt-8 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}



