import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import bookingService, { type Booking } from '../../lib/api/bookingService';
import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'>('all');

  useEffect(() => {
    loadData();
  }, [filters, selectedTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const statusFilter = selectedTab === 'all' ? undefined : selectedTab;
      const [bookingsData, statsData] = await Promise.all([
        bookingService.getBookings({
          status: statusFilter,
          search: filters.search || undefined,
        }),
        bookingService.getStatistics(),
      ]);

      setBookings(bookingsData.data || bookingsData);
      setStatistics(statsData);
    } catch (error: any) {
      console.error('Failed to load bookings:', error);
      toast.error(error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const tabs = [
    { id: 'all', label: 'All Bookings', count: statistics?.total || 0 },
    { id: 'pending', label: 'Pending', count: statistics?.pending || 0 },
    { id: 'confirmed', label: 'Confirmed', count: statistics?.confirmed || 0 },
    { id: 'rejected', label: 'Rejected', count: statistics?.rejected || 0 },
    { id: 'cancelled', label: 'Cancelled', count: statistics?.cancelled || 0 },
    { id: 'completed', label: 'Completed', count: statistics?.completed || 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-1">Manage and approve student booking requests</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-100">Total</p>
              <p className="text-4xl font-bold mt-2">{statistics?.total || 0}</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <TicketIcon className="w-10 h-10" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-100">Pending</p>
              <p className="text-4xl font-bold mt-2">{statistics?.pending || 0}</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <ClockIcon className="w-10 h-10" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Confirmed</p>
              <p className="text-4xl font-bold mt-2">{statistics?.confirmed || 0}</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-100">Rejected</p>
              <p className="text-4xl font-bold mt-2">{statistics?.rejected || 0}</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <XCircleIcon className="w-10 h-10" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-100">Cancelled</p>
              <p className="text-4xl font-bold mt-2">{statistics?.cancelled || 0}</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <BanIcon className="w-10 h-10" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Completed</p>
              <p className="text-4xl font-bold mt-2">{statistics?.completed || 0}</p>
            </div>
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <CalendarIcon className="w-10 h-10" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search by booking reference, seat number, or student name..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Bookings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus / Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.booking_reference}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.student?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.student?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.bus?.name || 'N/A'} ({booking.bus?.number || 'N/A'})
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.bus?.currentRoute?.name || 'No route'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Seat {booking.seat_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(booking.trip_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(booking.status)}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

