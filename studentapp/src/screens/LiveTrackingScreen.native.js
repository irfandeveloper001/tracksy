import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// Conditionally import maps only on native platforms
let MapView, Marker, Polyline, PROVIDER_GOOGLE;
const isWeb = Platform.OS === 'web';

if (!isWeb) {
  try {
    const MapsModule = require('react-native-maps');
    MapView = MapsModule.default;
    Marker = MapsModule.Marker;
    Polyline = MapsModule.Polyline;
    PROVIDER_GOOGLE = MapsModule.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn('react-native-maps not available:', e);
  }
}

import {
  fetchBuses,
  fetchRoutes,
  connectWebSocket,
  disconnectWebSocket,
  updateBusLocation,
  setUserLocation,
  setMapRegion,
  setSelectedBus,
  clearError,
} from '../store/slices/trackingSlice';
import { getCurrentLocation, watchLocation, clearLocationWatch } from '../utils/location';
import trackingService from '../services/trackingService';
import BusMarker from '../components/BusMarker';
import BusInfoCard from '../components/BusInfoCard';
import { COLORS, SPACING, FONTS } from '../constants';

const LiveTrackingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const {
    buses,
    activeBuses,
    busLocations,
    routes,
    selectedBus,
    userLocation,
    mapRegion,
    isLoading,
    isWebSocketConnected,
    error,
  } = useSelector((state) => state.tracking);

  const mapRef = useRef(null);
  const locationWatchId = useRef(null);
  const [showBusInfo, setShowBusInfo] = useState(false);
  const [selectedBusData, setSelectedBusData] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  // Request location permissions
  useEffect(() => {
    requestLocationPermission();
    return () => {
      if (locationWatchId.current) {
        clearLocationWatch(locationWatchId.current);
      }
    };
  }, []);

  // Fetch buses and routes on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Connect WebSocket when buses are loaded
  useEffect(() => {
    if (activeBuses.length > 0 && !isWebSocketConnected) {
      connectToWebSocket();
    }

    return () => {
      if (isWebSocketConnected) {
        dispatch(disconnectWebSocket());
      }
    };
  }, [activeBuses, isWebSocketConnected]);

  // Set up bus location listeners
  useEffect(() => {
    if (!isWebSocketConnected) return;

    const unsubscribeCallbacks = [];

    activeBuses.forEach((bus) => {
      const unsubscribe = trackingService.onBusLocationUpdate(bus.id, (update) => {
        dispatch(updateBusLocation({
          busId: update.busId,
          location: update.location,
        }));
      });
      unsubscribeCallbacks.push(unsubscribe);
    });

    return () => {
      unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
    };
  }, [activeBuses, isWebSocketConnected]);

  // Update map region when user location changes
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [userLocation]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'TRACKSY needs access to your location to track buses',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          startLocationTracking();
        } else {
          Alert.alert('Permission Denied', 'Location permission is required for bus tracking');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      startLocationTracking();
    }
  };

  const startLocationTracking = async () => {
    try {
      // Get initial location
      const location = await getCurrentLocation();
      dispatch(setUserLocation(location));
      dispatch(setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }));

      // Watch location updates
      locationWatchId.current = watchLocation((location) => {
        dispatch(setUserLocation(location));
      });
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', 'Unable to get your location. Please enable location services.');
    }
  };

  const loadInitialData = async () => {
    try {
      await Promise.all([
        dispatch(fetchBuses()),
        dispatch(fetchRoutes()),
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const connectToWebSocket = async () => {
    try {
      await dispatch(connectWebSocket()).unwrap();
      
      // Subscribe to all active buses
      activeBuses.forEach((bus) => {
        trackingService.subscribeToBus(bus.id);
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      Alert.alert('Connection Error', 'Unable to connect to real-time tracking. Please check your connection.');
    }
  };

  const handleBusMarkerPress = (bus) => {
    const location = busLocations[bus.id] || {};
    const busWithLocation = {
      ...bus,
      location: location,
    };
    setSelectedBusData(busWithLocation);
    setShowBusInfo(true);
    dispatch(setSelectedBus(busWithLocation));

    // Center map on bus
    if (location.latitude && location.longitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  const handleCenterOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  };

  const getRoutePolyline = (route) => {
    if (!route || !route.stops || route.stops.length === 0) return null;
    return route.stops.map((stop) => ({
      latitude: stop.latitude,
      longitude: stop.longitude,
    }));
  };

  // Web fallback - show list view instead of map
  if (isWeb || !MapView) {
    return (
      <View style={styles.container}>
        <View style={styles.webContainer}>
          <Text style={styles.webTitle}>🗺️ Live Bus Tracking</Text>
          <Text style={styles.webMessage}>
            Real-time map tracking is available on mobile devices.
          </Text>
          <Text style={styles.webSubtitle}>
            For the best experience, please use the Android or iOS app.
          </Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Loading buses...</Text>
            </View>
          ) : (
            <ScrollView style={styles.busList}>
              {activeBuses.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No active buses</Text>
                </View>
              ) : (
                activeBuses.map((bus) => {
                  const location = busLocations[bus.id];
                  const route = routes.find((r) => r.id === bus.current_route_id) || bus.currentRoute;
                  
                  return (
                    <TouchableOpacity
                      key={bus.id}
                      style={styles.busCard}
                      onPress={() => handleBusMarkerPress(bus)}
                    >
                      <View style={styles.busCardHeader}>
                        <Text style={styles.busIcon}>🚌</Text>
                        <View style={styles.busCardInfo}>
                          <Text style={styles.busNumber}>{bus.bus_number || `Bus ${bus.id}`}</Text>
                          {route && <Text style={styles.routeName}>{route.name}</Text>}
                        </View>
                      </View>
                      {location && (
                        <Text style={styles.locationText}>
                          📍 {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}

          {/* Connection Status */}
          <View style={styles.statusBar}>
            <View style={[styles.statusIndicator, isWebSocketConnected && styles.statusConnected]}>
              <Text style={styles.statusText}>
                {isWebSocketConnected ? '●' : '○'} {isWebSocketConnected ? 'Live' : 'Offline'}
              </Text>
            </View>
            <Text style={styles.statusInfo}>
              {activeBuses.length} bus{activeBuses.length !== 1 ? 'es' : ''} active
            </Text>
          </View>

          {/* Bus Info Card */}
          {showBusInfo && selectedBusData && (
            <BusInfoCard
              bus={selectedBusData}
              onClose={() => {
                setShowBusInfo(false);
                setSelectedBusData(null);
                dispatch(setSelectedBus(null));
              }}
              onDetailsPress={() => {
                navigation.navigate('BusDetails', { busId: selectedBusData.id });
              }}
            />
          )}
        </View>
      </View>
    );
  }

  // Native platforms - show map
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          userLocation
            ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
        }
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        toolbarEnabled={false}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor={COLORS.PRIMARY}
          />
        )}

        {/* Bus Markers */}
        {activeBuses.map((bus) => {
          const location = busLocations[bus.id];
          if (!location || !location.latitude || !location.longitude) return null;

          const route = routes.find((r) => r.id === bus.current_route_id) || bus.currentRoute;

          return (
            <React.Fragment key={bus.id}>
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                onPress={() => handleBusMarkerPress(bus)}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <BusMarker
                  busNumber={bus.bus_number || bus.id}
                  routeName={route?.name}
                  isSelected={selectedBus?.id === bus.id}
                />
              </Marker>

              {/* Route Polyline */}
              {route && getRoutePolyline(route) && (
                <Polyline
                  coordinates={getRoutePolyline(route)}
                  strokeColor={COLORS.PRIMARY}
                  strokeWidth={3}
                  lineDashPattern={[5, 5]}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Route Stops */}
        {selectedBus?.currentRoute?.stops?.map((stop, index) => (
          <Marker
            key={stop.id || index}
            coordinate={{
              latitude: stop.latitude,
              longitude: stop.longitude,
            }}
            title={stop.name}
            pinColor={COLORS.SECONDARY}
          />
        ))}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleRefresh}>
          <Text style={styles.controlIcon}>🔄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleCenterOnUser}>
          <Text style={styles.controlIcon}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* Connection Status */}
      <View style={styles.statusBar}>
        <View style={[styles.statusIndicator, isWebSocketConnected && styles.statusConnected]}>
          <Text style={styles.statusText}>
            {isWebSocketConnected ? '●' : '○'} {isWebSocketConnected ? 'Live' : 'Offline'}
          </Text>
        </View>
        <Text style={styles.statusInfo}>
          {activeBuses.length} bus{activeBuses.length !== 1 ? 'es' : ''} active
        </Text>
      </View>

      {/* Bus Info Card */}
      {showBusInfo && selectedBusData && (
        <BusInfoCard
          bus={selectedBusData}
          onClose={() => {
            setShowBusInfo(false);
            setSelectedBusData(null);
            dispatch(setSelectedBus(null));
          }}
          onDetailsPress={() => {
            navigation.navigate('BusDetails', { busId: selectedBusData.id });
          }}
        />
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading buses...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
    gap: SPACING.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  controlIcon: {
    fontSize: 20,
  },
  statusBar: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: SPACING.sm,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusConnected: {
    // Already styled
  },
  statusText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.xs,
  },
  statusInfo: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.SIZES.md,
    color: COLORS.WHITE,
  },
  webContainer: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.BACKGROUND,
  },
  webTitle: {
    fontSize: FONTS.SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  webMessage: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  webSubtitle: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  busList: {
    flex: 1,
  },
  busCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  busCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  busCardInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  busNumber: {
    fontSize: FONTS.SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  routeName: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.xs / 2,
  },
  locationText: {
    fontSize: FONTS.SIZES.xs,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default LiveTrackingScreen;

