import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getAssignedRoute, getRouteStops } from '../../store/slices/routeSlice';
import { COLORS } from '../../constants';

const RouteViewScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { assignedRoute, stops, isLoading } = useSelector(
    (state: RootState) => state.route
  );
  const { currentLocation } = useSelector((state: RootState) => state.location);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRouteData();
  }, [dispatch]);

  const loadRouteData = async () => {
    await Promise.all([
      dispatch(getAssignedRoute()),
      dispatch(getRouteStops()),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRouteData();
    setRefreshing(false);
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return 'N/A';
    const km = (meters / 1000).toFixed(2);
    return `${km} km`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleViewStopDetails = (stopId: number) => {
    navigation.navigate('StopDetails', { stopId });
  };

  const handleViewStops = () => {
    navigation.navigate('StopManagement');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {assignedRoute ? (
        <>
          {/* Route Information */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Route Information</Text>
            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>{assignedRoute.name}</Text>
              <Text style={styles.routeDetail}>
                {assignedRoute.origin} → {assignedRoute.destination}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {formatDistance(assignedRoute.distance)}
                  </Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {formatDuration(assignedRoute.estimated_duration)}
                  </Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stops.length}</Text>
                  <Text style={styles.statLabel}>Stops</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Map Placeholder */}
          <View style={styles.mapCard}>
            <Text style={styles.mapTitle}>Route Map</Text>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>📍</Text>
              <Text style={styles.mapPlaceholderSubtext}>
                Map view requires react-native-maps
              </Text>
              <Text style={styles.mapPlaceholderSubtext}>
                Would show:
              </Text>
              <Text style={styles.mapPlaceholderSubtext}>
                • Route polyline
              </Text>
              <Text style={styles.mapPlaceholderSubtext}>
                • All stops marked
              </Text>
              <Text style={styles.mapPlaceholderSubtext}>
                • Current position
              </Text>
            </View>
          </View>

          {/* Stops List */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Stops ({stops.length})</Text>
              <TouchableOpacity onPress={handleViewStops}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {stops.slice(0, 5).map((stop, index) => (
              <TouchableOpacity
                key={stop.id}
                style={[
                  styles.stopItem,
                  stop.arrived && styles.stopItemCompleted,
                ]}
                onPress={() => handleViewStopDetails(stop.id)}
              >
                <View style={styles.stopItemLeft}>
                  <View
                    style={[
                      styles.stopNumber,
                      stop.arrived && styles.stopNumberCompleted,
                    ]}
                  >
                    <Text style={styles.stopNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stopItemContent}>
                    <Text
                      style={[
                        styles.stopName,
                        stop.arrived && styles.stopNameCompleted,
                      ]}
                    >
                      {stop.name}
                    </Text>
                    <Text style={styles.stopAddress}>{stop.address}</Text>
                    {stop.expected_arrival_time && (
                      <Text style={styles.stopTime}>
                        ETA: {new Date(stop.expected_arrival_time).toLocaleTimeString()}
                      </Text>
                    )}
                  </View>
                </View>
                {stop.arrived && (
                  <Text style={styles.arrivedText}>✓ Arrived</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Current Location */}
          {currentLocation && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Current Location</Text>
              <Text style={styles.locationText}>
                {currentLocation.latitude.toFixed(6)},{' '}
                {currentLocation.longitude.toFixed(6)}
              </Text>
              <Text style={styles.locationAccuracy}>
                Accuracy: {Math.round(currentLocation.accuracy)}m
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No route assigned</Text>
          <Text style={styles.emptySubtext}>
            Please contact admin to assign a route
          </Text>
        </View>
      )}

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
  card: {
    backgroundColor: COLORS.BACKGROUND,
    margin: 16,
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
  routeInfo: {
    marginTop: 8,
  },
  routeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  routeDetail: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  mapCard: {
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
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  stopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stopNumberCompleted: {
    backgroundColor: COLORS.SUCCESS,
  },
  stopNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stopItemContent: {
    flex: 1,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  stopNameCompleted: {
    textDecorationLine: 'line-through',
  },
  stopAddress: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 2,
  },
  stopTime: {
    fontSize: 11,
    color: COLORS.TEXT,
    opacity: 0.6,
  },
  arrivedText: {
    fontSize: 12,
    color: COLORS.SUCCESS,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default RouteViewScreen;

