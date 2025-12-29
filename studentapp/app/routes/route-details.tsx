import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import DashboardLayout from "../components/layout/DashboardLayout";
import routeService from "../lib/api/routeService";
import bookingService from "../lib/api/bookingService";
import authService from "../lib/api/authService";
import {
  MapPinIcon,
  ClockIcon,
  MapIcon,
  ArrowLeftIcon,
  CalendarIcon,
  TruckIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

export default function RouteDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<string>("");

  useEffect(() => {
    if (id) {
      loadRouteData(parseInt(id));
    }
  }, [id]);

  const loadRouteData = async (routeId: number) => {
    try {
      const [userData, routeData, stopsData] = await Promise.all([
        authService.me(),
        routeService.getRoute(routeId),
        routeService.getRouteStops(routeId).catch(() => []),
      ]);
      setUser(userData);
      setRoute(routeData);
      setStops(stopsData);
      
      // Set default booking date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setBookingDate(tomorrow.toISOString().split('T')[0]);
    } catch (error: any) {
      console.error("Failed to load route:", error);
      toast.error(error.message || "Failed to load route details");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!bookingDate) {
      toast.error("Please select a booking date");
      return;
    }

    if (!selectedSeat) {
      toast.error("Please select a seat number");
      return;
    }

    // Check if date is in the past
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Please select a future date");
      return;
    }

    // For now, we'll use bus_id = 1 as default since routes might not have direct bus association
    // In a production system, you'd fetch available buses for this route from the API
    // The backend will validate the bus_id exists
    const defaultBusId = 1;

    setBookingLoading(true);
    try {
      const booking = await bookingService.createBooking({
        bus_id: defaultBusId,
        route_id: parseInt(id!),
        trip_date: bookingDate,
        seat_number: selectedSeat,
      });

      toast.success("Booking confirmed successfully! 🎉");
      setShowBookingModal(false);
      
      // Redirect to bookings page after a short delay
      setTimeout(() => {
        navigate("/bookings");
      }, 1500);
    } catch (error: any) {
      console.error("Booking error:", error);
      const errorMessage = error.message || "Failed to create booking. Please try again.";
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  // Generate seat numbers (1-50 for demo)
  const availableSeats = Array.from({ length: 50 }, (_, i) => (i + 1).toString());

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading route details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!route) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Route not found</p>
            <Link
              to="/routes"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Routes
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const origin = route.origin || route.start_point || "N/A";
  const destination = route.destination || route.end_point || "N/A";
  const distance = route.distance ? `${(parseFloat(route.distance) / 1000).toFixed(1)} km` : "N/A";
  const duration = route.estimated_duration ? `${route.estimated_duration} min` : "N/A";

  return (
    <DashboardLayout user={user}>
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/routes"
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Back to Routes</span>
          </Link>
        </div>

        {/* Route Header Card */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <TruckIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-1">{route.name}</h1>
                  <p className="text-indigo-100 text-sm sm:text-base">Route #{route.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold">
                  {route.status === 'active' || route.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
            >
              <TicketIcon className="w-5 h-5" />
              <span>Book Now</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <MapIcon className="w-6 h-6 mr-2 text-indigo-600" />
                Route Information
              </h2>
              
              <div className="space-y-6">
                {/* Origin and Destination */}
                <div className="bg-gradient-to-r from-green-50 to-red-50 rounded-xl p-6 border-2 border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPinIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Origin</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{origin}</p>
                    </div>
                    <ArrowLeftIcon className="w-6 h-6 text-gray-400 flex-shrink-0 hidden sm:block" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPinIcon className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-semibold text-gray-600">Destination</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{destination}</p>
                    </div>
                  </div>
                </div>

                {/* Route Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center space-x-3 mb-2">
                      <MapIcon className="w-6 h-6 text-indigo-600" />
                      <span className="text-sm font-semibold text-gray-600">Distance</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">{distance}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center space-x-3 mb-2">
                      <ClockIcon className="w-6 h-6 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-600">Duration</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{duration}</p>
                  </div>
                </div>

                {/* Stops */}
                {stops.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Route Stops</h3>
                    <div className="space-y-3">
                      {stops.map((stop, index) => (
                        <div
                          key={stop.id || index}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{stop.name || stop.address}</p>
                            {stop.address && stop.name !== stop.address && (
                              <p className="text-sm text-gray-600">{stop.address}</p>
                            )}
                            {stop.estimated_time && (
                              <p className="text-xs text-gray-500 mt-1">
                                Est. time: {stop.estimated_time} min
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stops.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No stops information available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Route Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      route.status === 'active' || route.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {route.status === 'active' || route.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {route.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-sm text-gray-900">{route.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking CTA Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <TicketIcon className="w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Ready to Book?</h3>
              <p className="text-indigo-100 text-sm mb-4">
                Reserve your seat on this route now
              </p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full py-3 bg-white text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-all shadow-lg"
              >
                Book Your Seat
              </button>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Book Your Seat</h2>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Route Summary */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                  <p className="text-sm text-gray-600 mb-1">Route</p>
                  <p className="font-bold text-gray-900">{route.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {origin} → {destination}
                  </p>
                </div>

                {/* Booking Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Seat Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <TicketIcon className="w-4 h-4 inline mr-1" />
                    Select Seat Number
                  </label>
                  <div className="grid grid-cols-10 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {availableSeats.map((seat) => (
                      <button
                        key={seat}
                        onClick={() => setSelectedSeat(seat)}
                        className={`p-2 rounded-lg font-semibold text-sm transition-all ${
                          selectedSeat === seat
                            ? 'bg-indigo-600 text-white shadow-lg scale-110'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {seat}
                      </button>
                    ))}
                  </div>
                  {selectedSeat && (
                    <p className="mt-2 text-sm text-indigo-600 font-medium">
                      Selected: Seat {selectedSeat}
                    </p>
                  )}
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-semibold text-gray-900">{route.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold text-gray-900">
                        {bookingDate ? new Date(bookingDate).toLocaleDateString() : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seat:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedSeat || 'Not selected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || !bookingDate || !selectedSeat}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Confirm Booking</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
