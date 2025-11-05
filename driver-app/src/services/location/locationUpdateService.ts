import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from './locationService';
import { initializeSocket, getSocket, disconnectSocket } from '../socketService';
import offlineService from '../offlineService';

const LOCATION_CACHE_KEY = '@tracksy_driver:location_cache';
const MAX_CACHE_SIZE = 100; // Maximum cached locations

interface CachedLocation extends LocationData {
  synced: boolean;
}

class LocationUpdateService {
  private updateQueue: LocationData[] = [];
  private isSending: boolean = false;
  private socket: any = null;
  private sendInterval: NodeJS.Timeout | null = null;

  // Initialize location update service
  async initialize(): Promise<void> {
    try {
      // Initialize WebSocket connection
      this.socket = await initializeSocket();
      this.setupSocketListeners();

      // Start sending queued locations
      this.startSendingUpdates();

      // Load and sync cached locations
      await this.syncCachedLocations();

      console.log('✅ Location update service initialized');
    } catch (error) {
      console.error('Error initializing location update service:', error);
    }
  }

  // Setup WebSocket listeners
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected for location updates');
    });

    this.socket.on('disconnect', () => {
      console.warn('⚠️ WebSocket disconnected, will reconnect');
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
    });
  }

  // Send location update to backend
  async sendLocationUpdate(location: LocationData): Promise<boolean> {
    try {
      // Add to queue
      this.updateQueue.push(location);

      // Try to send immediately
      await this.processQueue();

      return true;
    } catch (error) {
      console.error('Error sending location update:', error);
      // Cache location for later sync
      await this.cacheLocation(location);
      return false;
    }
  }

  // Process update queue
  private async processQueue(): Promise<void> {
    if (this.isSending || this.updateQueue.length === 0) {
      return;
    }

    this.isSending = true;

    try {
      const location = this.updateQueue.shift();
      if (!location) {
        this.isSending = false;
        return;
      }

      // Check if online before sending
      const isOnline = await offlineService.isOnline();
      
      if (!isOnline) {
        // Queue for offline sync
        console.log('⚠️ Offline - queueing location update');
        await offlineService.queueLocationUpdate(location);
        await this.cacheLocation(location);
        this.isSending = false;
        return;
      }

      // Try to send via API
      try {
        await api.post('/driver/location', {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          speed: location.speed,
          heading: location.heading,
        });

        // Also send via WebSocket for real-time updates
        if (this.socket?.connected) {
          this.socket.emit('driver.location.update', {
            driver_id: location.driver_id, // Will be set by backend
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            speed: location.speed,
            heading: location.heading,
            timestamp: location.timestamp,
          });
        }

        console.log('✅ Location sent successfully');
      } catch (error: any) {
        // Network error - queue for offline sync
        console.error('❌ Network error - queueing location update:', error.message);
        await offlineService.queueLocationUpdate(location);
        // If API fails, add back to queue and cache
        this.updateQueue.unshift(location);
        await this.cacheLocation(location);
        throw error;
      }
    } catch (error) {
      console.error('Error processing location queue:', error);
    } finally {
      this.isSending = false;

      // Continue processing queue if there are more items
      if (this.updateQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  // Send batch location updates (for offline sync)
  async sendBatchUpdates(locations: LocationData[]): Promise<boolean> {
    try {
      const response = await api.post('/driver/location/batch', {
        locations: locations.map((loc) => ({
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          speed: loc.speed,
          heading: loc.heading,
          timestamp: new Date(loc.timestamp).toISOString(),
        })),
      });

      console.log(`✅ Batch update sent: ${locations.length} locations`);
      return true;
    } catch (error) {
      console.error('Error sending batch updates:', error);
      return false;
    }
  }

  // Cache location for offline sync
  private async cacheLocation(location: LocationData): Promise<void> {
    try {
      const cached = await this.getCachedLocations();
      cached.push({
        ...location,
        synced: false,
      });

      // Limit cache size
      if (cached.length > MAX_CACHE_SIZE) {
        cached.shift(); // Remove oldest
      }

      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cached));
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }

  // Get cached locations
  async getCachedLocations(): Promise<CachedLocation[]> {
    try {
      const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting cached locations:', error);
      return [];
    }
  }

  // Sync cached locations when online
  private async syncCachedLocations(): Promise<void> {
    try {
      const cached = await this.getCachedLocations();
      const unsynced = cached.filter((loc) => !loc.synced);

      if (unsynced.length === 0) {
        return;
      }

      console.log(`📤 Syncing ${unsynced.length} cached locations`);

      const success = await this.sendBatchUpdates(unsynced);

      if (success) {
        // Mark as synced
        const updated = cached.map((loc) => ({
          ...loc,
          synced: true,
        }));
        await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error syncing cached locations:', error);
    }
  }

  // Start sending updates periodically
  private startSendingUpdates(): void {
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
    }

    // Process queue every 5 seconds
    this.sendInterval = setInterval(() => {
      this.processQueue();
    }, 5000);
  }

  // Stop sending updates
  stop(): void {
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.sendInterval = null;
    }

    if (this.socket) {
      disconnectSocket();
      this.socket = null;
    }
  }

  // Clear location cache
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
      console.log('✅ Location cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default new LocationUpdateService();

