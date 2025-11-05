import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { getRoute, getRouteStops } from '../../store/slices/routeSlice';
import { getCurrentLocation } from '../../store/slices/locationSlice';
import locationService from '../../services/location/locationService';
import MapControls from '../../components/MapControls';
import RouteInfoCard from '../../components/RouteInfoCard';
import { COLORS } from '../../constants';

// Conditionally import maps only on native platforms
let MapView: any, Marker: any, Polyline: any, PROVIDER_GOOGLE: any;
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

const RouteMapScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { route, routeStops, isLoading } = useSelector(
    (state: RootState) => state.route
  );
  const { currentLocation } = useSelector((state: RootState) => state.location);
  const { currentTrip } = useSelector((state: RootState) => state.trip);
  const { user } = useSelector((state: RootState) => state.auth);

  const mapRef = useRef<any>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain'>(
    'standard'
  );
  const [trafficEnabled, setTrafficEnabled] = useState(false);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [nextStop, setNextStop] = useState<any>(null);
  const [distanceToNextStop, setDistanceToNextStop] = useState(0);
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState(0);

  useEffect(() => {
    loadRouteData();
  }, [dispatch]);

  useEffect(() => {
    if (route && routeStops.length > 0) {
      calculateNextStop();
    }
  }, [route, routeStops, currentLocation]);

  useEffect(() => {
    if (currentLocation) {
      updateMapRegion();
      calculateDistanceAndETA();
    }
  }, [currentLocation, nextStop]);

  const loadRouteData = async () => {
    await Promise.all([
      dispatch(getRoute()),
      dispatch(getRouteStops()),
    ]);
  };

  const calculateNextStop = () => {
    if (!currentLocation || routeStops.length === 0) return;

    // Find the next stop based on current location
    let minDistance = Infinity;
    let nextStopIndex = -1;

    routeStops.forEach((stop: any, index: number) => {
      if (stop.latitude && stop.longitude) {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          stop.latitude,
          stop.longitude
        );
        if (distance < minDistance && index >= 0) {
          minDistance = distance;
          nextStopIndex = index;
        }
      }
    });

    if (nextStopIndex !== -1 && nextStopIndex < routeStops.length) {
      setNextStop(routeStops[nextStopIndex]);
    }
  };

  const calculateDistanceAndETA = () => {
    if (!currentLocation || !nextStop) {
      setDistanceToNextStop(0);
      setEstimatedArrivalTime(0);
      return;
    }

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      nextStop.latitude,
      nextStop.longitude
    );

    setDistanceToNextStop(distance);

    // Estimate arrival time based on current speed (assume 30 km/h average if no speed data)
    const speed = (currentLocation.speed || 8.33) * 3.6; // Convert m/s to km/h
    const time = distance / (speed / 3.6); // Convert km/h to m/s for calculation
    setEstimatedArrivalTime(time);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const updateMapRegion = () => {
    if (!currentLocation) return;

    const region = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setMapRegion(region);
  };

  const handleCenterLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const handleShowFullRoute = () => {
    if (routeStops.length === 0 || !mapRef.current) return;

    // Calculate bounds to show all stops
    const lats = routeStops.map((stop: any) => stop.latitude).filter(Boolean);
    const lons = routeStops.map((stop: any) => stop.longitude).filter(Boolean);

    if (lats.length === 0 || lons.length === 0) return;

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latDelta = maxLat - minLat + 0.01;
    const lonDelta = maxLon - minLon + 0.01;

    mapRef.current.animateToRegion(
      {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLon + maxLon) / 2,
        latitudeDelta: latDelta,
        longitudeDelta: lonDelta,
      },
      1000
    );
  };

  const handleToggleTraffic = () => {
    setTrafficEnabled(!trafficEnabled);
    Alert.alert(
      'Traffic Layer',
      trafficEnabled
        ? 'Traffic layer will be disabled'
        : 'Traffic layer will be enabled (if supported by map provider)'
    );
  };

  const getMapType = () => {
    switch (mapType) {
      case 'satellite':
        return 'satellite';
      case 'terrain':
        return 'terrain';
      default:
        return 'standard';
    }
  };

  // Web fallback
  if (isWeb || !MapView) {
    return (
      <View style={styles.container}>
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackText}>Map View</Text>
          <Text style={styles.webFallbackSubtext}>
            Map integration requires react-native-maps
          </Text>
          {route && (
            <View style={styles.routeInfo}>
              <Text style={styles.routeInfoTitle}>Route: {route.name}</Text>
              <Text style={styles.routeInfoText}>
                Stops: {routeStops.length}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Prepare route coordinates for polyline
  const routeCoordinates = routeStops
    .filter((stop: any) => stop.latitude && stop.longitude)
    .map((stop: any) => ({
      latitude: stop.latitude,
      longitude: stop.longitude,
    }));

  const initialRegion = mapRegion || {
    latitude: currentLocation?.latitude || 37.78825,
    longitude: currentLocation?.longitude || -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        mapType={getMapType()}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        toolbarEnabled={false}
        trafficEnabled={trafficEnabled}
      >
        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
            pinColor={COLORS.PRIMARY}
          />
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={COLORS.PRIMARY}
            strokeWidth={4}
          />
        )}

        {/* Stop Markers */}
        {routeStops.map((stop: any, index: number) => {
          if (!stop.latitude || !stop.longitude) return null;

          const isNextStop = nextStop?.id === stop.id;
          const isPassed = routeStops.indexOf(nextStop) > index;

          return (
            <Marker
              key={stop.id || index}
              coordinate={{
                latitude: stop.latitude,
                longitude: stop.longitude,
              }}
              title={stop.name || `Stop ${index + 1}`}
              pinColor={
                isNextStop
                  ? COLORS.SUCCESS
                  : isPassed
                  ? COLORS.TEXT
                  : COLORS.WARNING
              }
            />
          );
        })}
      </MapView>

      {/* Map Controls */}
      <MapControls
        onCenterLocation={handleCenterLocation}
        onShowFullRoute={handleShowFullRoute}
        onToggleTraffic={handleToggleTraffic}
        trafficEnabled={trafficEnabled}
        mapType={mapType}
        onMapTypeChange={setMapType}
      />

      {/* Route Info Card */}
      {nextStop && currentLocation && (
        <RouteInfoCard
          distanceToNextStop={distanceToNextStop}
          estimatedArrivalTime={estimatedArrivalTime}
          currentSpeed={(currentLocation.speed || 0) * 3.6} // Convert m/s to km/h
          nextStopName={nextStop.name || 'Next Stop'}
        />
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#F5F5F5',
  },
  webFallbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  webFallbackSubtext: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 20,
  },
  routeInfo: {
    backgroundColor: COLORS.BACKGROUND,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  routeInfoText: {
    fontSize: 14,
    color: COLORS.TEXT,
  },
});

export default RouteMapScreen;

