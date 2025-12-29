import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTripHistory, setFilters } from '../store/slices/tripSlice';
import TripCard from '../components/TripCard';
import { COLORS, SPACING, FONTS } from '../constants';
import { tripService } from '../services/tripService';

const TripHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { trips, filters, isLoading, error } = useSelector((state) => state.trip);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Fetch trip history when component mounts
    dispatch(fetchTripHistory(filters));
  }, [dispatch]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchTripHistory(filters)).unwrap();
    } catch (error) {
      console.error('Error refreshing trips:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter trips by status
  const filteredTrips = React.useMemo(() => {
    if (selectedStatus === 'all') {
      return trips;
    }
    return trips.filter((trip) => trip.status === selectedStatus);
  }, [trips, selectedStatus]);

  // Format trips for display
  const formattedTrips = React.useMemo(() => {
    return filteredTrips.map((trip) => tripService.formatTrip(trip));
  }, [filteredTrips]);

  // Handle trip press
  const handleTripPress = (trip) => {
    // Navigate to trip details if needed
    navigation.navigate('MyBookings');
  };

  // Status filters
  const statusFilters = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'completed', label: 'Completed', icon: '✅' },
    { id: 'active', label: 'Active', icon: '🚌' },
    { id: 'cancelled', label: 'Cancelled', icon: '❌' },
    { id: 'pending', label: 'Pending', icon: '⏳' },
  ];

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🚌</Text>
      <Text style={styles.emptyTitle}>No Trip History</Text>
      <Text style={styles.emptyText}>
        {selectedStatus === 'all'
          ? "You haven't taken any trips yet. Start by booking a seat!"
          : `No ${statusFilters.find((f) => f.id === selectedStatus)?.label.toLowerCase()} trips.`}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('BookSeat')}
      >
        <Text style={styles.emptyButtonText}>Book a Seat</Text>
      </TouchableOpacity>
    </View>
  );

  // Render trip item
  const renderTrip = ({ item }) => (
    <TripCard trip={item} onPress={() => handleTripPress(item)} />
  );

  // Render status filter
  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        data={statusFilters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedStatus === item.id;
          return (
            <TouchableOpacity
              style={[styles.filterChip, isSelected && styles.filterChipSelected]}
              onPress={() => setSelectedStatus(item.id)}
            >
              <Text style={styles.filterIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  isSelected && styles.filterLabelSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip History</Text>
        <Text style={styles.headerSubtitle}>
          {formattedTrips.length} {formattedTrips.length === 1 ? 'trip' : 'trips'}
        </Text>
      </View>

      {/* Status Filter */}
      {trips.length > 0 && renderStatusFilter()}

      {/* Trips List */}
      <FlatList
        data={formattedTrips}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderTrip}
        contentContainerStyle={
          formattedTrips.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerTitle: {
    fontSize: FONTS.SIZES.xl,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  filterContainer: {
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  filterList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  filterChipSelected: {
    backgroundColor: COLORS.PRIMARY + '20',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  filterIcon: {
    fontSize: 16,
  },
  filterLabel: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  filterLabelSelected: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  list: {
    padding: SPACING.md,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONTS.SIZES.xl,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
  },
  errorContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.ERROR + '10',
    margin: SPACING.md,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONTS.SIZES.sm,
    textAlign: 'center',
  },
});

export default TripHistoryScreen;

