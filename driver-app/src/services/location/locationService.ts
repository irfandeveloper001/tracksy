import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { LOCATION_CONFIG } from '../../constants';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  interval?: number;
  fastestInterval?: number;
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private isTracking: boolean = false;
  private lastLocation: LocationData | null = null;
  private lastSpeed: number = 0;
  private adaptiveInterval: number = LOCATION_CONFIG.UPDATE_INTERVAL;

  // Request location permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        return false;
      }

      // Request background location for Android 10+
      if (Platform.OS === 'android') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn('Background location permission not granted');
          // Continue with foreground tracking
        }
      }

      return true;
    } catch (err) {
      console.warn('Error requesting permissions:', err);
      return false;
    }
  }

  // Get current location (one-time)
  async getCurrentLocation(options?: LocationOptions): Promise<LocationData> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: options?.maximumAge ?? 10000,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        speed: location.coords.speed || undefined,
        heading: location.coords.heading || undefined,
        timestamp: location.timestamp,
      };

      // Filter by accuracy if needed
      if (this.isLocationAcceptable(locationData)) {
        this.lastLocation = locationData;
        return locationData;
      } else {
        throw new Error('Location accuracy is too low');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  }

  // Start watching location (foreground)
  watchLocation(
    callback: (location: LocationData) => void,
    errorCallback?: (error: any) => void,
    options?: LocationOptions
  ): number {
    if (this.isTracking) {
      console.warn('Location tracking already active');
      return -1;
    }

    this.isTracking = true;

    this.watchSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: options?.distanceFilter ?? LOCATION_CONFIG.DISTANCE_FILTER,
        timeInterval: options?.interval ?? this.adaptiveInterval,
      },
      (location) => {
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || 0,
          speed: location.coords.speed || undefined,
          heading: location.coords.heading || undefined,
          timestamp: location.timestamp,
        };

        // Accuracy filter
        if (!this.isLocationAcceptable(locationData)) {
          console.warn('Location accuracy too low, skipping:', locationData.accuracy);
          return;
        }

        // Update last location and speed
        this.lastLocation = locationData;
        this.lastSpeed = locationData.speed || 0;

        // Adaptive interval based on speed
        this.updateAdaptiveInterval(locationData.speed || 0);

        callback(locationData);
      }
    );

    return 1; // Return a watch ID
  }

  // Stop watching location
  stopWatching(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
    this.isTracking = false;
    this.adaptiveInterval = LOCATION_CONFIG.UPDATE_INTERVAL;
  }

  // Check if location accuracy is acceptable (< 50m)
  isLocationAcceptable(location: LocationData): boolean {
    return location.accuracy < LOCATION_CONFIG.ACCURACY_THRESHOLD || location.accuracy === 0;
  }

  // Adaptive interval based on speed
  private updateAdaptiveInterval(speed: number): void {
    // Speed in m/s, convert to km/h for comparison
    const speedKmh = speed * 3.6;

    if (speedKmh > 30) {
      // Moving fast - update more frequently (10 seconds)
      this.adaptiveInterval = LOCATION_CONFIG.MIN_UPDATE_INTERVAL;
    } else if (speedKmh > 5) {
      // Moving - update every 20 seconds
      this.adaptiveInterval = 20000;
    } else {
      // Stationary or slow - update every 30 seconds
      this.adaptiveInterval = LOCATION_CONFIG.MAX_UPDATE_INTERVAL;
    }
  }

  // Get last known location
  getLastLocation(): LocationData | null {
    return this.lastLocation;
  }

  // Check if tracking is active
  isActive(): boolean {
    return this.isTracking;
  }

  // Get current speed
  getCurrentSpeed(): number {
    return this.lastSpeed;
  }
}

export default new LocationService();
