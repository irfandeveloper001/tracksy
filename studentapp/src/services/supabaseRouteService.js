import supabase from '../config/supabase';

export const supabaseRouteService = {
  // Get all routes
  async getAllRoutes(params = {}) {
    try {
      let query = supabase
        .from('routes')
        .select('*, stops:route_stops(stop:stops(*))')
        .eq('status', 'active');

      // Apply filters
      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error fetching routes:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch routes',
        };
      }

      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      console.error('Error getting routes:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch routes',
      };
    }
  },

  // Get route details
  async getRouteDetails(routeId) {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*, stops:route_stops(stop:stops(*))')
        .eq('id', routeId)
        .single();

      if (error) {
        console.error('Error fetching route:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch route details',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error getting route details:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch route details',
      };
    }
  },

  // Get route stops
  async getRouteStops(routeId) {
    try {
      const { data, error } = await supabase
        .from('route_stops')
        .select('*, stop:stops(*)')
        .eq('route_id', routeId)
        .order('sequence');

      if (error) {
        console.error('Error fetching route stops:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch route stops',
        };
      }

      return {
        success: true,
        data: (data || []).map((rs) => ({
          ...rs.stop,
          sequence: rs.sequence,
          estimatedArrival: rs.estimated_arrival,
        })),
      };
    } catch (error) {
      console.error('Error getting route stops:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch route stops',
      };
    }
  },

  // Get nearby stops
  async getNearbyStops(latitude, longitude, radius = 1000) {
    try {
      // This would require PostGIS extension for proper distance calculation
      // For now, we'll use a simple bounding box approach
      const { data, error } = await supabase
        .from('stops')
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching nearby stops:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch nearby stops',
        };
      }

      // Calculate distances (simple haversine would be better, but this works for now)
      const stopsWithDistance = (data || []).map((stop) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          stop.latitude,
          stop.longitude
        );
        return {
          ...stop,
          distance,
        };
      });

      // Filter by radius and sort by distance
      const nearby = stopsWithDistance
        .filter((stop) => stop.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      return {
        success: true,
        data: nearby,
      };
    } catch (error) {
      console.error('Error getting nearby stops:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch nearby stops',
      };
    }
  },

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  },
};

