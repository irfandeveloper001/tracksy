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
import { getPassengers } from '../../store/slices/passengerSlice';
import { getCurrentTrip } from '../../store/slices/tripSlice';
import { COLORS } from '../../constants';

const SeatManagementScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { passengers } = useSelector((state: RootState) => state.passenger);
  const { currentTrip } = useSelector((state: RootState) => state.trip);
  const { user } = useSelector((state: RootState) => state.auth);
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

  const busCapacity = user?.assigned_bus?.capacity || 0;
  const occupiedSeats = passengers.filter(
    (p) => p.seat_number && p.status === 'checked_in'
  );
  const availableSeats = busCapacity - occupiedSeats.length;

  // Generate seat layout (simple grid)
  const generateSeatLayout = () => {
    const seats: any[] = [];
    const seatsPerRow = 4; // 2x2 layout
    const rows = Math.ceil(busCapacity / seatsPerRow);

    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= seatsPerRow && seats.length < busCapacity; col++) {
        const seatNumber = `${row}-${col}`;
        const passenger = passengers.find(
          (p) => p.seat_number === seatNumber && p.status === 'checked_in'
        );
        seats.push({
          number: seatNumber,
          occupied: !!passenger,
          passenger: passenger,
        });
      }
    }
    return seats;
  };

  const seatLayout = generateSeatLayout();

  const handleAssignSeat = (seatNumber: string) => {
    // Find unassigned passenger
    const unassignedPassenger = passengers.find(
      (p) => !p.seat_number && p.status === 'checked_in'
    );
    if (unassignedPassenger) {
      navigation.navigate('AssignSeat', {
        passengerId: unassignedPassenger.id,
        seatNumber,
      });
    } else {
      navigation.navigate('AssignSeat', { seatNumber });
    }
  };

  if (!currentTrip) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No active trip</Text>
        <Text style={styles.emptySubtext}>
          Start a trip to view seat layout
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
        <Text style={styles.cardTitle}>Seat Statistics</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{busCapacity}</Text>
            <Text style={styles.statLabel}>Total Seats</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.SUCCESS }]}>
              {occupiedSeats.length}
            </Text>
            <Text style={styles.statLabel}>Occupied</Text>
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
                ? Math.round((occupiedSeats.length / busCapacity) * 100)
                : 0}
              %
            </Text>
            <Text style={styles.statLabel}>Utilization</Text>
          </View>
        </View>
      </View>

      {/* Seat Layout */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seat Layout</Text>
        <Text style={styles.layoutNote}>
          Tap on available seats to assign passengers
        </Text>
        <View style={styles.seatLayoutContainer}>
          {seatLayout.map((seat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.seat,
                seat.occupied && styles.seatOccupied,
                !seat.occupied && styles.seatAvailable,
              ]}
              onPress={() => !seat.occupied && handleAssignSeat(seat.number)}
              disabled={seat.occupied}
            >
              <Text
                style={[
                  styles.seatNumber,
                  seat.occupied && styles.seatNumberOccupied,
                ]}
              >
                {seat.number}
              </Text>
              {seat.passenger && (
                <Text style={styles.seatPassenger} numberOfLines={1}>
                  {seat.passenger.name.split(' ')[0]}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Legend</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.seatAvailable]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.seatOccupied]} />
            <Text style={styles.legendText}>Occupied</Text>
          </View>
        </View>
      </View>

      {/* Assigned Passengers */}
      {occupiedSeats.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Seats</Text>
          {occupiedSeats.map((passenger) => (
            <View key={passenger.id} style={styles.assignedSeatItem}>
              <Text style={styles.assignedSeatNumber}>
                Seat {passenger.seat_number}
              </Text>
              <Text style={styles.assignedSeatName}>{passenger.name}</Text>
              <Text style={styles.assignedSeatId}>ID: {passenger.student_id}</Text>
            </View>
          ))}
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
  layoutNote: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  seatLayoutContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  seat: {
    width: 70,
    height: 70,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  seatAvailable: {
    backgroundColor: '#E8F5E9',
    borderColor: COLORS.SUCCESS,
  },
  seatOccupied: {
    backgroundColor: '#FFEBEE',
    borderColor: COLORS.ERROR,
  },
  seatNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  seatNumberOccupied: {
    color: COLORS.ERROR,
  },
  seatPassenger: {
    fontSize: 10,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.TEXT,
  },
  assignedSeatItem: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  assignedSeatNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  assignedSeatName: {
    fontSize: 14,
    color: COLORS.TEXT,
    marginBottom: 2,
  },
  assignedSeatId: {
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
});

export default SeatManagementScreen;

