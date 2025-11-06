import { supabase } from '../config/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Real-time event types
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
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, Set<RealtimeEventHandler>> = new Map();

  // Subscribe to a real-time channel
  subscribe(channel: string, event: RealtimeEvent, handler: RealtimeEventHandler): () => void {
    // Create subscription key
    const subscriptionKey = `${channel}:${event}`;

    // Add handler to subscriptions
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
    }
    this.subscriptions.get(subscriptionKey)!.add(handler);

    // Get or create channel
    let realtimeChannel = this.channels.get(channel);
    if (!realtimeChannel) {
      realtimeChannel = supabase.channel(channel);
      this.channels.set(channel, realtimeChannel);
    }

    // Subscribe to event
    realtimeChannel
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: channel,
      }, (payload) => {
        // Notify all handlers for this event
        const handlers = this.subscriptions.get(subscriptionKey);
        if (handlers) {
          handlers.forEach((h) => h(payload));
        }
      })
      .subscribe();

    // Return unsubscribe function
    return () => {
      const handlers = this.subscriptions.get(subscriptionKey);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscriptions.delete(subscriptionKey);
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
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.subscriptions.clear();
  }

  // Cleanup
  cleanup(): void {
    this.unsubscribeAll();
  }
}

export default new RealtimeService();

