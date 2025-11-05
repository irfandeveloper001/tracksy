import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../store/store';
import {
  checkInPassenger,
  getPassengers,
} from '../../store/slices/passengerSlice';
import { getCurrentTrip } from '../../store/slices/tripSlice';
import { COLORS } from '../../constants';

const CheckInScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { passenger } = route.params || {};
  const dispatch = useDispatch<AppDispatch>();
  const { currentTrip } = useSelector((state: RootState) => state.trip);
  const { passengers, isLoading } = useSelector(
    (state: RootState) => state.passenger
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [studentId, setStudentId] = useState(passenger?.student_id || '');
  const [seatNumber, setSeatNumber] = useState(passenger?.seat_number || '');

  useEffect(() => {
    if (currentTrip) {
      dispatch(getPassengers(currentTrip.id));
    }
  }, [currentTrip, dispatch]);

  const handleCheckIn = async () => {
    if (!studentId.trim()) {
      Alert.alert('Error', 'Please enter student ID');
      return;
    }

    if (!currentTrip) {
      Alert.alert('Error', 'No active trip');
      return;
    }

    // Find passenger by student ID
    const passengerToCheckIn = passengers.find(
      (p) => p.student_id.toLowerCase() === studentId.trim().toLowerCase()
    );

    if (!passengerToCheckIn) {
      Alert.alert(
        'Error',
        'Student not found in passenger list for this trip'
      );
      return;
    }

    if (passengerToCheckIn.status === 'checked_in') {
      Alert.alert('Info', 'Student is already checked in');
      return;
    }

    try {
      await dispatch(
        checkInPassenger({
          student_id: passengerToCheckIn.id,
          trip_id: currentTrip.id,
          seat_number: seatNumber.trim() || undefined,
        })
      ).unwrap();

      Alert.alert('Success', 'Student checked in successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to check-in student');
    }
  };

  const handleScanQR = () => {
    // TODO: Implement QR code scanner
    Alert.alert(
      'QR Scanner',
      'QR code scanner will be implemented with react-native-camera or similar library'
    );
  };

  const formatBusCapacity = () => {
    const busCapacity = user?.assigned_bus?.capacity || 0;
    const checkedInCount = passengers.filter(
      (p) => p.status === 'checked_in'
    ).length;
    const available = busCapacity - checkedInCount;
    return `${checkedInCount} / ${busCapacity} (${available} available)`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Check-In Student</Text>
          <Text style={styles.instructionText}>
            Enter student ID or scan QR code to check-in a passenger
          </Text>
        </View>

        {/* Bus Capacity */}
        {user?.assigned_bus && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bus Capacity</Text>
            <Text style={styles.capacityText}>{formatBusCapacity()}</Text>
          </View>
        )}

        {/* Student ID Input */}
        <View style={styles.card}>
          <Text style={styles.label}>Student ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter student ID"
            placeholderTextColor="#999"
            value={studentId}
            onChangeText={setStudentId}
            autoCapitalize="none"
            editable={!passenger}
          />
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanQR}
          >
            <Text style={styles.scanButtonText}>📷 Scan QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Seat Number Input */}
        <View style={styles.card}>
          <Text style={styles.label}>Seat Number (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter seat number"
            placeholderTextColor="#999"
            value={seatNumber}
            onChangeText={setSeatNumber}
          />
        </View>

        {/* Passenger Preview */}
        {studentId && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Student Information</Text>
            {passengers
              .filter(
                (p) =>
                  p.student_id.toLowerCase() === studentId.trim().toLowerCase()
              )
              .map((p) => (
                <View key={p.id} style={styles.passengerPreview}>
                  <Text style={styles.previewName}>{p.name}</Text>
                  <Text style={styles.previewId}>ID: {p.student_id}</Text>
                  {p.boarding_stop && (
                    <Text style={styles.previewDetail}>
                      Boarding: {p.boarding_stop}
                    </Text>
                  )}
                  {p.alighting_stop && (
                    <Text style={styles.previewDetail}>
                      Alighting: {p.alighting_stop}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.previewStatus,
                      {
                        color:
                          p.status === 'checked_in'
                            ? COLORS.SUCCESS
                            : COLORS.WARNING,
                      },
                    ]}
                  >
                    Status: {p.status}
                  </Text>
                </View>
              ))}
            {passengers.filter(
              (p) =>
                p.student_id.toLowerCase() === studentId.trim().toLowerCase()
            ).length === 0 && (
              <Text style={styles.notFoundText}>
                Student not found in passenger list
              </Text>
            )}
          </View>
        )}

        {/* Check-In Button */}
        <TouchableOpacity
          style={[styles.checkInButton, isLoading && styles.buttonDisabled]}
          onPress={handleCheckIn}
          disabled={isLoading || !studentId.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkInButtonText}>Check In Student</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
  instructionText: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    lineHeight: 20,
  },
  capacityText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  scanButton: {
    backgroundColor: '#F5F5F5',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  scanButtonText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  passengerPreview: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginTop: 8,
  },
  previewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  previewId: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  previewDetail: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.6,
    marginBottom: 2,
  },
  previewStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  notFoundText: {
    fontSize: 14,
    color: COLORS.ERROR,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  checkInButton: {
    backgroundColor: COLORS.SUCCESS,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: COLORS.BACKGROUND,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.TEXT,
  },
  cancelButtonText: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CheckInScreen;

