import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  fetchUserBookings,
  cancelBooking,
  clearError,
} from '../store/slices/bookingSlice';
import { COLORS, SPACING, FONTS } from '../constants';

const MyBookingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { bookings, isLoading, error } = useSelector((state) => state.booking);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [])
  );

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error]);

  const loadBookings = async () => {
    try {
      await dispatch(fetchUserBookings()).unwrap();
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking for seat ${booking.seat_number} on ${booking.trip_date}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelBooking(booking.id)).unwrap();
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              Alert.alert('Error', error || 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return COLORS.SUCCESS;
      case 'pending':
        return COLORS.WARNING;
      case 'cancelled':
        return COLORS.ERROR;
      default:
        return COLORS.TEXT_SECONDARY;
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.statusText, { color }]}>
          {status.toUpperCase()}
        </Text>
      </View>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && bookings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>
          {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No bookings yet</Text>
          <Text style={styles.emptySubtext}>
            Book a seat to see your reservations here
          </Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('BookSeat')}
          >
            <Text style={styles.bookButtonText}>Book a Seat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        bookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingReference}>
                  Ref: {booking.booking_reference || booking.id}
                </Text>
                <Text style={styles.bookingDate}>
                  {formatDate(booking.trip_date)}
                </Text>
              </View>
              {getStatusBadge(booking.status)}
            </View>

            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bus:</Text>
                <Text style={styles.detailValue}>
                  #{booking.bus?.bus_number || booking.bus_id || 'N/A'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Seat:</Text>
                <Text style={styles.detailValue}>{booking.seat_number || 'N/A'}</Text>
              </View>
              {booking.bus?.currentRoute && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Route:</Text>
                  <Text style={styles.detailValue}>
                    {booking.bus.currentRoute.name || 'N/A'}
                  </Text>
                </View>
              )}
            </View>

            {booking.status === 'confirmed' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelBooking(booking)}
              >
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONTS.SIZES.xl,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  bookButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
  },
  bookButtonText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingReference: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs,
  },
  bookingDate: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONTS.SIZES.xs,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  cancelButton: {
    backgroundColor: COLORS.ERROR + '20',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  cancelButtonText: {
    color: COLORS.ERROR,
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
  },
});

export default MyBookingsScreen;

