import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { LOCATION_CONFIG } from '../../constants';
import { LocationData } from '../location/locationService';

// Background location tracking service using Expo Location
class BackgroundLocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private isBackgroundTracking: boolean = false;
  private locationCallback: ((location: LocationData) => void) | null = null;

  // Initialize background location tracking
  async initialize(
    callback: (location: LocationData) => void
  ): Promise<boolean> {
    try {
      this.locationCallback = callback;

      // Request background permissions
      if (Platform.OS === 'android') {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Background location permission not granted');
          return false;
        }
      }

      // Start background location tracking
      await this.startBackgroundTracking();

      this.isBackgroundTracking = true;
      console.log('✅ Background location tracking initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing background location:', error);
      return false;
    }
  }

  // Start background location tracking
  private async startBackgroundTracking(): Promise<void> {
    if (this.watchSubscription !== null) {
      console.warn('Background tracking already active');
      return;
    }

    this.watchSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: LOCATION_CONFIG.DISTANCE_FILTER,
        timeInterval: LOCATION_CONFIG.UPDATE_INTERVAL,
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

        // Filter by accuracy
        if (locationData.accuracy > LOCATION_CONFIG.ACCURACY_THRESHOLD && locationData.accuracy !== 0) {
          console.warn('Location accuracy too low in background:', locationData.accuracy);
          return;
        }

        // Call callback
        if (this.locationCallback) {
          this.locationCallback(locationData);
        }
      }
    );
    console.log('✅ Background location watch started');
  }

  // Stop background location tracking
  stop(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }

    this.isBackgroundTracking = false;
    this.locationCallback = null;
    console.log('✅ Background location tracking stopped');
  }

  // Check if background tracking is active
  isActive(): boolean {
    return this.isBackgroundTracking;
  }
}

export default new BackgroundLocationService();
