import io from 'socket.io-client';
import { WS_BASE_URL } from '../constants';

class TrackingService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.subscribedBuses = new Set();
    this.listeners = new Map();
  }

  // Connect to WebSocket server
  connect(token) {
    if (this.socket && this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Use WebSocket base URL
        const wsUrl = WS_BASE_URL;
        
        this.socket = io(wsUrl, {
          auth: {
            token: token,
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          console.log('WebSocket connected');
          resolve();
        });

        this.socket.on('disconnect', () => {
          this.isConnected = false;
          console.log('WebSocket disconnected');
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          reject(error);
        });

        // Listen for bus location updates
        this.socket.on('bus.location.updated', (data) => {
          this.handleBusLocationUpdate(data);
        });

        // Listen for route deviation alerts
        this.socket.on('bus.deviation', (data) => {
          this.handleRouteDeviation(data);
        });

        // Listen for alerts
        this.socket.on('alert.created', (data) => {
          this.handleAlertCreated(data);
        });

        // Listen for emergency alerts
        this.socket.on('alert.emergency', (data) => {
          this.handleEmergencyAlert(data);
        });

        // Listen for stop arrival notifications
        this.socket.on('stop.arrived', (data) => {
          this.handleStopArrived(data);
        });

      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.subscribedBuses.clear();
      this.listeners.clear();
    }
  }

  // Subscribe to bus location updates
  subscribeToBus(busId) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket not connected. Cannot subscribe to bus:', busId);
      return;
    }

    if (this.subscribedBuses.has(busId)) {
      return; // Already subscribed
    }

    this.subscribedBuses.add(busId);
    const channel = `bus.${busId}.location`;
    
    this.socket.emit('subscribe', channel);
    console.log('Subscribed to bus:', busId);
  }

  // Unsubscribe from bus location updates
  unsubscribeFromBus(busId) {
    if (!this.isConnected || !this.socket) {
      return;
    }

    if (!this.subscribedBuses.has(busId)) {
      return; // Not subscribed
    }

    this.subscribedBuses.delete(busId);
    const channel = `bus.${busId}.location`;
    
    this.socket.emit('unsubscribe', channel);
    console.log('Unsubscribed from bus:', busId);
  }

  // Subscribe to multiple buses
  subscribeToBuses(busIds) {
    busIds.forEach(busId => this.subscribeToBus(busId));
  }

  // Handle bus location update
  handleBusLocationUpdate(data) {
    const { bus_id, location } = data;
    
    // Notify all listeners for this bus
    const listeners = this.listeners.get(`bus.${bus_id}`) || [];
    listeners.forEach(listener => {
      listener({
        busId: bus_id,
        location: location,
        timestamp: new Date(),
      });
    });

    // Also notify general bus location listeners
    const generalListeners = this.listeners.get('all.buses') || [];
    generalListeners.forEach(listener => {
      listener({
        busId: bus_id,
        location: location,
        timestamp: new Date(),
      });
    });
  }

  // Handle route deviation alert
  handleRouteDeviation(data) {
    const { bus_id, deviation } = data;
    
    const listeners = this.listeners.get('deviation') || [];
    listeners.forEach(listener => {
      listener({
        busId: bus_id,
        deviation: deviation,
        timestamp: new Date(),
      });
    });
  }

  // Handle alert created
  handleAlertCreated(data) {
    const listeners = this.listeners.get('alert') || [];
    listeners.forEach(listener => {
      listener({
        type: 'alert',
        ...data,
        timestamp: new Date(),
      });
    });
  }

  // Handle emergency alert
  handleEmergencyAlert(data) {
    const listeners = this.listeners.get('emergency') || [];
    listeners.forEach(listener => {
      listener({
        type: 'emergency',
        ...data,
        timestamp: new Date(),
      });
    });
  }

  // Handle stop arrived
  handleStopArrived(data) {
    const listeners = this.listeners.get('stop.arrived') || [];
    listeners.forEach(listener => {
      listener({
        type: 'stop_arrival',
        ...data,
        timestamp: new Date(),
      });
    });
  }

  // Add listener for bus location updates
  onBusLocationUpdate(busId, callback) {
    const key = busId ? `bus.${busId}` : 'all.buses';
    
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    
    this.listeners.get(key).push(callback);
    
    // Subscribe to bus if not already subscribed
    if (busId) {
      this.subscribeToBus(busId);
    }
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Add listener for route deviation
  onRouteDeviation(callback) {
    if (!this.listeners.has('deviation')) {
      this.listeners.set('deviation', []);
    }
    
    this.listeners.get('deviation').push(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get('deviation');
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Add listener for alerts
  onAlert(callback) {
    if (!this.listeners.has('alert')) {
      this.listeners.set('alert', []);
    }
    
    this.listeners.get('alert').push(callback);
    
    return () => {
      const listeners = this.listeners.get('alert');
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Add listener for emergency alerts
  onEmergencyAlert(callback) {
    if (!this.listeners.has('emergency')) {
      this.listeners.set('emergency', []);
    }
    
    this.listeners.get('emergency').push(callback);
    
    return () => {
      const listeners = this.listeners.get('emergency');
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Add listener for stop arrival
  onStopArrived(callback) {
    if (!this.listeners.has('stop.arrived')) {
      this.listeners.set('stop.arrived', []);
    }
    
    this.listeners.get('stop.arrived').push(callback);
    
    return () => {
      const listeners = this.listeners.get('stop.arrived');
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Remove all listeners
  removeAllListeners() {
    this.listeners.clear();
  }

  // Check if connected
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Export singleton instance
export default new TrackingService();

