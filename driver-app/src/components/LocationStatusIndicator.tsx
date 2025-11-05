import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { COLORS } from '../constants';

const LocationStatusIndicator = () => {
  const { isTracking, isBackgroundTracking, currentLocation, lastUpdateTime } =
    useSelector((state: RootState) => state.location);

  if (!isTracking && !isBackgroundTracking) {
    return null;
  }

  const getStatusText = () => {
    if (isBackgroundTracking) {
      return 'Background Tracking';
    }
    return 'Tracking Active';
  };

  const getStatusColor = () => {
    if (isBackgroundTracking) {
      return COLORS.SUCCESS;
    }
    return COLORS.PRIMARY;
  };

  const getLastUpdate = () => {
    if (!lastUpdateTime) return 'Never';
    const secondsAgo = Math.floor((Date.now() - lastUpdateTime) / 1000);
    if (secondsAgo < 60) {
      return `${secondsAgo}s ago`;
    }
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo}m ago`;
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <View style={styles.dot} />
      <Text style={styles.statusText}>{getStatusText()}</Text>
      {currentLocation && (
        <Text style={styles.locationText}>
          Accuracy: {Math.round(currentLocation.accuracy)}m
        </Text>
      )}
      <Text style={styles.updateText}>Last update: {getLastUpdate()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    marginRight: 8,
  },
  updateText: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.8,
  },
});

export default LocationStatusIndicator;

