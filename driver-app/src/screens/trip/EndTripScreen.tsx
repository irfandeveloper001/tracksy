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
import { useRoute } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../store/store';
import { endTrip, getTripDetails, clearCurrentTrip } from '../../store/slices/tripSlice';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import locationService from '../../services/location/locationService';
import { COLORS } from '../../constants';

const EndTripScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { tripId } = route.params as { tripId: number };
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTrip, isLoading, error } = useSelector(
    (state: RootState) => state.trip
  );
  const { stopTracking } = useLocationTracking(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (tripId) {
      dispatch(getTripDetails(tripId));
    }
  }, [tripId, dispatch]);

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

  const handleEndTrip = async () => {
    Alert.alert(
      'Confirm End Trip',
      'Are you sure you want to end this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: async () => {
            try {
              // Stop location tracking
              stopTracking();

              // Get current location
              let endLocation = null;
              try {
                const location = await locationService.getCurrentLocation();
                endLocation = {
                  latitude: location.latitude,
                  longitude: location.longitude,
                };
              } catch (error) {
                console.warn('Could not get location, ending trip without location');
              }

              // End trip
              await dispatch(
                endTrip({
                  tripId,
                  data: { end_location: endLocation },
                })
              ).unwrap();

              // Clear current trip
              dispatch(clearCurrentTrip());

              Alert.alert('Success', 'Trip ended successfully!', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.replace('Dashboard');
                  },
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error || 'Failed to end trip');
            }
          },
        },
      ]
    );
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return 'N/A';
    const km = (meters / 1000).toFixed(2);
    return `${km} km`;
  };

  if (!selectedTrip) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading trip details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Trip Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Route:</Text>
              <Text style={styles.summaryValue}>
                {selectedTrip.route?.name || 'N/A'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Started:</Text>
              <Text style={styles.summaryValue}>
                {selectedTrip.start_time
                  ? new Date(selectedTrip.start_time).toLocaleString()
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>
                {formatDuration(selectedTrip.duration)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Distance:</Text>
              <Text style={styles.summaryValue}>
                {formatDistance(selectedTrip.distance)}
              </Text>
            </View>
            {selectedTrip.passenger_count !== undefined && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Passengers:</Text>
                <Text style={styles.summaryValue}>
                  {selectedTrip.passenger_count}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Ending Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ending Location</Text>
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

        {/* End Trip Button */}
        <TouchableOpacity
          style={[styles.endButton, isLoading && styles.endButtonDisabled]}
          onPress={handleEndTrip}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.endButtonText}>End Trip</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT,
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
  summaryCard: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.TEXT,
    fontWeight: '500',
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
  endButton: {
    backgroundColor: COLORS.ERROR,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  endButtonDisabled: {
    opacity: 0.6,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: COLORS.BACKGROUND,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.TEXT,
  },
  cancelButtonText: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EndTripScreen;

