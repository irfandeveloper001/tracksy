// RealtimeService - Laravel API only
// Note: Laravel doesn't have built-in real-time subscriptions like Supabase
// This service now provides polling-based updates or can be removed if not needed

// Real-time event types (kept for compatibility)
export type RealtimeEvent = 
  | 'bus_location_update'
  | 'bus_status_change'
  | 'trip_started'
  | 'trip_completed'
  | 'alert_created'
  | 'user_created'
  | 'user_updated'
  | 'route_updated';

export type RealtimeEventHandler = (payload: any) => void;

class RealtimeService {
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private subscriptions: Map<string, Set<RealtimeEventHandler>> = new Map();

  // Subscribe to a real-time channel (now uses polling)
  subscribe(channel: string, event: RealtimeEvent, handler: RealtimeEventHandler): () => void {
    // Create subscription key
    const subscriptionKey = `${channel}:${event}`;

    // Add handler to subscriptions
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
    }
    this.subscriptions.get(subscriptionKey)!.add(handler);

    // For Laravel API, we use polling instead of real-time subscriptions
    // Poll every 30 seconds for updates
    if (!this.pollingIntervals.has(subscriptionKey)) {
      const interval = setInterval(() => {
        // Notify all handlers (they can trigger refetch in their components)
        const handlers = this.subscriptions.get(subscriptionKey);
        if (handlers) {
          handlers.forEach((h) => h({ event, channel, timestamp: new Date().toISOString() }));
        }
      }, 30000); // Poll every 30 seconds
      
      this.pollingIntervals.set(subscriptionKey, interval);
    }

    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(subscriptionKey);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscriptions.delete(subscriptionKey);
          // Clear polling interval if no more handlers
          const interval = this.pollingIntervals.get(subscriptionKey);
          if (interval) {
            clearInterval(interval);
            this.pollingIntervals.delete(subscriptionKey);
          }
        }
      }
    };
  }

  // Subscribe to bus updates
  subscribeToBusUpdates(busId: string, handler: RealtimeEventHandler): () => void {
    return this.subscribe(`buses:${busId}`, 'bus_location_update', handler);
  }

  // Subscribe to all buses
  subscribeToAllBuses(handler: RealtimeEventHandler): () => void {
    return this.subscribe('buses', 'bus_location_update', handler);
  }

  // Subscribe to alerts
  subscribeToAlerts(handler: RealtimeEventHandler): () => void {
    return this.subscribe('alerts', 'alert_created', handler);
  }

  // Subscribe to trips
  subscribeToTrips(handler: RealtimeEventHandler): () => void {
    return this.subscribe('trips', 'trip_started', handler);
  }

  // Subscribe to admin dashboard updates
  subscribeToDashboard(handler: RealtimeEventHandler): () => void {
    return this.subscribe('admin_dashboard', 'bus_status_change', handler);
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.pollingIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();
    this.subscriptions.clear();
  }

  // Cleanup
  cleanup(): void {
    this.unsubscribeAll();
  }
}

export default new RealtimeService();

