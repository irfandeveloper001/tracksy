import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getRouteStops, markStopArrival } from '../../store/slices/routeSlice';
import { getCurrentTrip } from '../../store/slices/tripSlice';
import { COLORS } from '../../constants';

const StopManagementScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { stops, isLoading } = useSelector((state: RootState) => state.route);
  const { currentTrip } = useSelector((state: RootState) => state.trip);
  const { currentLocation } = useSelector((state: RootState) => state.location);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStops();
  }, [dispatch]);

  useEffect(() => {
    if (currentTrip) {
      dispatch(getCurrentTrip());
    }
  }, [currentTrip, dispatch]);

  const loadStops = async () => {
    await dispatch(getRouteStops());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStops();
    setRefreshing(false);
  };

  const handleMarkArrival = async (stopId: number) => {
    Alert.alert(
      'Mark Stop Arrival',
      'Are you sure you have arrived at this stop?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Arrival',
          onPress: async () => {
            try {
              await dispatch(markStopArrival(stopId)).unwrap();
              Alert.alert('Success', 'Stop arrival marked successfully');
            } catch (error: any) {
              Alert.alert('Error', error || 'Failed to mark stop arrival');
            }
          },
        },
      ]
    );
  };

  const handleViewStopDetails = (stopId: number) => {
    navigation.navigate('StopDetails', { stopId });
  };

  const getCurrentStopIndex = () => {
    return stops.findIndex((stop) => !stop.arrived);
  };

  const getNextStopIndex = () => {
    const currentIndex = getCurrentStopIndex();
    return currentIndex !== -1 ? currentIndex : stops.length - 1;
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

  const getDistanceToStop = (stop: any) => {
    if (!currentLocation) return null;
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

  const currentStopIndex = getCurrentStopIndex();
  const nextStopIndex = getNextStopIndex();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Current/Next Stop Highlight */}
      {stops.length > 0 && nextStopIndex < stops.length && (
        <View style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>
            {currentStopIndex === -1 ? 'Next Stop' : 'Current Stop'}
          </Text>
          <Text style={styles.highlightStopName}>
            {stops[nextStopIndex].name}
          </Text>
          {currentLocation && (
            <Text style={styles.highlightDistance}>
              {formatDistance(getDistanceToStop(stops[nextStopIndex]) || 0)} away
            </Text>
          )}
        </View>
      )}

      {/* Stops List */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>All Stops ({stops.length})</Text>
        {stops.map((stop, index) => {
          const isCurrent = index === currentStopIndex;
          const isNext = index === nextStopIndex && !stop.arrived;
          const isCompleted = stop.arrived;
          const distance = getDistanceToStop(stop);

          return (
            <TouchableOpacity
              key={stop.id}
              style={[
                styles.stopItem,
                isCurrent && styles.stopItemCurrent,
                isNext && styles.stopItemNext,
                isCompleted && styles.stopItemCompleted,
              ]}
              onPress={() => handleViewStopDetails(stop.id)}
            >
              <View style={styles.stopItemLeft}>
                <View
                  style={[
                    styles.stopNumber,
                    isCurrent && styles.stopNumberCurrent,
                    isNext && styles.stopNumberNext,
                    isCompleted && styles.stopNumberCompleted,
                  ]}
                >
                  <Text style={styles.stopNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stopItemContent}>
                  <View style={styles.stopHeader}>
                    <Text
                      style={[
                        styles.stopName,
                        isCompleted && styles.stopNameCompleted,
                      ]}
                    >
                      {stop.name}
                    </Text>
                    {isCurrent && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                    {isNext && !isCurrent && (
                      <View style={styles.nextBadge}>
                        <Text style={styles.nextBadgeText}>Next</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.stopAddress}>{stop.address}</Text>
                  {stop.expected_arrival_time && (
                    <Text style={styles.stopTime}>
                      ETA: {new Date(stop.expected_arrival_time).toLocaleTimeString()}
                    </Text>
                  )}
                  {stop.actual_arrival_time && (
                    <Text style={styles.stopTime}>
                      Arrived: {new Date(stop.actual_arrival_time).toLocaleTimeString()}
                    </Text>
                  )}
                  {distance !== null && !isCompleted && (
                    <Text style={styles.distanceText}>
                      {formatDistance(distance)} away
                    </Text>
                  )}
                </View>
              </View>
              {!isCompleted && currentTrip && (
                <TouchableOpacity
                  style={styles.markArrivalButton}
                  onPress={() => handleMarkArrival(stop.id)}
                  disabled={isLoading}
                >
                  <Text style={styles.markArrivalButtonText}>Arrived</Text>
                </TouchableOpacity>
              )}
              {isCompleted && (
                <Text style={styles.arrivedText}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Statistics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progress</Text>
        <View style={styles.progressStats}>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>
              {stops.filter((s) => s.arrived).length} / {stops.length}
            </Text>
            <Text style={styles.progressLabel}>Stops Completed</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>
              {Math.round(
                (stops.filter((s) => s.arrived).length / stops.length) * 100
              )}
              %
            </Text>
            <Text style={styles.progressLabel}>Progress</Text>
          </View>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  highlightCard: {
    backgroundColor: COLORS.PRIMARY,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  highlightTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  highlightStopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  highlightDistance: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    backgroundColor: COLORS.BACKGROUND,
    margin: 16,
    marginTop: 0,
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
  stopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  stopItemCurrent: {
    backgroundColor: '#E3F2FD',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  stopItemNext: {
    backgroundColor: '#F1F8E9',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  stopItemCompleted: {
    opacity: 0.6,
  },
  stopItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stopNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stopNumberCurrent: {
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 3,
    borderColor: '#fff',
  },
  stopNumberNext: {
    backgroundColor: COLORS.WARNING,
  },
  stopNumberCompleted: {
    backgroundColor: COLORS.SUCCESS,
  },
  stopNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopItemContent: {
    flex: 1,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT,
    marginRight: 8,
  },
  stopNameCompleted: {
    textDecorationLine: 'line-through',
  },
  currentBadge: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  nextBadge: {
    backgroundColor: COLORS.WARNING,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nextBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  stopAddress: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  stopTime: {
    fontSize: 11,
    color: COLORS.TEXT,
    opacity: 0.6,
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: '500',
    marginTop: 4,
  },
  markArrivalButton: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  markArrivalButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrivedText: {
    fontSize: 24,
    color: COLORS.SUCCESS,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default StopManagementScreen;

