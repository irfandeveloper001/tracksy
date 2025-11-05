import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getPassengers } from '../../store/slices/passengerSlice';
import { getCurrentTrip } from '../../store/slices/tripSlice';
import { COLORS } from '../../constants';

const PassengersScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { passengers, isLoading } = useSelector(
    (state: RootState) => state.passenger
  );
  const { currentTrip } = useSelector((state: RootState) => state.trip);
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentTrip) {
      loadPassengers();
    }
  }, [currentTrip, dispatch]);

  const loadPassengers = async () => {
    if (currentTrip) {
      await dispatch(getPassengers(currentTrip.id));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPassengers();
    setRefreshing(false);
  };

  const filteredPassengers = passengers.filter((passenger) => {
    const query = searchQuery.toLowerCase();
    return (
      passenger.name.toLowerCase().includes(query) ||
      passenger.student_id.toLowerCase().includes(query) ||
      (passenger.seat_number &&
        passenger.seat_number.toLowerCase().includes(query))
    );
  });

  const checkedInCount = passengers.filter(
    (p) => p.status === 'checked_in'
  ).length;
  const totalPassengers = passengers.length;
  const busCapacity = user?.assigned_bus?.capacity || 0;
  const availableSeats = busCapacity - checkedInCount;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in':
        return COLORS.SUCCESS;
      case 'confirmed':
        return COLORS.PRIMARY;
      case 'pending':
        return COLORS.WARNING;
      case 'cancelled':
        return COLORS.ERROR;
      default:
        return COLORS.TEXT;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'checked_in':
        return 'Checked In';
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleCheckIn = (passenger: any) => {
    navigation.navigate('CheckIn', { passenger });
  };

  const handleViewSeats = () => {
    navigation.navigate('SeatManagement');
  };

  if (!currentTrip) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No active trip</Text>
        <Text style={styles.emptySubtext}>
          Start a trip to view passengers
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Statistics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Passenger Statistics</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalPassengers}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.SUCCESS }]}>
              {checkedInCount}
            </Text>
            <Text style={styles.statLabel}>Checked In</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.PRIMARY }]}>
              {availableSeats}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {busCapacity > 0
                ? Math.round((checkedInCount / busCapacity) * 100)
                : 0}
              %
            </Text>
            <Text style={styles.statLabel}>Capacity</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.card}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, ID, or seat number..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Actions */}
      <View style={styles.card}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CheckIn')}
          >
            <Text style={styles.actionButtonText}>Quick Check-In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.seatButton]}
            onPress={handleViewSeats}
          >
            <Text style={styles.actionButtonText}>View Seats</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Passengers List */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Passengers ({filteredPassengers.length})
        </Text>
        {filteredPassengers.length === 0 ? (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>
              {searchQuery
                ? 'No passengers found'
                : 'No passengers on this trip'}
            </Text>
          </View>
        ) : (
          filteredPassengers.map((passenger) => (
            <TouchableOpacity
              key={passenger.id}
              style={styles.passengerItem}
              onPress={() =>
                navigation.navigate('PassengerDetails', { passenger })
              }
            >
              <View style={styles.passengerItemLeft}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(passenger.status) },
                  ]}
                />
                <View style={styles.passengerInfo}>
                  <Text style={styles.passengerName}>{passenger.name}</Text>
                  <Text style={styles.passengerId}>
                    ID: {passenger.student_id}
                  </Text>
                  <View style={styles.passengerDetails}>
                    {passenger.boarding_stop && (
                      <Text style={styles.passengerDetail}>
                        Boarding: {passenger.boarding_stop}
                      </Text>
                    )}
                    {passenger.alighting_stop && (
                      <Text style={styles.passengerDetail}>
                        Alighting: {passenger.alighting_stop}
                      </Text>
                    )}
                    {passenger.seat_number && (
                      <Text style={styles.passengerDetail}>
                        Seat: {passenger.seat_number}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.passengerItemRight}>
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(passenger.status) },
                  ]}
                >
                  {getStatusText(passenger.status)}
                </Text>
                {passenger.status !== 'checked_in' && (
                  <TouchableOpacity
                    style={styles.checkInButton}
                    onPress={() => handleCheckIn(passenger)}
                  >
                    <Text style={styles.checkInButtonText}>Check In</Text>
                  </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
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
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatButton: {
    backgroundColor: COLORS.WARNING,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  passengerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  passengerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  passengerId: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  passengerDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  passengerDetail: {
    fontSize: 11,
    color: COLORS.TEXT,
    opacity: 0.6,
  },
  passengerItemRight: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  checkInButton: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default PassengersScreen;

