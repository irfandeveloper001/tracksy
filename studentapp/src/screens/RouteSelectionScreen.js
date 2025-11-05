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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchRoutes, fetchRouteDetails } from '../store/slices/trackingSlice';
import { favoriteService } from '../services/favoriteService';
import { COLORS, SPACING, FONTS } from '../constants';
import { calculateDistance } from '../utils/location';

const RouteSelectionScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { routes, isLoading, userLocation } = useSelector((state) => state.tracking);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteRoutes, setFavoriteRoutes] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRoutes();
    loadFavorites();
  }, []);

  const loadRoutes = async () => {
    try {
      await dispatch(fetchRoutes()).unwrap();
    } catch (error) {
      console.error('Failed to load routes:', error);
    }
  };

  const loadFavorites = async () => {
    const favorites = await favoriteService.getFavoriteRoutes();
    setFavoriteRoutes(favorites);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRoutes();
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRoutePress = async (route) => {
    await dispatch(fetchRouteDetails(route.id));
    navigation.navigate('RouteDetails', { routeId: route.id });
  };

  const toggleFavorite = async (routeId) => {
    const isFavorite = favoriteRoutes.includes(routeId);
    if (isFavorite) {
      await favoriteService.removeFavoriteRoute(routeId);
    } else {
      await favoriteService.addFavoriteRoute(routeId);
    }
    await loadFavorites();
  };

  const filteredRoutes = routes.filter((route) => {
    if (showFavoritesOnly && !favoriteRoutes.includes(route.id)) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        route.name?.toLowerCase().includes(query) ||
        route.start_point?.toLowerCase().includes(query) ||
        route.end_point?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    // Sort favorites first
    const aIsFavorite = favoriteRoutes.includes(a.id);
    const bIsFavorite = favoriteRoutes.includes(b.id);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });

  const getRouteDistance = (route) => {
    if (!userLocation || !route.stops || route.stops.length === 0) {
      return null;
    }
    const firstStop = route.stops[0];
    if (firstStop && firstStop.latitude && firstStop.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        firstStop.latitude,
        firstStop.longitude
      );
      return distance;
    }
    return null;
  };

  if (isLoading && routes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading routes...</Text>
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
        <Text style={styles.title}>Routes</Text>
        <Text style={styles.subtitle}>
          {filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search routes..."
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={[styles.filterButton, showFavoritesOnly && styles.filterButtonActive]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Text style={[styles.filterText, showFavoritesOnly && styles.filterTextActive]}>
            ⭐ Favorites
          </Text>
        </TouchableOpacity>
      </View>

      {/* Routes List */}
      {sortedRoutes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyText}>No routes found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search term' : 'No routes available at the moment'}
          </Text>
        </View>
      ) : (
        sortedRoutes.map((route) => {
          const isFavorite = favoriteRoutes.includes(route.id);
          const distance = getRouteDistance(route);

          return (
            <TouchableOpacity
              key={route.id}
              style={styles.routeCard}
              onPress={() => handleRoutePress(route)}
            >
              <View style={styles.routeHeader}>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName}>{route.name || 'Route'}</Text>
                  <Text style={styles.routeDescription}>
                    {route.start_point || 'Start'} → {route.end_point || 'End'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(route.id)}
                >
                  <Text style={styles.favoriteIcon}>
                    {isFavorite ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.routeDetails}>
                {route.stops && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>
                      {route.stops.length} stop{route.stops.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
                {route.distance && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>📏</Text>
                    <Text style={styles.detailText}>
                      {route.distance} km
                    </Text>
                  </View>
                )}
                {route.estimated_duration && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>⏱️</Text>
                    <Text style={styles.detailText}>
                      {route.estimated_duration} min
                    </Text>
                  </View>
                )}
                {distance && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>
                      {distance < 1000 ? `${Math.round(distance)}m away` : `${(distance / 1000).toFixed(1)}km away`}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleRoutePress(route)}
              >
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
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
  filterButton: {
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
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.WHITE,
  },
  routeCard: {
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
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: FONTS.SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs,
  },
  routeDescription: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  routeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  detailText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  viewButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.md,
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

export default RouteSelectionScreen;

