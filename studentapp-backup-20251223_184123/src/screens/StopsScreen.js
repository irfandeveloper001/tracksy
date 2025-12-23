import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { fetchRouteStops } from '../store/slices/trackingSlice';
import { favoriteService } from '../services/favoriteService';
import { calculateDistance, formatDistance } from '../utils/location';
import { COLORS, SPACING, FONTS } from '../constants';

const StopsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { routeId } = route.params || {};
  const { routeStops, selectedRoute, isLoading, userLocation } = useSelector(
    (state) => state.tracking
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteStops, setFavoriteStops] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedStop, setExpandedStop] = useState(null);

  useEffect(() => {
    if (routeId) {
      loadStops();
      loadFavorites();
    }
  }, [routeId]);

  const loadStops = async () => {
    try {
      await dispatch(fetchRouteStops(routeId)).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load stops. Please try again.');
    }
  };

  const loadFavorites = async () => {
    const favorites = await favoriteService.getFavoriteStops();
    setFavoriteStops(favorites);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStops();
    await loadFavorites();
    setRefreshing(false);
  };

  const toggleFavorite = async (stopId) => {
    const isFavorite = favoriteStops.includes(stopId);
    if (isFavorite) {
      await favoriteService.removeFavoriteStop(stopId);
    } else {
      await favoriteService.addFavoriteStop(stopId);
    }
    await loadFavorites();
  };

  const getStopDistance = (stop) => {
    if (!userLocation || !stop.latitude || !stop.longitude) {
      return null;
    }
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      stop.latitude,
      stop.longitude
    );
  };

  const filteredStops = routeStops.filter((stop) => {
    if (showFavoritesOnly && !favoriteStops.includes(stop.id)) {
      return false;
    }
    if (showNearbyOnly) {
      const distance = getStopDistance(stop);
      if (!distance || distance > 1000) {
        return false; // Only show stops within 1km
      }
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        stop.name?.toLowerCase().includes(query) ||
        stop.address?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const sortedStops = [...filteredStops].sort((a, b) => {
    // Sort by position in route
    if (a.position !== undefined && b.position !== undefined) {
      return a.position - b.position;
    }
    // Sort favorites first
    const aIsFavorite = favoriteStops.includes(a.id);
    const bIsFavorite = favoriteStops.includes(b.id);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    // Sort by distance if user location is available
    const aDistance = getStopDistance(a);
    const bDistance = getStopDistance(b);
    if (aDistance && bDistance) {
      return aDistance - bDistance;
    }
    return 0;
  });

  if (isLoading && routeStops.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading stops...</Text>
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
        <Text style={styles.title}>
          {selectedRoute?.name || 'Route'} Stops
        </Text>
        <Text style={styles.subtitle}>
          {filteredStops.length} stop{filteredStops.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stops..."
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterButton, showFavoritesOnly && styles.filterButtonActive]}
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Text style={[styles.filterText, showFavoritesOnly && styles.filterTextActive]}>
              ⭐ Favorites
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, showNearbyOnly && styles.filterButtonActive]}
            onPress={() => setShowNearbyOnly(!showNearbyOnly)}
          >
            <Text style={[styles.filterText, showNearbyOnly && styles.filterTextActive]}>
              📍 Nearby
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stops List */}
      {sortedStops.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.emptyText}>No stops found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'No stops available'}
          </Text>
        </View>
      ) : (
        sortedStops.map((stop, index) => {
          const isFavorite = favoriteStops.includes(stop.id);
          const distance = getStopDistance(stop);
          const isExpanded = expandedStop === stop.id;

          return (
            <TouchableOpacity
              key={stop.id || index}
              style={styles.stopCard}
              onPress={() => setExpandedStop(isExpanded ? null : stop.id)}
            >
              <View style={styles.stopHeader}>
                <View style={styles.stopNumber}>
                  <Text style={styles.stopNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stopInfo}>
                  <View style={styles.stopNameRow}>
                    <Text style={styles.stopName}>{stop.name || 'Stop'}</Text>
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => toggleFavorite(stop.id)}
                    >
                      <Text style={styles.favoriteIcon}>
                        {isFavorite ? '⭐' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {stop.address && (
                    <Text style={styles.stopAddress}>{stop.address}</Text>
                  )}
                  {distance && (
                    <Text style={styles.stopDistance}>
                      📍 {formatDistance(distance)} away
                    </Text>
                  )}
                </View>
                <Text style={styles.expandIcon}>
                  {isExpanded ? '▲' : '▼'}
                </Text>
              </View>

              {isExpanded && (
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
                  <TouchableOpacity
                    style={styles.viewOnMapButton}
                    onPress={() => {
                      navigation.navigate('TrackBus', {
                        stopId: stop.id,
                        stopLocation: {
                          latitude: stop.latitude,
                          longitude: stop.longitude,
                        },
                      });
                    }}
                  >
                    <Text style={styles.viewOnMapText}>View on Map</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })
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
  searchSection: {
    marginBottom: SPACING.lg,
  },
  searchInput: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  filters: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterButton: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  filterButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  filterText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.WHITE,
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
  stopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  stopName: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.TEXT,
    flex: 1,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  stopAddress: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs,
  },
  stopDistance: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.sm,
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
    fontWeight: '500',
  },
  detailValue: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  viewOnMapButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  viewOnMapText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.sm,
    fontWeight: '600',
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
  },
});

export default StopsScreen;

