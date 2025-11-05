import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface RouteInfoCardProps {
  distanceToNextStop: number; // in meters
  estimatedArrivalTime: number; // in seconds
  currentSpeed: number; // in km/h
  nextStopName: string;
}

const RouteInfoCard: React.FC<RouteInfoCardProps> = ({
  distanceToNextStop,
  estimatedArrivalTime,
  currentSpeed,
  nextStopName,
}) => {
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const formatSpeed = (kmh: number) => {
    return `${Math.round(kmh)} km/h`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route Information</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Next Stop:</Text>
        <Text style={styles.value}>{nextStopName || 'N/A'}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Distance:</Text>
        <Text style={styles.value}>{formatDistance(distanceToNextStop)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>ETA:</Text>
        <Text style={styles.value}>{formatTime(estimatedArrivalTime)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Speed:</Text>
        <Text style={styles.value}>{formatSpeed(currentSpeed)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  value: {
    fontSize: 14,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
});

export default RouteInfoCard;

