import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

const BusMarker = ({ busNumber, routeName, isSelected = false }) => {
  return (
    <View style={[styles.container, isSelected && styles.selected]}>
      <View style={[styles.busIcon, isSelected && styles.selectedIcon]}>
        <Text style={styles.busIconText}>🚌</Text>
      </View>
      {isSelected && (
        <View style={styles.infoContainer}>
          <Text style={styles.busNumber}>{busNumber}</Text>
          {routeName && <Text style={styles.routeName}>{routeName}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    zIndex: 1000,
  },
  busIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedIcon: {
    backgroundColor: COLORS.SECONDARY,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  busIconText: {
    fontSize: 20,
  },
  infoContainer: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.xs,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  busNumber: {
    fontSize: FONTS.SIZES.md,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs / 2,
  },
  routeName: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default BusMarker;

