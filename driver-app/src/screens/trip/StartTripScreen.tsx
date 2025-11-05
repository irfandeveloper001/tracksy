import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { startTrip, getCurrentTrip } from '../../store/slices/tripSlice';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import locationService from '../../services/location/locationService';
import { COLORS } from '../../constants';

const StartTripScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading, error } = useSelector((state: RootState) => state.trip);
  const { startTracking } = useLocationTracking(true); // Enable background tracking

  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    // Set assigned route as default
    if (user?.assigned_route) {
      setSelectedRoute(user.assigned_route);
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleGetLocation = async () => {
    try {
      setGettingLocation(true);
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to get current location: ' + error.message);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleStartTrip = async () => {
    if (!selectedRoute) {
      Alert.alert('Error', 'Please select a route');
      return;
    }

    if (!user?.assigned_bus) {
      Alert.alert('Error', 'No bus assigned to you');
      return;
    }

    try {
      // Get current location
      let startLocation = null;
      try {
        const location = await locationService.getCurrentLocation();
        startLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      } catch (error) {
        console.warn('Could not get location, starting trip without location');
      }

      // Start trip
      const trip = await dispatch(
        startTrip({
          route_id: selectedRoute.id,
          start_location: startLocation,
        })
      ).unwrap();

      // Start location tracking
      const trackingStarted = await startTracking();
      if (!trackingStarted) {
        Alert.alert(
          'Warning',
          'Trip started but location tracking failed. Please enable location permissions.'
        );
      }

      Alert.alert('Success', 'Trip started successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.replace('Dashboard');
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to start trip');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Route Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Information</Text>
          {selectedRoute ? (
            <View style={styles.routeCard}>
              <Text style={styles.routeName}>{selectedRoute.name}</Text>
              <Text style={styles.routeDetail}>
                {selectedRoute.origin} → {selectedRoute.destination}
              </Text>
              {selectedRoute.distance && (
                <Text style={styles.routeDetail}>
                  Distance: {(selectedRoute.distance / 1000).toFixed(2)} km
                </Text>
              )}
              {selectedRoute.estimated_duration && (
                <Text style={styles.routeDetail}>
                  Estimated Duration: {selectedRoute.estimated_duration} minutes
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.noRouteText}>No route assigned</Text>
          )}
        </View>

        {/* Bus Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bus Information</Text>
          {user?.assigned_bus ? (
            <View style={styles.busCard}>
              <Text style={styles.busNumber}>
                Bus #{user.assigned_bus.bus_number}
              </Text>
              <Text style={styles.busDetail}>
                License: {user.assigned_bus.license_plate}
              </Text>
              <Text style={styles.busDetail}>
                Capacity: {user.assigned_bus.capacity} seats
              </Text>
            </View>
          ) : (
            <Text style={styles.noBusText}>No bus assigned</Text>
          )}
        </View>

        {/* Current Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Starting Location</Text>
          {currentLocation ? (
            <View style={styles.locationCard}>
              <Text style={styles.locationText}>
                {currentLocation.latitude.toFixed(6)},{' '}
                {currentLocation.longitude.toFixed(6)}
              </Text>
              <Text style={styles.locationAccuracy}>
                Accuracy: {Math.round(currentLocation.accuracy)}m
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.getLocationButton}
              onPress={handleGetLocation}
              disabled={gettingLocation}
            >
              {gettingLocation ? (
                <ActivityIndicator color={COLORS.PRIMARY} />
              ) : (
                <Text style={styles.getLocationButtonText}>
                  Get Current Location
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Start Trip Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            (isLoading || !selectedRoute) && styles.startButtonDisabled,
          ]}
          onPress={handleStartTrip}
          disabled={isLoading || !selectedRoute}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startButtonText}>Start Trip</Text>
          )}
        </TouchableOpacity>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            ⚠️ Make sure you have completed your pre-trip inspection before
            starting the trip.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  routeCard: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  routeDetail: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  noRouteText: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  busCard: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.SUCCESS,
  },
  busNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  busDetail: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  noBusText: {
    fontSize: 14,
    color: COLORS.ERROR,
    fontStyle: 'italic',
  },
  locationCard: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  getLocationButton: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  getLocationButtonText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: COLORS.SUCCESS,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.WARNING,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.TEXT,
    lineHeight: 20,
  },
});

export default StartTripScreen;

