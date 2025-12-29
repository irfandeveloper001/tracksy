import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card, { CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import bookingService from "../lib/api/bookingService";
import authService from "../lib/api/authService";
import toast from "react-hot-toast";
import { 
  BookmarkIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  MapIcon,
  CalendarIcon,
  TicketIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function Bookings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, bookingsData] = await Promise.all([
        authService.me(),
        bookingService.getBookings(),
      ]);
      setUser(userData);
      setBookings(bookingsData);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'rejected': return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'completed': return <CheckCircleIcon className="w-5 h-5 text-blue-600" />;
      case 'pending': return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default: return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <LoadingSpinner size="lg" text="Loading your bookings..." fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <BookmarkIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-lg text-gray-600">Manage and track your bus reservations</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <Card>
          <CardBody className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Bookings', count: bookings.length },
              { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
              { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
              { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
              { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
              { key: 'rejected', label: 'Rejected', count: bookings.filter(b => b.status === 'rejected').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} 
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.key ? 'bg-white/20' : 'bg-gray-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </CardBody>
        </Card>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="inline-flex p-6 bg-purple-100 rounded-full mb-4">
                <BookmarkIcon className="w-16 h-16 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Start by browsing available routes and make your first booking' 
                  : 'No bookings found with this status'}
              </p>
              <Button 
                variant="primary" 
                icon={<MapIcon className="w-5 h-5" />}
                onClick={() => navigate('/routes')}
              >
                Browse Routes
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} hover gradient>
                <CardBody>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left Side - Booking Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          {getStatusIcon(booking.status)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">Booking #{booking.id}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(booking.status)}`}>
                              {booking.status.toUpperCase()}
                            </span>
                            {booking.status === 'pending' && (
                              <span className="text-xs text-yellow-600 font-medium">
                                Waiting for admin approval
                              </span>
                            )}
                            {booking.status === 'rejected' && booking.rejection_reason && (
                              <span className="text-xs text-red-600 font-medium">
                                Reason: {booking.rejection_reason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Booking Date</p>
                            <p className="font-bold text-gray-900">
                              {new Date(booking.trip_date || booking.booking_date || booking.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {booking.seat_number && (
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <TicketIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Seat Number</p>
                              <p className="font-bold text-gray-900">{booking.seat_number}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <ClockIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Created On</p>
                            <p className="font-bold text-gray-900">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side - Action Button */}
                    <div className="flex md:flex-col gap-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                        className="w-full"
                      >
                        <span className="flex items-center">
                          View Details
                          <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </span>
                      </Button>
                      {booking.status === 'confirmed' && (
                        <Button
                          variant="ghost"
                          size="md"
                          onClick={() => toast.success('Feature coming soon!')}
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Card */}
        {bookings.length > 0 && (
          <Card gradient>
            <CardHeader>
              <h3 className="text-xl font-bold text-gray-900">Booking Summary</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Total</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <p className="text-3xl font-bold text-green-600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Confirmed</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <p className="text-3xl font-bold text-purple-600">
                    {bookings.filter(b => b.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Completed</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <p className="text-3xl font-bold text-orange-600">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Pending</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
