import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface MapControlsProps {
  onCenterLocation: () => void;
  onShowFullRoute: () => void;
  onToggleTraffic: () => void;
  trafficEnabled: boolean;
  mapType: 'standard' | 'satellite' | 'terrain';
  onMapTypeChange: (type: 'standard' | 'satellite' | 'terrain') => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  onCenterLocation,
  onShowFullRoute,
  onToggleTraffic,
  trafficEnabled,
  mapType,
  onMapTypeChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Center Location Button */}
      <TouchableOpacity style={styles.button} onPress={onCenterLocation}>
        <Text style={styles.buttonIcon}>📍</Text>
      </TouchableOpacity>

      {/* Show Full Route Button */}
      <TouchableOpacity style={styles.button} onPress={onShowFullRoute}>
        <Text style={styles.buttonIcon}>🗺️</Text>
      </TouchableOpacity>

      {/* Toggle Traffic Button */}
      <TouchableOpacity
        style={[styles.button, trafficEnabled && styles.buttonActive]}
        onPress={onToggleTraffic}
      >
        <Text style={styles.buttonIcon}>🚦</Text>
      </TouchableOpacity>

      {/* Map Type Selector */}
      <View style={styles.mapTypeContainer}>
        <TouchableOpacity
          style={[
            styles.mapTypeButton,
            mapType === 'standard' && styles.mapTypeButtonActive,
          ]}
          onPress={() => onMapTypeChange('standard')}
        >
          <Text
            style={[
              styles.mapTypeButtonText,
              mapType === 'standard' && styles.mapTypeButtonTextActive,
            ]}
          >
            Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mapTypeButton,
            mapType === 'satellite' && styles.mapTypeButtonActive,
          ]}
          onPress={() => onMapTypeChange('satellite')}
        >
          <Text
            style={[
              styles.mapTypeButtonText,
              mapType === 'satellite' && styles.mapTypeButtonTextActive,
            ]}
          >
            Satellite
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mapTypeButton,
            mapType === 'terrain' && styles.mapTypeButtonActive,
          ]}
          onPress={() => onMapTypeChange('terrain')}
        >
          <Text
            style={[
              styles.mapTypeButtonText,
              mapType === 'terrain' && styles.mapTypeButtonTextActive,
            ]}
          >
            Terrain
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1000,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  buttonIcon: {
    fontSize: 24,
  },
  mapTypeContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  mapTypeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  mapTypeButtonText: {
    fontSize: 12,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  mapTypeButtonTextActive: {
    color: '#fff',
  },
});

export default MapControls;

