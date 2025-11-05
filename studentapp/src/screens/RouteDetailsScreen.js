import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { fetchRouteDetails, fetchRouteStops } from '../store/slices/trackingSlice';
import { favoriteService } from '../services/favoriteService';
import { COLORS, SPACING, FONTS } from '../constants';

const RouteDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { routeId } = route.params || {};
  const { selectedRoute, routeStops, isLoading } = useSelector((state) => state.tracking);
  const [expandedStop, setExpandedStop] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (routeId) {
      dispatch(fetchRouteDetails(routeId));
      dispatch(fetchRouteStops(routeId));
      checkFavorite();
    }
  }, [routeId, dispatch]);

  const checkFavorite = async () => {
    if (routeId) {
      const favorite = await favoriteService.isFavoriteRoute(routeId);
      setIsFavorite(favorite);
    }
  };

  const toggleFavorite = async () => {
    if (!routeId) return;
    if (isFavorite) {
      await favoriteService.removeFavoriteRoute(routeId);
    } else {
      await favoriteService.addFavoriteRoute(routeId);
    }
    setIsFavorite(!isFavorite);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading route details...</Text>
      </View>
    );
  }

  if (!selectedRoute) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Route not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{selectedRoute.name}</Text>
            <Text style={styles.subtitle}>{selectedRoute.description || 'Route Information'}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Start Point:</Text>
          <Text style={styles.infoValue}>{selectedRoute.start_point || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>End Point:</Text>
          <Text style={styles.infoValue}>{selectedRoute.end_point || 'N/A'}</Text>
        </View>
        {selectedRoute.distance && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Distance:</Text>
            <Text style={styles.infoValue}>
              {selectedRoute.distance} km
            </Text>
          </View>
        )}
        {selectedRoute.estimated_duration && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estimated Duration:</Text>
            <Text style={styles.infoValue}>
              {selectedRoute.estimated_duration} minutes
            </Text>
          </View>
        )}
      </View>

      <View style={styles.stopsSection}>
        <Text style={styles.sectionTitle}>Stops ({routeStops.length})</Text>
        {routeStops.map((stop, index) => (
          <TouchableOpacity
            key={stop.id || index}
            style={styles.stopCard}
            onPress={() => setExpandedStop(expandedStop === stop.id ? null : stop.id)}
          >
            <View style={styles.stopHeader}>
              <View style={styles.stopNumber}>
                <Text style={styles.stopNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stopInfo}>
                <Text style={styles.stopName}>{stop.name}</Text>
                {stop.address && (
                  <Text style={styles.stopAddress}>{stop.address}</Text>
                )}
              </View>
              <Text style={styles.expandIcon}>
                {expandedStop === stop.id ? '▲' : '▼'}
              </Text>
            </View>
            {expandedStop === stop.id && (
              <View style={styles.stopDetails}>
                {stop.latitude && stop.longitude && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Coordinates:</Text>
                    <Text style={styles.detailValue}>
                      {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}
                {stop.estimated_time && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estimated Time:</Text>
                    <Text style={styles.detailValue}>{stop.estimated_time}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => navigation.navigate('TrackBus')}
        >
          <Text style={styles.trackButtonText}>Track Buses on This Route</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.stopsButton}
          onPress={() => navigation.navigate('Stops', { routeId: routeId })}
        >
          <Text style={styles.stopsButtonText}>View All Stops</Text>
        </TouchableOpacity>
      </View>
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
  errorText: {
    textAlign: 'center',
    fontSize: FONTS.SIZES.md,
    color: COLORS.ERROR,
    marginTop: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
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
  favoriteButton: {
    padding: SPACING.xs,
  },
  favoriteIcon: {
    fontSize: 28,
  },
  infoSection: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  infoLabel: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  stopsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.SIZES.lg,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.md,
  },
  stopCard: {
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
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  stopNumberText: {
    fontSize: FONTS.SIZES.md,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs,
  },
  stopAddress: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  expandIcon: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  stopDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  detailValue: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  actions: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  trackButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackButtonText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
  },
  stopsButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopsButtonText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
  },
});

export default RouteDetailsScreen;

