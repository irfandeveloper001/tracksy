import supabase from '../config/supabase';

class SupabaseTrackingService {
  constructor() {
    this.busSubscriptions = new Map();
    this.listeners = new Map();
    this.isConnected = false;
  }

  // Connect to Supabase Realtime (for bus tracking)
  async connect() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user logged in, cannot connect to tracking');
        return false;
      }

      console.log('🚌 Connecting to Supabase Realtime for bus tracking');
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Error connecting to Supabase Realtime:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Disconnect
  disconnect() {
    try {
      // Remove all subscriptions
      this.busSubscriptions.forEach((subscription) => {
        supabase.removeChannel(subscription);
      });
      this.busSubscriptions.clear();
      this.listeners.clear();
      this.isConnected = false;
      console.log('🚌 Disconnected from Supabase Realtime');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  // Subscribe to bus location updates
  subscribeToBus(busId, onUpdate) {
    try {
      if (this.busSubscriptions.has(busId)) {
        console.log('Already subscribed to bus:', busId);
        return;
      }

      console.log('🚌 Subscribing to bus location updates:', busId);

      const subscription = supabase
        .channel(`bus-location:${busId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'buses',
            filter: `id=eq.${busId}`,
          },
          (payload) => {
            console.log('📍 Bus location updated:', payload.new);
            if (onUpdate) {
              onUpdate({
                busId: payload.new.id,
                latitude: payload.new.current_latitude,
                longitude: payload.new.current_longitude,
                speed: payload.new.current_speed,
                heading: payload.new.current_heading,
                updated_at: payload.new.updated_at,
              });
            }
            
            // Notify listeners
            this.notifyListeners('bus.location.updated', payload.new);
          }
        )
        .subscribe();

      this.busSubscriptions.set(busId, subscription);

      // Store callback
      if (onUpdate) {
        const key = `bus:${busId}`;
        if (!this.listeners.has(key)) {
          this.listeners.set(key, []);
        }
        this.listeners.get(key).push(onUpdate);
      }

      return () => {
        this.unsubscribeFromBus(busId);
      };
    } catch (error) {
      console.error('Error subscribing to bus:', error);
    }
  }

  // Unsubscribe from bus
  unsubscribeFromBus(busId) {
    try {
      const subscription = this.busSubscriptions.get(busId);
      if (subscription) {
        supabase.removeChannel(subscription);
        this.busSubscriptions.delete(busId);
        this.listeners.delete(`bus:${busId}`);
        console.log('🚌 Unsubscribed from bus:', busId);
      }
    } catch (error) {
      console.error('Error unsubscribing from bus:', error);
    }
  }

  // Subscribe to all active buses
  subscribeToAllBuses(onUpdate) {
    try {
      console.log('🚌 Subscribing to all active buses');

      const subscription = supabase
        .channel('all-buses')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'buses',
            filter: 'status=eq.active',
          },
          (payload) => {
            console.log('📍 Active bus updated:', payload.new);
            if (onUpdate) {
              onUpdate({
                busId: payload.new.id,
                latitude: payload.new.current_latitude,
                longitude: payload.new.current_longitude,
                speed: payload.new.current_speed,
                heading: payload.new.current_heading,
                status: payload.new.status,
                updated_at: payload.new.updated_at,
              });
            }
            
            this.notifyListeners('bus.location.updated', payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'buses',
            filter: 'status=eq.active',
          },
          (payload) => {
            console.log('🚌 New active bus:', payload.new);
            this.notifyListeners('bus.added', payload.new);
          }
        )
        .subscribe();

      this.busSubscriptions.set('all', subscription);

      return () => {
        this.unsubscribeFromBus('all');
      };
    } catch (error) {
      console.error('Error subscribing to all buses:', error);
      return () => {};
    }
  }

  // Subscribe to route deviation alerts
  async subscribeToRouteDeviation(onDeviation) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return () => {};

      console.log('⚠️ Subscribing to route deviation alerts');

      const subscription = supabase
        .channel('route-deviations')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts',
            filter: 'type=eq.route_deviation',
          },
          (payload) => {
            console.log('⚠️ Route deviation alert:', payload.new);
            if (onDeviation) {
              onDeviation({
                busId: payload.new.bus_id,
                routeId: payload.new.route_id,
                message: payload.new.message,
                severity: payload.new.severity,
                created_at: payload.new.created_at,
              });
            }
            
            this.notifyListeners('bus.deviation', payload.new);
          }
        )
        .subscribe();

      this.busSubscriptions.set('route-deviations', subscription);

      return () => {
        this.unsubscribeFromBus('route-deviations');
      };
    } catch (error) {
      console.error('Error subscribing to route deviations:', error);
      return () => {};
    }
  }

  // Subscribe to alerts
  async subscribeToAlerts(onAlert) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return () => {};

      console.log('🔔 Subscribing to alerts');

      const subscription = supabase
        .channel('alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts',
          },
          (payload) => {
            console.log('🔔 New alert:', payload.new);
            if (onAlert) {
              onAlert({
                id: payload.new.id,
                type: payload.new.type,
                title: payload.new.title,
                message: payload.new.message,
                severity: payload.new.severity,
                created_at: payload.new.created_at,
              });
            }
            
            this.notifyListeners('alert.created', payload.new);
          }
        )
        .subscribe();

      this.busSubscriptions.set('alerts', subscription);

      return () => {
        this.unsubscribeFromBus('alerts');
      };
    } catch (error) {
      console.error('Error subscribing to alerts:', error);
      return () => {};
    }
  }

  // Subscribe to emergency alerts
  async subscribeToEmergencyAlerts(onEmergency) {
    try {
      const { data: { user } = {} } = await supabase.auth.getUser();
      if (!user) return () => {};

      console.log('🚨 Subscribing to emergency alerts');

      const subscription = supabase
        .channel('emergency-alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts',
            filter: 'type=eq.emergency',
          },
          (payload) => {
            console.log('🚨 Emergency alert:', payload.new);
            if (onEmergency) {
              onEmergency({
                id: payload.new.id,
                title: payload.new.title,
                message: payload.new.message,
                severity: payload.new.severity,
                created_at: payload.new.created_at,
              });
            }
            
            this.notifyListeners('alert.emergency', payload.new);
          }
        )
        .subscribe();

      this.busSubscriptions.set('emergency-alerts', subscription);

      return () => {
        this.unsubscribeFromBus('emergency-alerts');
      };
    } catch (error) {
      console.error('Error subscribing to emergency alerts:', error);
      return () => {};
    }
  }

  // Subscribe to stop arrival notifications
  async subscribeToStopArrivals(onStopArrival) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return () => {};

      console.log('🛑 Subscribing to stop arrivals');

      const subscription = supabase
        .channel('stop-arrivals')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'trip_stops',
          },
          (payload) => {
            console.log('🛑 Stop arrived:', payload.new);
            if (onStopArrival) {
              onStopArrival({
                tripId: payload.new.trip_id,
                stopId: payload.new.stop_id,
                busId: payload.new.bus_id,
                arrivedAt: payload.new.arrived_at,
                created_at: payload.new.created_at,
              });
            }
            
            this.notifyListeners('stop.arrived', payload.new);
          }
        )
        .subscribe();

      this.busSubscriptions.set('stop-arrivals', subscription);

      return () => {
        this.unsubscribeFromBus('stop-arrivals');
      };
    } catch (error) {
      console.error('Error subscribing to stop arrivals:', error);
      return () => {};
    }
  }

  // Get active buses
  async getActiveBuses() {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*, route:routes(*), driver:drivers(*)')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching active buses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting active buses:', error);
      return [];
    }
  }

  // Get bus by ID
  async getBus(busId) {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*, route:routes(*), driver:drivers(*)')
        .eq('id', busId)
        .single();

      if (error) {
        console.error('Error fetching bus:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting bus:', error);
      return null;
    }
  }

  // Get routes
  async getRoutes() {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*, stops:route_stops(stop:stops(*))')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching routes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting routes:', error);
      return [];
    }
  }

  // Get route by ID
  async getRoute(routeId) {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*, stops:route_stops(stop:stops(*))')
        .eq('id', routeId)
        .single();

      if (error) {
        console.error('Error fetching route:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  }

  // Notify listeners
  notifyListeners(event, data) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in listener:', error);
      }
    });
  }

  // Add listener
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event) || [];
      this.listeners.set(
        event,
        listeners.filter((cb) => cb !== callback)
      );
    };
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new SupabaseTrackingService();

