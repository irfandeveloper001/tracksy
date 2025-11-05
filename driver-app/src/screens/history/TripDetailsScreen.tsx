import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getTripDetails } from '../../store/slices/tripSlice';
import { COLORS } from '../../constants';

const TripDetailsScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { tripId } = route.params as { tripId: number };
  const dispatch = useDispatch<AppDispatch>();
  const { tripDetails, isLoading } = useSelector(
    (state: RootState) => state.trip
  );

  useEffect(() => {
    if (tripId) {
      dispatch(getTripDetails(tripId));
    }
  }, [tripId, dispatch]);

  if (isLoading || !tripDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDistance = (meters: number) => {
    if (!meters) return 'N/A';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const calculateAverageSpeed = () => {
    if (!tripDetails.duration || !tripDetails.distance) return 0;
    const hours = tripDetails.duration / 3600;
    const km = tripDetails.distance / 1000;
    return hours > 0 ? (km / hours).toFixed(1) : 0;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Trip Overview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Overview</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Route:</Text>
            <Text style={styles.infoValue}>
              {tripDetails.route?.name || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bus:</Text>
            <Text style={styles.infoValue}>
              #{tripDetails.bus?.bus_number || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color:
                    tripDetails.status === 'completed'
                      ? COLORS.SUCCESS
                      : tripDetails.status === 'in_progress'
                      ? COLORS.WARNING
                      : COLORS.ERROR,
                },
              ]}
            >
              {tripDetails.status}
            </Text>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Date & Time</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {formatDate(tripDetails.start_time || tripDetails.created_at)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Time:</Text>
            <Text style={styles.infoValue}>
              {formatTime(tripDetails.start_time || tripDetails.created_at)}
            </Text>
          </View>
          {tripDetails.end_time && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>End Time:</Text>
              <Text style={styles.infoValue}>
                {formatTime(tripDetails.end_time)}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration:</Text>
            <Text style={styles.infoValue}>
              {formatDuration(tripDetails.duration)}
            </Text>
          </View>
        </View>

        {/* Trip Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatDistance(tripDetails.distance)}
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {calculateAverageSpeed()} km/h
              </Text>
              <Text style={styles.statLabel}>Avg Speed</Text>
            </View>
            {tripDetails.stops && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {tripDetails.stops.length}
                </Text>
                <Text style={styles.statLabel}>Stops</Text>
              </View>
            )}
          </View>
        </View>

        {/* Location Information */}
        {(tripDetails.start_location || tripDetails.end_location) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location Information</Text>
            {tripDetails.start_location && (
              <View style={styles.locationContainer}>
                <Text style={styles.locationLabel}>Start Location:</Text>
                <Text style={styles.locationValue}>
                  {tripDetails.start_location.latitude.toFixed(6)},{' '}
                  {tripDetails.start_location.longitude.toFixed(6)}
                </Text>
              </View>
            )}
            {tripDetails.end_location && (
              <View style={styles.locationContainer}>
                <Text style={styles.locationLabel}>End Location:</Text>
                <Text style={styles.locationValue}>
                  {tripDetails.end_location.latitude.toFixed(6)},{' '}
                  {tripDetails.end_location.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Stops */}
        {tripDetails.stops && tripDetails.stops.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Stops ({tripDetails.stops.length})</Text>
            {tripDetails.stops.map((stop: any, index: number) => (
              <View key={stop.id || index} style={styles.stopItem}>
                <View style={styles.stopNumber}>
                  <Text style={styles.stopNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stopInfo}>
                  <Text style={styles.stopName}>{stop.name || 'Stop'}</Text>
                  {stop.actual_time && (
                    <Text style={styles.stopTime}>
                      Arrived: {formatTime(stop.actual_time)}
                    </Text>
                  )}
                  {stop.expected_time && (
                    <Text style={styles.stopTime}>
                      Expected: {formatTime(stop.expected_time)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Passengers */}
        {tripDetails.passengers && tripDetails.passengers.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Passengers ({tripDetails.passengers.length})
            </Text>
            {tripDetails.passengers.map((passenger: any, index: number) => (
              <View key={passenger.id || index} style={styles.passengerItem}>
                <Text style={styles.passengerName}>
                  {passenger.name || 'Passenger'}
                </Text>
                {passenger.seat_number && (
                  <Text style={styles.passengerSeat}>
                    Seat: {passenger.seat_number}
                  </Text>
                )}
              </View>
            ))}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 14,
    color: COLORS.TEXT,
    fontFamily: 'monospace',
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  stopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stopNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  stopTime: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  passengerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  passengerName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  passengerSeat: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
});

export default TripDetailsScreen;

