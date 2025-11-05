import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DESIGN } from '../../constants/design';

interface TripCardProps {
  trip: {
    id: number;
    route?: { name: string };
    status: string;
    start_time?: string;
    distance?: number;
    duration?: number;
  };
  onPress?: () => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return DESIGN.COLORS.SUCCESS;
      case 'in_progress':
        return DESIGN.COLORS.WARNING;
      case 'cancelled':
        return DESIGN.COLORS.ERROR;
      default:
        return DESIGN.COLORS.TEXT_SECONDARY;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return 'N/A';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const CardContent = () => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.routeName}>
          {trip.route?.name || 'Unknown Route'}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(trip.status) },
          ]}
        >
          <Text style={styles.statusText}>{trip.status}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>
            {formatDate(trip.start_time)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Distance:</Text>
          <Text style={styles.detailValue}>
            {formatDistance(trip.distance)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>
            {formatDuration(trip.duration)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DESIGN.COLORS.BACKGROUND,
    padding: DESIGN.SPACING.M,
    borderRadius: DESIGN.RADIUS.L,
    marginBottom: DESIGN.SPACING.M,
    borderLeftWidth: 4,
    borderLeftColor: DESIGN.COLORS.PRIMARY,
    ...DESIGN.SHADOWS.MEDIUM,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DESIGN.SPACING.M,
  },
  routeName: {
    fontSize: DESIGN.FONTS.SIZE.L,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
    color: DESIGN.COLORS.TEXT,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: DESIGN.SPACING.S,
    paddingVertical: DESIGN.SPACING.XS,
    borderRadius: DESIGN.RADIUS.S,
  },
  statusText: {
    color: '#fff',
    fontSize: DESIGN.FONTS.SIZE.XS,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
    textTransform: 'capitalize',
  },
  details: {
    gap: DESIGN.SPACING.XS,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: DESIGN.FONTS.SIZE.S,
    color: DESIGN.COLORS.TEXT_SECONDARY,
  },
  detailValue: {
    fontSize: DESIGN.FONTS.SIZE.S,
    fontWeight: DESIGN.FONTS.WEIGHT.MEDIUM,
    color: DESIGN.COLORS.TEXT,
  },
});

export default TripCard;

