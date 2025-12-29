import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';
import { formatDistance } from '../utils/location';

const BusInfoCard = ({ bus, onClose, onDetailsPress }) => {
  if (!bus) return null;

  const location = bus.location || {};
  const route = bus.currentRoute || bus.route || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.busInfo}>
          <Text style={styles.busNumber}>Bus #{bus.bus_number || bus.id}</Text>
          {route.name && <Text style={styles.routeName}>{route.name}</Text>}
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.details}>
        {bus.driver && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Driver:</Text>
            <Text style={styles.detailValue}>{bus.driver.name || 'N/A'}</Text>
          </View>
        )}

        {location.speed !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Speed:</Text>
            <Text style={styles.detailValue}>
              {Math.round(location.speed || 0)} km/h
            </Text>
          </View>
        )}

        {bus.capacity && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Capacity:</Text>
            <Text style={styles.detailValue}>{bus.capacity} seats</Text>
          </View>
        )}

        {bus.status && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[styles.statusBadge, styles[`status_${bus.status}`]]}>
              <Text style={styles.statusText}>{bus.status.toUpperCase()}</Text>
            </View>
          </View>
        )}
      </View>

      {onDetailsPress && (
        <TouchableOpacity style={styles.detailsButton} onPress={onDetailsPress}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.md,
    margin: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  busInfo: {
    flex: 1,
  },
  busNumber: {
    fontSize: FONTS.SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs,
  },
  routeName: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: FONTS.SIZES.lg,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: 'bold',
  },
  details: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  status_active: {
    backgroundColor: COLORS.SUCCESS + '20',
  },
  status_inactive: {
    backgroundColor: COLORS.TEXT_SECONDARY + '20',
  },
  status_maintenance: {
    backgroundColor: COLORS.WARNING + '20',
  },
  status_emergency: {
    backgroundColor: COLORS.ERROR + '20',
  },
  statusText: {
    fontSize: FONTS.SIZES.xs,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  detailsButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  detailsButtonText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
  },
});

export default BusInfoCard;

