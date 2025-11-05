import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  fetchSeatAvailability,
  setSelectedBus,
  setSelectedSeat,
  setSelectedDate,
  createBooking,
  clearError,
} from '../store/slices/bookingSlice';
import { fetchBuses } from '../store/slices/trackingSlice';
import SeatMap from '../components/SeatMap';
import Button from '../components/Button';
import Input from '../components/Input';
import { COLORS, SPACING, FONTS } from '../constants';

const SeatAvailabilityScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { busId, tripDate } = route.params || {};
  
  const {
    buses,
    isLoading: busesLoading,
  } = useSelector((state) => state.tracking);
  
  const {
    seatAvailability,
    selectedBus,
    selectedSeat,
    selectedDate,
    isLoading,
    error,
  } = useSelector((state) => state.booking);

  const [showBusPicker, setShowBusPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(tripDate || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Load buses if not already loaded
    if (buses.length === 0) {
      dispatch(fetchBuses());
    }

    // Set initial bus if provided
    if (busId && buses.length > 0) {
      const bus = buses.find((b) => b.id === busId);
      if (bus) {
        dispatch(setSelectedBus(bus));
      }
    }

    // Load seat availability if bus and date are set
    if (selectedBus && date) {
      loadSeatAvailability();
    }
  }, [busId, buses, selectedBus, date]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  const loadSeatAvailability = async () => {
    if (!selectedBus || !date) return;
    
    try {
      await dispatch(fetchSeatAvailability({
        busId: selectedBus.id,
        tripDate: date,
      })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load seat availability. Please try again.');
    }
  };

  const handleBusSelect = (bus) => {
    dispatch(setSelectedBus(bus));
    setShowBusPicker(false);
    dispatch(setSelectedSeat(null));
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    dispatch(setSelectedDate(newDate));
    dispatch(setSelectedSeat(null));
  };

  const handleSeatSelect = (seatNumber) => {
    if (selectedSeat === seatNumber) {
      dispatch(setSelectedSeat(null));
    } else {
      dispatch(setSelectedSeat(seatNumber));
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedBus) {
      Alert.alert('Error', 'Please select a bus');
      return;
    }

    if (!selectedSeat) {
      Alert.alert('Error', 'Please select a seat');
      return;
    }

    if (!date) {
      Alert.alert('Error', 'Please select a trip date');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book seat ${selectedSeat} on bus ${selectedBus.bus_number || selectedBus.id} for ${date}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const result = await dispatch(createBooking({
                bus_id: selectedBus.id,
                seat_number: selectedSeat,
                trip_date: date,
              })).unwrap();

              Alert.alert(
                'Success',
                'Booking created successfully!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.navigate('MyBookings');
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', error || 'Failed to create booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getAvailableBuses = () => {
    return buses.filter((bus) => bus.status === 'active');
  };

  const getStatusCounts = () => {
    if (!seatAvailability) {
      return { available: 0, occupied: 0, reserved: 0 };
    }

    const seatMap = seatAvailability.seat_map || {};
    const counts = {
      available: 0,
      occupied: 0,
      reserved: 0,
    };

    Object.values(seatMap).forEach((status) => {
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Seat Availability</Text>
        <Text style={styles.subtitle}>Select a bus and date to view available seats</Text>
      </View>

      {/* Bus Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Select Bus</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowBusPicker(!showBusPicker)}
        >
          <Text style={styles.pickerText}>
            {selectedBus
              ? `Bus #${selectedBus.bus_number || selectedBus.id} - ${selectedBus.currentRoute?.name || 'Route'}`
              : 'Select a bus'}
          </Text>
          <Text style={styles.pickerIcon}>▼</Text>
        </TouchableOpacity>

        {showBusPicker && (
          <View style={styles.pickerContainer}>
            {getAvailableBuses().map((bus) => (
              <TouchableOpacity
                key={bus.id}
                style={styles.pickerItem}
                onPress={() => handleBusSelect(bus)}
              >
                <Text style={styles.pickerItemText}>
                  Bus #{bus.bus_number || bus.id} - {bus.currentRoute?.name || 'Route'}
                </Text>
                {bus.capacity && (
                  <Text style={styles.pickerItemSubtext}>
                    Capacity: {bus.capacity} seats
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Input
          label="Trip Date"
          value={date}
          onChangeText={handleDateChange}
          placeholder="YYYY-MM-DD"
          editable={true}
        />
      </View>

      {/* Load Button */}
      {selectedBus && date && (
        <Button
          title="Load Seat Availability"
          onPress={loadSeatAvailability}
          loading={isLoading}
          style={styles.loadButton}
        />
      )}

      {/* Seat Availability Info */}
      {seatAvailability && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Seat Availability</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total Seats:</Text>
              <Text style={styles.infoValue}>{seatAvailability.total_seats || 0}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: COLORS.SECONDARY }]}>
                Available:
              </Text>
              <Text style={[styles.infoValue, { color: COLORS.SECONDARY }]}>
                {seatAvailability.available_seats || 0}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: COLORS.WARNING }]}>
                Reserved:
              </Text>
              <Text style={[styles.infoValue, { color: COLORS.WARNING }]}>
                {seatAvailability.reserved_seats || 0}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: COLORS.ERROR }]}>
                Occupied:
              </Text>
              <Text style={[styles.infoValue, { color: COLORS.ERROR }]}>
                {seatAvailability.occupied_seats || 0}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Seat Map */}
      {seatAvailability && (
        <View style={styles.seatMapSection}>
          <SeatMap
            seatMap={seatAvailability.seat_map}
            totalSeats={seatAvailability.total_seats}
            selectedSeat={selectedSeat}
            onSeatSelect={handleSeatSelect}
          />
        </View>
      )}

      {/* Booking Button */}
      {selectedBus && selectedSeat && date && (
        <Button
          title={`Book Seat ${selectedSeat}`}
          onPress={handleConfirmBooking}
          loading={isLoading}
          style={styles.bookButton}
        />
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading seat availability...</Text>
        </View>
      )}
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
  },
  title: {
    fontSize: FONTS.SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '500',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    padding: SPACING.md,
    backgroundColor: COLORS.WHITE,
    minHeight: 44,
  },
  pickerText: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT,
    flex: 1,
  },
  pickerIcon: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  pickerContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginTop: SPACING.xs,
    maxHeight: 200,
  },
  pickerItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  pickerItemText: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  pickerItemSubtext: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.xs,
  },
  loadButton: {
    marginBottom: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: FONTS.SIZES.lg,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: FONTS.SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  seatMapSection: {
    marginBottom: SPACING.xl,
  },
  bookButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default SeatAvailabilityScreen;

