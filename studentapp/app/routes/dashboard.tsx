import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import DashboardLayout from "../components/layout/DashboardLayout";
import authService from "../lib/api/authService";
import bookingService from "../lib/api/bookingService";
import routeService from "../lib/api/routeService";
import busService from "../lib/api/busService";
import toast from "react-hot-toast";
import { 
  MapIcon, 
  BookmarkIcon, 
  TruckIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedTrips: 0,
    upcomingTrips: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [userData, bookingsData, routesData, busesData] = await Promise.all([
        authService.me(),
        bookingService.getBookings().catch(() => []),
        routeService.getRoutes().catch(() => []),
        busService.getBuses().catch(() => []),
      ]);

      setUser(userData);
      setBookings(bookingsData);
      setRoutes(routesData);
      setBuses(busesData);

      // Calculate stats
      setStats({
        totalBookings: bookingsData.length,
        activeBookings: bookingsData.filter((b: any) => b.status === 'confirmed').length,
        completedTrips: bookingsData.filter((b: any) => b.status === 'completed').length,
        upcomingTrips: bookingsData.filter((b: any) => b.status === 'pending').length,
      });
    } catch (error: any) {
      console.error("Failed to load dashboard:", error);
      toast.error("Failed to load dashboard");
      if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold mt-2">{stats.totalBookings}</p>
              </div>
              <BookmarkIcon className="w-12 h-12 text-blue-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active Bookings</p>
                <p className="text-3xl font-bold mt-2">{stats.activeBookings}</p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-green-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Completed Trips</p>
                <p className="text-3xl font-bold mt-2">{stats.completedTrips}</p>
              </div>
              <TruckIcon className="w-12 h-12 text-purple-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Upcoming Trips</p>
                <p className="text-3xl font-bold mt-2">{stats.upcomingTrips}</p>
              </div>
              <ClockIcon className="w-12 h-12 text-orange-200 opacity-50" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/routes"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-indigo-500 transform hover:scale-105 duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <MapIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Browse Routes</h3>
                <p className="text-sm text-gray-600">{routes.length} available routes</p>
              </div>
            </div>
          </Link>

          <Link
            to="/tracking"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-green-500 transform hover:scale-105 duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TruckIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Track Bus</h3>
                <p className="text-sm text-gray-600">Real-time location</p>
              </div>
            </div>
          </Link>

          <Link
            to="/bookings"
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-purple-500 transform hover:scale-105 duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookmarkIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Bookings</h3>
                <p className="text-sm text-gray-600">View & manage</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <Link to="/bookings" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No bookings yet</p>
                <Link
                  to="/routes"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Browse Routes
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">Booking #{booking.id}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(booking.booking_date).toLocaleDateString()}
                      </p>
                      {booking.seat_number && (
                        <p className="text-sm text-gray-600">Seat: {booking.seat_number}</p>
                      )}
                    </div>
                    <Link
                      to={`/bookings/${booking.id}`}
                      className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Details →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Routes Preview */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Available Routes</h3>
            <Link to="/routes" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="p-6">
            {routes.length === 0 ? (
              <div className="text-center py-12">
                <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No routes available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routes.slice(0, 3).map((route) => (
                  <Link
                    key={route.id}
                    to={`/routes/${route.id}`}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-indigo-300 transform hover:scale-105 duration-200"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">{route.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {route.origin || route.start_point} → {route.destination || route.end_point}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{route.distance ? `${(parseFloat(route.distance) / 1000).toFixed(1)} km` : 'N/A'}</span>
                      <span>{route.estimated_duration ? `${route.estimated_duration} min` : 'N/A'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
