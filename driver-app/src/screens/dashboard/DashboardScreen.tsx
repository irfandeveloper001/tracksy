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
import {
  getCurrentTrip,
  getTripHistory,
  clearCurrentTrip,
} from '../../store/slices/tripSlice';
import { getCurrentUser } from '../../store/slices/authSlice';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { getUnreadCount } from '../../store/slices/notificationSlice';
import LocationStatusIndicator from '../../components/LocationStatusIndicator';
import { COLORS } from '../../constants';

const DashboardScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentTrip, tripHistory, isLoading } = useSelector(
    (state: RootState) => state.trip
  );
  const { currentLocation } = useSelector((state: RootState) => state.location);
  const { unreadCount } = useSelector(
    (state: RootState) => state.notification
  );
  const [refreshing, setRefreshing] = useState(false);
  const { isTracking } = useLocationTracking(false);

  useEffect(() => {
    loadDashboardData();
    dispatch(getUnreadCount());
  }, [dispatch]);

  const loadDashboardData = async () => {
    await Promise.all([
      dispatch(getCurrentUser()),
      dispatch(getCurrentTrip()),
      dispatch(getTripHistory({ limit: 5 })),
      dispatch(getUnreadCount()),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getTripStatus = () => {
    if (!currentTrip) return 'Not Started';
    return currentTrip.status === 'in_progress' ? 'In Progress' : 'Completed';
  };

  const getTripStatusColor = () => {
    if (!currentTrip) return COLORS.TEXT;
    if (currentTrip.status === 'in_progress') return COLORS.SUCCESS;
    return COLORS.PRIMARY;
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

  const handleStartTrip = () => {
    navigation.navigate('StartTrip');
  };

  const handleEndTrip = () => {
    if (currentTrip) {
      navigation.navigate('EndTrip', { tripId: currentTrip.id });
    }
  };

  const handleViewRoute = () => {
    navigation.navigate('RouteView');
  };

  const handleViewTripHistory = () => {
    navigation.navigate('TripHistory');
  };

  const handleViewPerformance = () => {
    navigation.navigate('Performance');
  };

  const handleViewPassengers = () => {
    if (currentTrip) {
      navigation.navigate('Passengers');
    }
  };

  const handleEmergency = () => {
    navigation.navigate('Emergency');
  };

  const handleReportIncident = () => {
    navigation.navigate('IncidentReport');
  };

  const handleViewNotifications = () => {
    navigation.navigate('Notifications');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <OfflineIndicator />
      {/* Location Status */}
      {isTracking && <LocationStatusIndicator />}

      {/* Emergency Button */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={handleEmergency}
      >
        <Text style={styles.emergencyButtonIcon}>🚨</Text>
        <Text style={styles.emergencyButtonText}>EMERGENCY ALERT</Text>
      </TouchableOpacity>

      {/* Current Trip Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Trip Status</Text>
        <View style={styles.statusContainer}>
          <View
            style={[styles.statusDot, { backgroundColor: getTripStatusColor() }]}
          />
          <Text style={[styles.statusText, { color: getTripStatusColor() }]}>
            {getTripStatus()}
          </Text>
        </View>

        {currentTrip && (
          <View style={styles.tripInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Route:</Text>
              <Text style={styles.infoValue}>
                {currentTrip.route?.name || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Started:</Text>
              <Text style={styles.infoValue}>
                {currentTrip.start_time
                  ? new Date(currentTrip.start_time).toLocaleTimeString()
                  : 'N/A'}
              </Text>
            </View>
            {currentTrip.duration && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Duration:</Text>
                <Text style={styles.infoValue}>
                  {formatDuration(currentTrip.duration)}
                </Text>
              </View>
            )}
            {currentTrip.distance && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Distance:</Text>
                <Text style={styles.infoValue}>
                  {formatDistance(currentTrip.distance)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Assigned Route Information */}
      {user?.assigned_route && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Route</Text>
          <View style={styles.routeInfo}>
            <Text style={styles.routeName}>
              {user.assigned_route.name || 'N/A'}
            </Text>
            <Text style={styles.routeDetail}>
              {user.assigned_route.origin} → {user.assigned_route.destination}
            </Text>
            {user.assigned_route.distance && (
              <Text style={styles.routeDetail}>
                Distance: {formatDistance(user.assigned_route.distance)}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Bus Information */}
      {user?.assigned_bus && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bus Information</Text>
          <View style={styles.busInfo}>
            <Text style={styles.busNumber}>
              Bus #{user.assigned_bus.bus_number || 'N/A'}
            </Text>
            <Text style={styles.busDetail}>
              License: {user.assigned_bus.license_plate || 'N/A'}
            </Text>
            <Text style={styles.busDetail}>
              Capacity: {user.assigned_bus.capacity || 'N/A'} seats
            </Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <TouchableOpacity onPress={handleViewNotifications}>
            <View style={styles.notificationBadge}>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
              <Text style={styles.notificationIcon}>🔔</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.actionsContainer}>
          {!currentTrip ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={handleStartTrip}
              disabled={isLoading}
            >
              <Text style={styles.actionButtonText}>Start Trip</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.endButton]}
                onPress={handleEndTrip}
                disabled={isLoading}
              >
                <Text style={styles.actionButtonText}>End Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.viewRouteButton]}
                onPress={handleViewRoute}
              >
                <Text style={styles.actionButtonText}>View Route</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.viewPassengersButton]}
                onPress={handleViewPassengers}
              >
                <Text style={styles.actionButtonText}>Passengers</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.reportIncidentButton]}
            onPress={handleReportIncident}
          >
            <Text style={styles.actionButtonText}>Report Incident</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Statistics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Statistics</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {tripHistory.filter((t) => t.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Trips Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {tripHistory.reduce(
                (sum, t) => sum + (t.distance || 0),
                0
              ) / 1000}
              km
            </Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatDuration(
                tripHistory.reduce((sum, t) => sum + (t.duration || 0), 0)
              )}
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>
      </View>

      {/* Recent Trips */}
      {tripHistory.length > 0 && (
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Recent Trips</Text>
            <TouchableOpacity onPress={handleViewTripHistory}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.performanceButton}
            onPress={handleViewPerformance}
          >
            <Text style={styles.performanceButtonText}>📊 View Performance</Text>
          </TouchableOpacity>
          {tripHistory.slice(0, 3).map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripItem}
              onPress={() =>
                navigation.navigate('TripDetails', { tripId: trip.id })
              }
            >
              <View style={styles.tripItemContent}>
                <Text style={styles.tripItemRoute}>
                  {trip.route?.name || 'Unknown Route'}
                </Text>
                <Text style={styles.tripItemTime}>
                  {trip.start_time
                    ? new Date(trip.start_time).toLocaleString()
                    : 'N/A'}
                </Text>
              </View>
              <Text
                style={[
                  styles.tripItemStatus,
                  {
                    color:
                      trip.status === 'completed'
                        ? COLORS.SUCCESS
                        : trip.status === 'in_progress'
                        ? COLORS.WARNING
                        : COLORS.TEXT,
                  },
                ]}
              >
                {trip.status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Current Location Display */}
      {currentLocation && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Location</Text>
          <Text style={styles.locationText}>
            {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationAccuracy}>
            Accuracy: {Math.round(currentLocation.accuracy)}m
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  tripInfo: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  routeInfo: {
    marginTop: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  routeDetail: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 2,
  },
  busInfo: {
    marginTop: 8,
  },
  busNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  busDetail: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  endButton: {
    backgroundColor: COLORS.ERROR,
  },
  viewRouteButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  viewPassengersButton: {
    backgroundColor: COLORS.WARNING,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  tripItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tripItemContent: {
    flex: 1,
  },
  tripItemRoute: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  tripItemTime: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  tripItemStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emergencyButton: {
    backgroundColor: COLORS.ERROR,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.ERROR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationBadge: {
    position: 'relative',
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  performanceButton: {
    backgroundColor: COLORS.PRIMARY,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  performanceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;

