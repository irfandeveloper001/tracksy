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
import { reportIncident } from '../../store/slices/emergencySlice';
import locationService from '../../services/location/locationService';
import { COLORS } from '../../constants';

const IncidentReportScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector(
    (state: RootState) => state.emergency
  );
  const { currentLocation } = useSelector((state: RootState) => state.location);

  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (currentLocation) {
      setLocation({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      });
    }
  }, [currentLocation]);

  const getCurrentLocation = async () => {
    try {
      const loc = await locationService.getCurrentLocation();
      setLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleTakePhoto = () => {
    // TODO: Implement photo capture
    Alert.alert(
      'Photo Capture',
      'Photo capture will be implemented with react-native-image-picker or expo-image-picker'
    );
  };

  const handleSubmit = async () => {
    if (!incidentType.trim()) {
      Alert.alert('Error', 'Please enter incident type');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      await dispatch(
        reportIncident({
          type: incidentType.trim(),
          description: description.trim(),
          location: location,
          photo_url: photoUrl.trim() || undefined,
        })
      ).unwrap();

      Alert.alert('Success', 'Incident reported successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to report incident');
    }
  };

  const incidentTypeSuggestions = [
    'Vehicle Malfunction',
    'Traffic Delay',
    'Road Condition',
    'Weather Issue',
    'Passenger Issue',
    'Route Problem',
    'Other',
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Incident Type */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Incident Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter incident type"
            placeholderTextColor="#999"
            value={incidentType}
            onChangeText={setIncidentType}
          />
          <Text style={styles.suggestionsLabel}>Suggestions:</Text>
          <View style={styles.suggestionsContainer}>
            {incidentTypeSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionChip}
                onPress={() => setIncidentType(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description *</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Describe the incident in detail..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Photo Attachment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Photo (Optional)</Text>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handleTakePhoto}
          >
            <Text style={styles.photoButtonText}>📷 Take Photo</Text>
          </TouchableOpacity>
          {photoUrl && (
            <Text style={styles.photoUrlText} numberOfLines={1}>
              Photo: {photoUrl}
            </Text>
          )}
          <Text style={styles.photoNote}>
            Photo capture requires camera permissions
          </Text>
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          {location ? (
            <>
              <Text style={styles.locationText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              <TouchableOpacity
                style={styles.updateLocationButton}
                onPress={getCurrentLocation}
              >
                <Text style={styles.updateLocationButtonText}>
                  Update Location
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.getLocationButton}
              onPress={getCurrentLocation}
            >
              <Text style={styles.getLocationButtonText}>
                Get Current Location
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading || !incidentType.trim() || !description.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
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
  suggestionsLabel: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionText: {
    fontSize: 12,
    color: COLORS.TEXT,
  },
  descriptionInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.TEXT,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
  },
  photoButton: {
    backgroundColor: COLORS.PRIMARY,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoUrlText: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  photoNote: {
    fontSize: 11,
    color: COLORS.TEXT,
    opacity: 0.5,
    fontStyle: 'italic',
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
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
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
  submitButtonText: {
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

export default IncidentReportScreen;

