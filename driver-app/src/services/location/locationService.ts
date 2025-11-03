import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import { LOCATION_CONFIG } from '../../constants';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

class LocationService {
  private watchId: number | null = null;

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Tracksy needs access to your location to track trips.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || 0,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        {
          accuracy: {
            android: 'high' as const,
            ios: 'best' as const,
          },
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  watchLocation(
    callback: (location: LocationData) => void,
    errorCallback?: (error: any) => void
  ): number {
    this.watchId = Geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        if (errorCallback) errorCallback(error);
      },
      {
        accuracy: {
          android: 'high' as const,
          ios: 'best' as const,
        },
        enableHighAccuracy: true,
        distanceFilter: LOCATION_CONFIG.DISTANCE_FILTER,
        interval: LOCATION_CONFIG.UPDATE_INTERVAL,
        fastestInterval: LOCATION_CONFIG.FASTEST_INTERVAL,
      }
    );

    return this.watchId;
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

export default new LocationService();

