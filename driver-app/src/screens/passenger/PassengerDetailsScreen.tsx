import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants';

const PassengerDetailsScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { passenger } = route.params as { passenger: any };

  if (!passenger) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No passenger data</Text>
      </View>
    );
  }

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Passenger Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Passenger Information</Text>
          <Text style={styles.passengerName}>{passenger.name}</Text>
          <Text style={styles.passengerId}>Student ID: {passenger.student_id}</Text>
          
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(passenger.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(passenger.status) },
              ]}
            >
              {getStatusText(passenger.status)}
            </Text>
          </View>
        </View>

        {/* Trip Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Information</Text>
          
          {passenger.boarding_stop && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Boarding Stop:</Text>
              <Text style={styles.infoValue}>{passenger.boarding_stop}</Text>
            </View>
          )}

          {passenger.alighting_stop && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alighting Stop:</Text>
              <Text style={styles.infoValue}>{passenger.alighting_stop}</Text>
            </View>
          )}

          {passenger.seat_number && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Seat Number:</Text>
              <Text style={[styles.infoValue, styles.seatValue]}>
                {passenger.seat_number}
              </Text>
            </View>
          )}
        </View>

        {/* Booking Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Booking ID:</Text>
            <Text style={styles.infoValue}>#{passenger.booking_id}</Text>
          </View>
        </View>

        {/* Actions */}
        {passenger.status !== 'checked_in' && (
          <TouchableOpacity
            style={styles.checkInButton}
            onPress={() =>
              navigation.navigate('CheckIn', { passenger })
            }
          >
            <Text style={styles.checkInButtonText}>Check In</Text>
          </TouchableOpacity>
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
  passengerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  passengerId: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
  seatValue: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  checkInButton: {
    backgroundColor: COLORS.SUCCESS,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 18,
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
  },
});

export default PassengerDetailsScreen;

