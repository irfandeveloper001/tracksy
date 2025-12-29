import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

const SeatMap = ({
  seatMap,
  totalSeats,
  selectedSeat,
  onSeatSelect,
  disabled = false,
}) => {
  // Generate seat layout (2-2 configuration)
  const seatsPerRow = 2;
  const rows = Math.ceil(totalSeats / seatsPerRow);

  const getSeatStatus = (seatNumber) => {
    if (!seatMap || !seatMap[seatNumber]) {
      return 'available';
    }
    return seatMap[seatNumber];
  };

  const isSeatSelected = (seatNumber) => {
    return selectedSeat === seatNumber;
  };

  const handleSeatPress = (seatNumber) => {
    if (disabled) return;
    
    const status = getSeatStatus(seatNumber);
    if (status === 'available' || isSeatSelected(seatNumber)) {
      onSeatSelect(seatNumber);
    }
  };

  const getSeatStyle = (seatNumber) => {
    const status = getSeatStatus(seatNumber);
    const isSelected = isSeatSelected(seatNumber);

    if (isSelected) {
      return [styles.seat, styles.seatSelected];
    }

    switch (status) {
      case 'occupied':
        return [styles.seat, styles.seatOccupied];
      case 'reserved':
        return [styles.seat, styles.seatReserved];
      case 'available':
      default:
        return [styles.seat, styles.seatAvailable];
    }
  };

  const getSeatTextStyle = (seatNumber) => {
    const status = getSeatStatus(seatNumber);
    const isSelected = isSeatSelected(seatNumber);

    if (isSelected) {
      return styles.seatTextSelected;
    }

    switch (status) {
      case 'occupied':
        return styles.seatTextOccupied;
      case 'reserved':
        return styles.seatTextReserved;
      case 'available':
      default:
        return styles.seatTextAvailable;
    }
  };

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.seatAvailable]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.seatReserved]} />
          <Text style={styles.legendText}>Reserved</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.seatOccupied]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.seatSelected]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
      </View>

      {/* Bus Layout */}
      <View style={styles.busLayout}>
        {/* Driver Section */}
        <View style={styles.driverSection}>
          <Text style={styles.driverText}>🚌 Driver</Text>
        </View>

        {/* Seats Grid */}
        <View style={styles.seatsGrid}>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <View key={rowIndex} style={styles.seatRow}>
              {Array.from({ length: seatsPerRow }, (_, colIndex) => {
                const seatNumber = rowIndex * seatsPerRow + colIndex + 1;
                if (seatNumber > totalSeats) {
                  return <View key={colIndex} style={styles.emptySeat} />;
                }

                const status = getSeatStatus(seatNumber.toString());
                const isSelected = isSeatSelected(seatNumber.toString());

                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={getSeatStyle(seatNumber.toString())}
                    onPress={() => handleSeatPress(seatNumber.toString())}
                    disabled={disabled || status === 'occupied' || status === 'reserved'}
                  >
                    <Text style={getSeatTextStyle(seatNumber.toString())}>
                      {seatNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Exit Section */}
        <View style={styles.exitSection}>
          <Text style={styles.exitText}>🚪 Exit</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT,
  },
  busLayout: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  driverSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
  },
  driverText: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
  seatsGrid: {
    marginBottom: SPACING.md,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  seat: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
    borderWidth: 2,
  },
  seatAvailable: {
    backgroundColor: COLORS.SECONDARY + '20',
    borderColor: COLORS.SECONDARY,
  },
  seatReserved: {
    backgroundColor: COLORS.WARNING + '20',
    borderColor: COLORS.WARNING,
  },
  seatOccupied: {
    backgroundColor: COLORS.ERROR + '20',
    borderColor: COLORS.ERROR,
  },
  seatSelected: {
    backgroundColor: COLORS.PRIMARY + '40',
    borderColor: COLORS.PRIMARY,
    borderWidth: 3,
  },
  seatTextAvailable: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.SECONDARY,
  },
  seatTextReserved: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.WARNING,
  },
  seatTextOccupied: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.ERROR,
  },
  seatTextSelected: {
    fontSize: FONTS.SIZES.md,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  emptySeat: {
    width: 50,
    height: 50,
    marginHorizontal: SPACING.xs,
  },
  exitSection: {
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 8,
  },
  exitText: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.TEXT,
  },
});

export default SeatMap;

