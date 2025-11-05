import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getTripHistory } from '../../store/slices/tripSlice';
import { COLORS } from '../../constants';

const TripHistoryScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tripHistory, isLoading } = useSelector(
    (state: RootState) => state.trip
  );
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadTripHistory();
  }, [dispatch]);

  const loadTripHistory = async () => {
    await dispatch(
      getTripHistory({
        limit: 50,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTripHistory();
    setRefreshing(false);
  };

  const handleApplyFilters = () => {
    loadTripHistory();
  };

  const filteredTrips = tripHistory.filter((trip) => {
    const query = searchQuery.toLowerCase();
    return (
      trip.route?.name?.toLowerCase().includes(query) ||
      trip.bus?.bus_number?.toLowerCase().includes(query) ||
      trip.status?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number) => {
    if (!meters) return 'N/A';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return COLORS.SUCCESS;
      case 'in_progress':
        return COLORS.WARNING;
      case 'cancelled':
        return COLORS.ERROR;
      default:
        return COLORS.TEXT;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Filters */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Filters</Text>
        
        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search by route or bus number..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Date Range */}
        <View style={styles.dateRow}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>End Date</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApplyFilters}
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Trip List */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Trip History ({filteredTrips.length})
        </Text>
        {filteredTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No trips found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || startDate || endDate
                ? 'Try adjusting your filters'
                : 'Start a trip to see history here'}
            </Text>
          </View>
        ) : (
          filteredTrips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripItem}
              onPress={() => navigation.navigate('TripDetails', { tripId: trip.id })}
            >
              <View style={styles.tripItemHeader}>
                <View style={styles.tripItemLeft}>
                  <Text style={styles.tripRouteName}>
                    {trip.route?.name || 'Unknown Route'}
                  </Text>
                  <Text style={styles.tripDate}>
                    {formatDate(trip.start_time || trip.created_at)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(trip.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{trip.status}</Text>
                </View>
              </View>

              <View style={styles.tripDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>
                    {formatTime(trip.start_time || trip.created_at)}
                    {trip.end_time && ` - ${formatTime(trip.end_time)}`}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>
                    {formatDuration(trip.duration)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Distance:</Text>
                  <Text style={styles.detailValue}>
                    {formatDistance(trip.distance)}
                  </Text>
                </View>
                {trip.bus && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bus:</Text>
                    <Text style={styles.detailValue}>
                      #{trip.bus.bus_number || 'N/A'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
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
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  dateInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
    color: COLORS.TEXT,
  },
  applyButton: {
    backgroundColor: COLORS.PRIMARY,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tripItem: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  tripItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripItemLeft: {
    flex: 1,
  },
  tripRouteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  tripDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 12,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
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

export default TripHistoryScreen;

