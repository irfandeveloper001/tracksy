import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import DashboardLayout from "../components/layout/DashboardLayout";
import MetricCard from "../components/ui/MetricCard";
import Button from "../components/ui/Button";
import Card, { CardHeader, CardBody } from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
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
  ExclamationCircleIcon,
  ArrowRightIcon,
  SparklesIcon
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
        <LoadingSpinner size="lg" text="Loading your dashboard..." fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <SparklesIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back!
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Hello, <span className="font-semibold text-indigo-600">{user?.name || "Student"}</span>! Here's your overview today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={<BookmarkIcon />}
            color="blue"
            subtitle="All time bookings"
            onClick={() => navigate('/bookings')}
          />

          <MetricCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon={<CheckCircleIcon />}
            color="green"
            subtitle="Currently active"
            onClick={() => navigate('/bookings')}
          />

          <MetricCard
            title="Completed Trips"
            value={stats.completedTrips}
            icon={<TruckIcon />}
            color="purple"
            subtitle="Successfully completed"
          />

          <MetricCard
            title="Upcoming Trips"
            value={stats.upcomingTrips}
            icon={<ClockIcon />}
            color="orange"
            subtitle="Scheduled ahead"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover onClick={() => navigate('/routes')} gradient>
              <CardBody className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                  <MapIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">Browse Routes</h3>
                  <p className="text-sm text-gray-600">{routes.length} available routes</p>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-400" />
              </CardBody>
            </Card>

            <Card hover onClick={() => navigate('/tracking')} gradient>
              <CardBody className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                  <TruckIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">Track Bus</h3>
                  <p className="text-sm text-gray-600">Real-time location</p>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-400" />
              </CardBody>
            </Card>

            <Card hover onClick={() => navigate('/bookings')} gradient>
              <CardBody className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                  <BookmarkIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">My Bookings</h3>
                  <p className="text-sm text-gray-600">View & manage</p>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-400" />
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
            <Link to="/bookings" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
              View All <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardBody>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <BookmarkIcon className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4 text-lg">No bookings yet</p>
                <Button 
                  variant="primary" 
                  icon={<MapIcon className="w-5 h-5" />}
                  onClick={() => navigate('/routes')}
                >
                  Browse Routes
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-indigo-300 transition-all duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">Booking #{booking.id}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>📅 {new Date(booking.booking_date).toLocaleDateString()}</span>
                        {booking.seat_number && (
                          <span>💺 Seat {booking.seat_number}</span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/bookings/${booking.id}`}
                      className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium flex items-center"
                    >
                      Details <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Available Routes Preview */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Available Routes</h3>
            <Link to="/routes" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
              View All <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <CardBody>
            {routes.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <MapIcon className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">No routes available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routes.slice(0, 3).map((route) => (
                  <Card 
                    key={route.id} 
                    hover
                    onClick={() => navigate(`/routes/${route.id}`)}
                    gradient
                  >
                    <CardBody>
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <MapIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{route.name}</h4>
                          <p className="text-sm text-gray-600">
                            {route.origin || route.start_point} → {route.destination || route.end_point}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Distance</p>
                          <p className="text-sm font-bold text-gray-900">
                            {route.distance ? `${(parseFloat(route.distance) / 1000).toFixed(1)} km` : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-bold text-gray-900">
                            {route.estimated_duration ? `${route.estimated_duration} min` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
