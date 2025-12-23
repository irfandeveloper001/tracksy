import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import bookingService from "../lib/api/bookingService";
import authService from "../lib/api/authService";
import toast from "react-hot-toast";
import { BookmarkIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function Bookings() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      case 'completed': return <CheckCircleIcon className="w-5 h-5 text-blue-600" />;
      default: return <ClockIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your bus bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No bookings yet</p>
            <a
              href="/routes"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Routes
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(booking.status)}
                      <h3 className="text-xl font-bold text-gray-900">Booking #{booking.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Booking Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </p>
                      </div>
                      {booking.seat_number && (
                        <div>
                          <p className="text-gray-500">Seat Number</p>
                          <p className="font-semibold text-gray-900">{booking.seat_number}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
