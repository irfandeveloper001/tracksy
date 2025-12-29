import supabase from '../config/supabase';

export const supabaseBookingService = {
  // Get user bookings
  async getUserBookings(params = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      let query = supabase
        .from('bookings')
        .select('*, bus:buses(*), route:routes(*), trip:trips(*)')
        .eq('user_id', user.id);

      // Apply filters
      if (params.status) {
        query = query.eq('status', params.status);
      }
      if (params.start_date) {
        query = query.gte('trip_date', params.start_date);
      }
      if (params.end_date) {
        query = query.lte('trip_date', params.end_date);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch bookings',
        };
      }

      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      console.error('Error getting bookings:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch bookings',
      };
    }
  },

  // Get booking details
  async getBookingDetails(bookingId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*, bus:buses(*), route:routes(*), trip:trips(*)')
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching booking:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch booking details',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error getting booking details:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch booking details',
      };
    }
  },

  // Create booking
  async createBooking(bookingData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          bus_id: bookingData.bus_id,
          route_id: bookingData.route_id,
          trip_id: bookingData.trip_id,
          trip_date: bookingData.trip_date,
          seat_number: bookingData.seat_number,
          pickup_stop_id: bookingData.pickup_stop_id,
          dropoff_stop_id: bookingData.dropoff_stop_id,
          status: 'confirmed',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        return {
          success: false,
          error: error.message || 'Failed to create booking',
        };
      }

      return {
        success: true,
        data: data,
        message: 'Booking created successfully',
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.message || 'Failed to create booking',
      };
    }
  },

  // Cancel booking
  async cancelBooking(bookingId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error cancelling booking:', error);
        return {
          success: false,
          error: error.message || 'Failed to cancel booking',
        };
      }

      return {
        success: true,
        data: data,
        message: 'Booking cancelled successfully',
      };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel booking',
      };
    }
  },

  // Get booking statistics
  async getStatistics(params = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      let query = supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id);

      if (params.start_date) {
        query = query.gte('trip_date', params.start_date);
      }
      if (params.end_date) {
        query = query.lte('trip_date', params.end_date);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching booking statistics:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch statistics',
        };
      }

      const bookings = data || [];
      const totalTrips = bookings.length;
      const completedTrips = bookings.filter((b) => b.status === 'completed').length;
      const cancelledTrips = bookings.filter((b) => b.status === 'cancelled').length;

      // Calculate on-time percentage (simplified)
      const onTimeTrips = bookings.filter((b) => {
        if (!b.trip || !b.trip.actual_arrival) return false;
        const delay = new Date(b.trip.actual_arrival) - new Date(b.trip.estimated_arrival);
        return delay <= 5 * 60 * 1000; // 5 minutes tolerance
      }).length;

      const onTimePercentage = totalTrips > 0 ? (onTimeTrips / totalTrips) * 100 : 0;

      // Calculate total distance (simplified - would need route distance)
      const totalDistance = bookings.reduce((sum, b) => {
        return sum + (b.route?.distance || 0);
      }, 0);

      // Calculate CO2 saved (simplified)
      const co2Saved = totalDistance * 0.12; // 0.12 kg CO2 per km

      return {
        success: true,
        data: {
          totalTrips,
          completedTrips,
          cancelledTrips,
          onTimePercentage: Math.round(onTimePercentage * 100) / 100,
          totalDistance: Math.round(totalDistance * 100) / 100,
          co2Saved: Math.round(co2Saved * 100) / 100,
        },
      };
    } catch (error) {
      console.error('Error getting booking statistics:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch statistics',
      };
    }
  },
};

