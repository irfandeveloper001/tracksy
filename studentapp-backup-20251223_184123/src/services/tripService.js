import api from './api';

export const tripService = {
  // Get trip history for student
  async getTripHistory(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/bookings?${queryParams.toString()}`);
      return {
        success: response.success !== false,
        data: response.data || [],
        meta: response.meta || {},
      };
    } catch (error) {
      console.error('Error fetching trip history:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch trip history',
        data: [],
      };
    }
  },

  // Get trip statistics
  async getTripStatistics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);

      const response = await api.get(`/bookings/statistics?${queryParams.toString()}`);
      return {
        success: response.success !== false,
        data: response.data || {},
      };
    } catch (error) {
      console.error('Error fetching trip statistics:', error);
      // Return default statistics if API fails
      return {
        success: false,
        error: error.message || 'Failed to fetch trip statistics',
        data: {
          totalTrips: 0,
          onTimePercentage: 0,
          averageWaitingTime: 0,
          totalDistance: 0,
          co2Saved: 0,
        },
      };
    }
  },

  // Get monthly trip summary
  async getMonthlySummary(month, year) {
    try {
      const response = await api.get(`/bookings/monthly-summary?month=${month}&year=${year}`);
      return {
        success: response.success !== false,
        data: response.data || {},
      };
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch monthly summary',
        data: {},
      };
    }
  },

  // Get usage statistics
  async getUsageStatistics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);

      const response = await api.get(`/bookings/usage-statistics?${queryParams.toString()}`);
      return {
        success: response.success !== false,
        data: response.data || {},
      };
    } catch (error) {
      console.error('Error fetching usage statistics:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch usage statistics',
        data: {},
      };
    }
  },

  // Calculate statistics from bookings
  calculateStatisticsFromBookings(bookings) {
    if (!bookings || bookings.length === 0) {
      return {
        totalTrips: 0,
        onTimePercentage: 0,
        averageWaitingTime: 0,
        totalDistance: 0,
        co2Saved: 0,
        completedTrips: 0,
        cancelledTrips: 0,
      };
    }

    const completedBookings = bookings.filter((b) => b.status === 'completed');
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');
    const onTimeTrips = bookings.filter((b) => {
      if (!b.trip || !b.trip.estimated_arrival) return false;
      const actualArrival = new Date(b.trip.actual_arrival || b.trip.estimated_arrival);
      const estimatedArrival = new Date(b.trip.estimated_arrival);
      const diff = Math.abs(actualArrival - estimatedArrival) / (1000 * 60); // minutes
      return diff <= 5; // 5 minutes tolerance
    });

    // Calculate average waiting time (placeholder - would need actual data)
    const averageWaitingTime = bookings.length > 0 ? 10 : 0; // Placeholder

    // Calculate total distance (placeholder - would need route data)
    const totalDistance = completedBookings.length * 15; // Placeholder: 15km per trip

    // Calculate CO2 saved (approx 0.1 kg CO2 per km for bus vs car)
    const co2Saved = totalDistance * 0.1;

    return {
      totalTrips: bookings.length,
      completedTrips: completedBookings.length,
      cancelledTrips: cancelledBookings.length,
      onTimePercentage: bookings.length > 0 ? Math.round((onTimeTrips.length / bookings.length) * 100) : 0,
      averageWaitingTime: Math.round(averageWaitingTime),
      totalDistance: Math.round(totalDistance),
      co2Saved: Math.round(co2Saved * 10) / 10, // Round to 1 decimal
    };
  },

  // Format trip data for display
  formatTrip(trip) {
    if (!trip) return null;

    return {
      id: trip.id,
      bookingId: trip.booking_id || trip.id,
      date: trip.date || trip.created_at,
      routeName: trip.route?.name || trip.route_name || 'Unknown Route',
      busNumber: trip.bus?.number || trip.bus_number || 'N/A',
      status: trip.status || 'pending',
      startTime: trip.start_time || trip.trip?.start_time,
      endTime: trip.end_time || trip.trip?.end_time,
      duration: trip.duration || this.calculateDuration(trip.start_time, trip.end_time),
      seatNumber: trip.seat_number || trip.seat,
      boardingStop: trip.boarding_stop || trip.stop?.name,
      alightingStop: trip.alighting_stop || trip.drop_stop?.name,
      price: trip.price || 0,
    };
  },

  // Calculate duration between two times
  calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return null;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  },
};

