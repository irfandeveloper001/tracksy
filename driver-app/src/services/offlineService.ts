const OFFLINE_KEYS = {
  ROUTE_DATA: '@tracksy_driver:route_data',
  PASSENGER_LIST: '@tracksy_driver:passenger_list',
  TRIP_DATA: '@tracksy_driver:trip_data',
  LOCATION_QUEUE: '@tracksy_driver:location_queue',
  INCIDENT_QUEUE: '@tracksy_driver:incident_queue',
  LAST_SYNC: '@tracksy_driver:last_sync',
};

class OfflineService {
  // Check if device is online
  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  // Cache route data
  async cacheRouteData(routeData: any): Promise<void> {
    try {
      localStorage.setItem(
        OFFLINE_KEYS.ROUTE_DATA,
        JSON.stringify(routeData)
      );
    } catch (error) {
      console.error('Error caching route data:', error);
    }
  }

  // Get cached route data
  async getCachedRouteData(): Promise<any | null> {
    try {
      const data = localStorage.getItem(OFFLINE_KEYS.ROUTE_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached route data:', error);
      return null;
    }
  }

  // Cache passenger list
  async cachePassengerList(passengers: any[]): Promise<void> {
    try {
      localStorage.setItem(
        OFFLINE_KEYS.PASSENGER_LIST,
        JSON.stringify(passengers)
      );
    } catch (error) {
      console.error('Error caching passenger list:', error);
    }
  }

  // Get cached passenger list
  async getCachedPassengerList(): Promise<any[] | null> {
    try {
      const data = localStorage.getItem(OFFLINE_KEYS.PASSENGER_LIST);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting cached passenger list:', error);
      return null;
    }
  }

  // Cache trip data
  async cacheTripData(tripData: any): Promise<void> {
    try {
      localStorage.setItem(
        OFFLINE_KEYS.TRIP_DATA,
        JSON.stringify(tripData)
      );
    } catch (error) {
      console.error('Error caching trip data:', error);
    }
  }

  // Get cached trip data
  async getCachedTripData(): Promise<any | null> {
    try {
      const data = localStorage.getItem(OFFLINE_KEYS.TRIP_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting cached trip data:', error);
      return null;
    }
  }

  // Queue location update for offline sync
  async queueLocationUpdate(location: any): Promise<void> {
    try {
      const queue = await this.getLocationQueue();
      queue.push({
        ...location,
        timestamp: Date.now(),
        synced: false,
      });
      // Keep only last 1000 locations
      const limitedQueue = queue.slice(-1000);
      localStorage.setItem(
        OFFLINE_KEYS.LOCATION_QUEUE,
        JSON.stringify(limitedQueue)
      );
    } catch (error) {
      console.error('Error queueing location update:', error);
    }
  }

  // Get location queue
  async getLocationQueue(): Promise<any[]> {
    try {
      const data = localStorage.getItem(OFFLINE_KEYS.LOCATION_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting location queue:', error);
      return [];
    }
  }

  // Clear synced location updates
  async clearSyncedLocations(): Promise<void> {
    try {
      const queue = await this.getLocationQueue();
      const unsynced = queue.filter((item) => !item.synced);
      localStorage.setItem(
        OFFLINE_KEYS.LOCATION_QUEUE,
        JSON.stringify(unsynced)
      );
    } catch (error) {
      console.error('Error clearing synced locations:', error);
    }
  }

  // Queue incident report for offline sync
  async queueIncidentReport(incident: any): Promise<void> {
    try {
      const queue = await this.getIncidentQueue();
      queue.push({
        ...incident,
        timestamp: Date.now(),
        synced: false,
      });
      localStorage.setItem(
        OFFLINE_KEYS.INCIDENT_QUEUE,
        JSON.stringify(queue)
      );
    } catch (error) {
      console.error('Error queueing incident report:', error);
    }
  }

  // Get incident queue
  async getIncidentQueue(): Promise<any[]> {
    try {
      const data = localStorage.getItem(OFFLINE_KEYS.INCIDENT_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting incident queue:', error);
      return [];
    }
  }

  // Clear synced incidents
  async clearSyncedIncidents(): Promise<void> {
    try {
      const queue = await this.getIncidentQueue();
      const unsynced = queue.filter((item) => !item.synced);
      localStorage.setItem(
        OFFLINE_KEYS.INCIDENT_QUEUE,
        JSON.stringify(unsynced)
      );
    } catch (error) {
      console.error('Error clearing synced incidents:', error);
    }
  }

  // Set last sync timestamp
  async setLastSync(timestamp: number): Promise<void> {
    try {
      localStorage.setItem(
        OFFLINE_KEYS.LAST_SYNC,
        timestamp.toString()
      );
    } catch (error) {
      console.error('Error setting last sync:', error);
    }
  }

  // Get last sync timestamp
  async getLastSync(): Promise<number | null> {
    try {
      const data = localStorage.getItem(OFFLINE_KEYS.LAST_SYNC);
      return data ? parseInt(data, 10) : null;
    } catch (error) {
      console.error('Error getting last sync:', error);
      return null;
    }
  }

  // Clear all offline data
  async clearAll(): Promise<void> {
    try {
      localStorage.removeItem(OFFLINE_KEYS.ROUTE_DATA);
      localStorage.removeItem(OFFLINE_KEYS.PASSENGER_LIST);
      localStorage.removeItem(OFFLINE_KEYS.TRIP_DATA);
      localStorage.removeItem(OFFLINE_KEYS.LOCATION_QUEUE);
      localStorage.removeItem(OFFLINE_KEYS.INCIDENT_QUEUE);
      localStorage.removeItem(OFFLINE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }
}

export default new OfflineService();

