import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTripHistory, fetchTripStatistics } from '../store/slices/tripSlice';
import { fetchUserBookings } from '../store/slices/bookingSlice';
import StatCard from '../components/StatCard';
import TripCard from '../components/TripCard';
import { COLORS, SPACING, FONTS } from '../constants';
import { tripService } from '../services/tripService';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { trips, statistics, isLoading } = useSelector((state) => state.trip);
  const { bookings } = useSelector((state) => state.booking);
  const [refreshing, setRefreshing] = React.useState(false);



  
  useEffect(() => {
    // Fetch dashboard data when component mounts
    loadDashboardData();
  }, [dispatch]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchTripHistory({ limit: 5 })),
        dispatch(fetchTripStatistics({})),
        dispatch(fetchUserBookings({ limit: 3, status: 'active' })),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Get recent trips (last 3)
  const recentTrips = React.useMemo(() => {
    return trips
      .slice(0, 3)
      .map((trip) => tripService.formatTrip(trip))
      .filter((trip) => trip !== null);
  }, [trips]);

  // Get active bookings
  const activeBookings = React.useMemo(() => {
    return bookings
      .filter((b) => b.status === 'active' || b.status === 'pending')
      .slice(0, 3);
  }, [bookings]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.PRIMARY]}
          tintColor={COLORS.PRIMARY}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.nameText}>{user?.name || 'Student'}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Trips"
            value={statistics.totalTrips || 0}
            icon="🚌"
            color={COLORS.PRIMARY}
            onPress={() => navigation.navigate('TripHistory')}
          />
          <StatCard
            title="On-Time"
            value={`${statistics.onTimePercentage || 0}%`}
            icon="⏰"
            color={COLORS.SUCCESS}
          />
          <StatCard
            title="CO₂ Saved"
            value={`${statistics.co2Saved || 0} kg`}
            icon="🌱"
            color={COLORS.SECONDARY}
          />
          <StatCard
            title="Active"
            value={activeBookings.length || 0}
            subtitle="Bookings"
            icon="📋"
            color={COLORS.INFO}
            onPress={() => navigation.navigate('MyBookings')}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('TrackBus')}
          >
            <Text style={styles.actionIcon}>🚌</Text>
            <Text style={styles.actionTitle}>Track Bus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('BookSeat')}
          >
            <Text style={styles.actionIcon}>🎫</Text>
            <Text style={styles.actionTitle}>Book Seat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Routes')}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionTitle}>Routes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Statistics')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionTitle}>Statistics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Bookings */}
      {activeBookings.length > 0 && (
        <View style={styles.bookingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Bookings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>
          {activeBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingRoute}>{booking.route?.name || 'Route'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: COLORS.PRIMARY + '20' }]}>
                  <Text style={[styles.statusText, { color: COLORS.PRIMARY }]}>
                    {booking.status?.toUpperCase() || 'ACTIVE'}
                  </Text>
                </View>
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingText}>
                  🚌 Bus: {booking.bus?.number || 'N/A'}
                </Text>
                {booking.seat_number && (
                  <Text style={styles.bookingText}>🎫 Seat: {booking.seat_number}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Trips */}
      {recentTrips.length > 0 && (
        <View style={styles.tripsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TripHistory')}>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>
          {recentTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onPress={() => navigation.navigate('TripHistory')} />
          ))}
        </View>
      )}

      {/* User Info */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Your Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student ID:</Text>
            <Text style={styles.infoValue}>{user?.student_id || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Institution:</Text>
            <Text style={styles.infoValue}>{user?.institution || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  welcomeText: {
    fontSize: FONTS.SIZES.xl,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs,
  },
  nameText: {
    fontSize: FONTS.SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  quickActions: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.SIZES.lg,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '500',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  infoLabel: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  seeAllText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  bookingsSection: {
    marginBottom: SPACING.xl,
  },
  bookingCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bookingRoute: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.TEXT,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: FONTS.SIZES.xs,
    fontWeight: '600',
  },
  bookingInfo: {
    gap: SPACING.xs,
  },
  bookingText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  tripsSection: {
    marginBottom: SPACING.xl,
  },
});

export default HomeScreen;

