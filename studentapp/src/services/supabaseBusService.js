import supabase from '../config/supabase';

export const supabaseBusService = {
  // Get all buses
  async getAllBuses(params = {}) {
    try {
      let query = supabase
        .from('buses')
        .select('*, route:routes(*), driver:drivers(*)');

      // Apply filters
      if (params.status) {
        query = query.eq('status', params.status);
      }
      if (params.route_id) {
        query = query.eq('route_id', params.route_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching buses:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch buses',
        };
      }

      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      console.error('Error getting buses:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch buses',
      };
    }
  },

  // Get bus details
  async getBusDetails(busId) {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*, route:routes(*), driver:drivers(*)')
        .eq('id', busId)
        .single();

      if (error) {
        console.error('Error fetching bus:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch bus details',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error getting bus details:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch bus details',
      };
    }
  },

  // Get bus current location
  async getBusLocation(busId) {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('id, current_latitude, current_longitude, current_speed, current_heading, updated_at')
        .eq('id', busId)
        .single();

      if (error) {
        console.error('Error fetching bus location:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch bus location',
        };
      }

      return {
        success: true,
        data: {
          busId: data.id,
          latitude: data.current_latitude,
          longitude: data.current_longitude,
          speed: data.current_speed,
          heading: data.current_heading,
          updated_at: data.updated_at,
        },
      };
    } catch (error) {
      console.error('Error getting bus location:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch bus location',
      };
    }
  },

  // Get seat availability
  async getSeatAvailability(busId, tripDate) {
    try {
      // Get bus capacity
      const { data: bus, error: busError } = await supabase
        .from('buses')
        .select('capacity')
        .eq('id', busId)
        .single();

      if (busError || !bus) {
        return {
          success: false,
          error: 'Bus not found',
        };
      }

      // Get bookings for the date
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('seat_number')
        .eq('bus_id', busId)
        .eq('status', 'confirmed')
        .gte('trip_date', tripDate)
        .lt('trip_date', new Date(new Date(tripDate).getTime() + 24 * 60 * 60 * 1000).toISOString());

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
      }

      const occupiedSeats = (bookings || []).map((b) => b.seat_number).filter(Boolean);
      const totalSeats = bus.capacity || 50;
      const availableSeats = totalSeats - occupiedSeats.length;

      // Generate seat map
      const seatMap = [];
      for (let i = 1; i <= totalSeats; i++) {
        seatMap.push({
          seatNumber: i,
          available: !occupiedSeats.includes(i),
          occupied: occupiedSeats.includes(i),
        });
      }

      return {
        success: true,
        data: {
          totalSeats,
          availableSeats,
          occupiedSeats: occupiedSeats.length,
          reservedSeats: 0,
          seatMap,
        },
      };
    } catch (error) {
      console.error('Error getting seat availability:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch seat availability',
      };
    }
  },
};

