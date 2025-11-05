import React, { useEffect, useState } from 'react';
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
import { getRouteStops, markStopArrival } from '../../store/slices/routeSlice';
import { getCurrentTrip } from '../../store/slices/tripSlice';
import { COLORS } from '../../constants';

const StopDetailsScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { stopId } = route.params as { stopId: number };
  const dispatch = useDispatch<AppDispatch>();
  const { stops, isLoading } = useSelector((state: RootState) => state.route);
  const { currentTrip } = useSelector((state: RootState) => state.trip);
  const { currentLocation } = useSelector((state: RootState) => state.location);
  const [stop, setStop] = useState<any>(null);

  useEffect(() => {
    if (stops.length > 0) {
      const foundStop = stops.find((s) => s.id === stopId);
      if (foundStop) {
        setStop(foundStop);
      }
    } else {
      dispatch(getRouteStops());
    }
  }, [stopId, stops, dispatch]);

  useEffect(() => {
    if (stops.length > 0 && !stop) {
      const foundStop = stops.find((s) => s.id === stopId);
      if (foundStop) {
        setStop(foundStop);
      }
    }
  }, [stops, stopId, stop]);

  const handleMarkArrival = async () => {
    if (!currentTrip) {
      Alert.alert('Error', 'No active trip. Please start a trip first.');
      return;
    }

    Alert.alert(
      'Mark Stop Arrival',
      `Are you sure you have arrived at ${stop?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Arrival',
          onPress: async () => {
            try {
              await dispatch(markStopArrival(stopId)).unwrap();
              Alert.alert('Success', 'Stop arrival marked successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error || 'Failed to mark stop arrival');
            }
          },
        },
      ]
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistance = () => {
    if (!currentLocation || !stop) return null;
    return calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      stop.latitude,
      stop.longitude
    );
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  if (!stop) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading stop details...</Text>
      </View>
    );
  }

  const distance = getDistance();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Stop Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stop Information</Text>
          <Text style={styles.stopName}>{stop.name}</Text>
          <Text style={styles.stopAddress}>{stop.address}</Text>
          
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesLabel}>Coordinates:</Text>
            <Text style={styles.coordinates}>
              {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
            </Text>
          </View>

          {stop.order !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stop Order:</Text>
              <Text style={styles.infoValue}>{stop.order}</Text>
            </View>
          )}
        </View>

        {/* Timing Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timing Information</Text>
          
          {stop.expected_arrival_time && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expected Arrival:</Text>
              <Text style={styles.infoValue}>
                {new Date(stop.expected_arrival_time).toLocaleString()}
              </Text>
            </View>
          )}

          {stop.actual_arrival_time && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Actual Arrival:</Text>
              <Text style={[styles.infoValue, styles.actualTime]}>
                {new Date(stop.actual_arrival_time).toLocaleString()}
              </Text>
            </View>
          )}

          {stop.expected_arrival_time && stop.actual_arrival_time && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Delay:</Text>
              <Text style={styles.infoValue}>
                {Math.round(
                  (new Date(stop.actual_arrival_time).getTime() -
                    new Date(stop.expected_arrival_time).getTime()) /
                    60000
                )}{' '}
                minutes
              </Text>
            </View>
          )}

          {!stop.actual_arrival_time && stop.expected_arrival_time && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time Remaining:</Text>
              <Text style={styles.infoValue}>
                {Math.round(
                  (new Date(stop.expected_arrival_time).getTime() -
                    Date.now()) /
                    60000
                )}{' '}
                minutes
              </Text>
            </View>
          )}
        </View>

        {/* Students Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Students</Text>
          
          {stop.students_boarding !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Boarding:</Text>
              <Text style={styles.infoValue}>{stop.students_boarding}</Text>
            </View>
          )}

          {stop.students_alighting !== undefined && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alighting:</Text>
              <Text style={styles.infoValue}>{stop.students_alighting}</Text>
            </View>
          )}

          {stop.students_boarding === undefined &&
            stop.students_alighting === undefined && (
              <Text style={styles.noDataText}>No student information available</Text>
            )}
        </View>

        {/* Current Location & Distance */}
        {currentLocation && distance !== null && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Distance</Text>
            <Text style={styles.distanceValue}>{formatDistance(distance)}</Text>
            <Text style={styles.distanceLabel}>from current location</Text>
            <Text style={styles.locationText}>
              Current: {currentLocation.latitude.toFixed(6)},{' '}
              {currentLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: stop.arrived ? COLORS.SUCCESS : COLORS.WARNING },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: stop.arrived ? COLORS.SUCCESS : COLORS.WARNING },
              ]}
            >
              {stop.arrived ? 'Arrived' : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {!stop.arrived && currentTrip && (
          <TouchableOpacity
            style={[styles.markArrivalButton, isLoading && styles.buttonDisabled]}
            onPress={handleMarkArrival}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.markArrivalButtonText}>Mark Stop Arrival</Text>
            )}
          </TouchableOpacity>
        )}

        {stop.arrived && (
          <View style={styles.arrivedCard}>
            <Text style={styles.arrivedText}>✓ Stop Arrival Marked</Text>
            <Text style={styles.arrivedTime}>
              Arrived at: {new Date(stop.actual_arrival_time).toLocaleString()}
            </Text>
          </View>
        )}
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
  card: {
    backgroundColor: COLORS.BACKGROUND,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  stopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  stopAddress: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 16,
  },
  coordinatesContainer: {
    marginTop: 8,
  },
  coordinatesLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: COLORS.TEXT,
    fontFamily: 'monospace',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  actualTime: {
    color: COLORS.SUCCESS,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  distanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    textAlign: 'center',
    marginBottom: 4,
  },
  distanceLabel: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.6,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  markArrivalButton: {
    backgroundColor: COLORS.SUCCESS,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  markArrivalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrivedCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  arrivedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
    marginBottom: 4,
  },
  arrivedTime: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
});

export default StopDetailsScreen;

