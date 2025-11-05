import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { sendEmergency } from '../../store/slices/emergencySlice';
import locationService from '../../services/location/locationService';
import { EmergencyType } from '../../services/emergencyService';
import { COLORS } from '../../constants';

const EmergencyScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector(
    (state: RootState) => state.emergency
  );
  const { currentLocation } = useSelector((state: RootState) => state.location);

  const [emergencyType, setEmergencyType] = useState<EmergencyType | null>(
    null
  );
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    if (currentLocation) {
      setLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
    } else {
      getCurrentLocation();
    }
  }, [currentLocation, dispatch]);

  const handleGetCurrentLocation = async () => {
    try {
      const loc = await locationService.getCurrentLocation();
      setLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
    } catch (error) {
      console.warn('Could not get location for emergency');
    }
  };

  const handleSendEmergency = () => {
    if (!emergencyType) {
      Alert.alert('Error', 'Please select an emergency type');
      return;
    }

    Alert.alert(
      'Send Emergency Alert',
      'Are you sure you want to send an emergency alert? This will immediately notify the admin.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(
                sendEmergency({
                  type: emergencyType,
                  description: description.trim() || undefined,
                  location: location,
                })
              ).unwrap();

              Alert.alert(
                'Emergency Alert Sent',
                'Admin has been notified. Help is on the way!',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error || 'Failed to send emergency alert');
            }
          },
        },
      ]
    );
  };

  const emergencyTypes: { type: EmergencyType; label: string; icon: string }[] =
    [
      { type: 'accident', label: 'Accident', icon: '🚨' },
      { type: 'breakdown', label: 'Vehicle Breakdown', icon: '🚗' },
      { type: 'medical', label: 'Medical Emergency', icon: '🏥' },
      { type: 'other', label: 'Other Emergency', icon: '⚠️' },
    ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ EMERGENCY ALERT</Text>
          <Text style={styles.warningText}>
            Use this only in case of a real emergency. This will immediately
            notify the admin and dispatch team.
          </Text>
        </View>

        {/* Emergency Type Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emergency Type</Text>
          <Text style={styles.cardSubtitle}>
            Select the type of emergency
          </Text>
          <View style={styles.typeGrid}>
            {emergencyTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.typeButton,
                  emergencyType === item.type && styles.typeButtonSelected,
                ]}
                onPress={() => setEmergencyType(item.type)}
              >
                <Text style={styles.typeIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    emergencyType === item.type && styles.typeLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe the emergency situation..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          {location ? (
            <>
              <Text style={styles.locationText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              <TouchableOpacity
                style={styles.updateLocationButton}
                onPress={handleGetCurrentLocation}
              >
                <Text style={styles.updateLocationButtonText}>
                  Update Location
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.getLocationButton}
              onPress={handleGetCurrentLocation}
            >
              <Text style={styles.getLocationButtonText}>
                Get Current Location
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Send Emergency Button */}
        <TouchableOpacity
          style={[
            styles.emergencyButton,
            (!emergencyType || isLoading) && styles.buttonDisabled,
          ]}
          onPress={handleSendEmergency}
          disabled={!emergencyType || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.emergencyButtonIcon}>🚨</Text>
              <Text style={styles.emergencyButtonText}>
                SEND EMERGENCY ALERT
              </Text>
            </>
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
  warningCard: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ERROR,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.ERROR,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.TEXT,
    lineHeight: 20,
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
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: COLORS.PRIMARY,
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  descriptionInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.TEXT,
    backgroundColor: '#FAFAFA',
  },
  locationText: {
    fontSize: 14,
    color: COLORS.TEXT,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  updateLocationButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  updateLocationButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  getLocationButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  getLocationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emergencyButton: {
    backgroundColor: COLORS.ERROR,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 12,
    shadowColor: COLORS.ERROR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emergencyButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  emergencyButtonText: {
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

export default EmergencyScreen;

