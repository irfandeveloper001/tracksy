import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

const TripCard = ({ trip, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return COLORS.SUCCESS;
      case 'cancelled':
        return COLORS.ERROR;
      case 'active':
        return COLORS.PRIMARY;
      case 'pending':
        return COLORS.WARNING;
      default:
        return COLORS.TEXT_SECONDARY;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColor = getStatusColor(trip.status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.routeName}>{trip.routeName || 'Unknown Route'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {trip.status?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>{formatDate(trip.date)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Bus</Text>
            <Text style={styles.infoValue}>{trip.busNumber || 'N/A'}</Text>
          </View>
          {trip.seatNumber && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Seat</Text>
              <Text style={styles.infoValue}>{trip.seatNumber}</Text>
            </View>
          )}
        </View>

        {trip.boardingStop && (
          <View style={styles.stopRow}>
            <View style={[styles.stopDot, { backgroundColor: COLORS.SUCCESS }]} />
            <Text style={styles.stopText}>{trip.boardingStop}</Text>
          </View>
        )}

        {trip.alightingStop && (
          <View style={styles.stopRow}>
            <View style={[styles.stopDot, { backgroundColor: COLORS.ERROR }]} />
            <Text style={styles.stopText}>{trip.alightingStop}</Text>
          </View>
        )}

        <View style={styles.footer}>
          {trip.startTime && (
            <Text style={styles.timeText}>
              {formatTime(trip.startTime)}
              {trip.endTime && ` - ${formatTime(trip.endTime)}`}
            </Text>
          )}
          {trip.duration && (
            <Text style={styles.durationText}>{trip.duration}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  routeName: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.TEXT,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: FONTS.SIZES.xs,
    fontWeight: '600',
  },
  date: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  content: {
    marginTop: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONTS.SIZES.xs,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs / 2,
  },
  infoValue: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  stopDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  stopText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  timeText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  durationText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
});

export default TripCard;

