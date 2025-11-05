import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import LocationStatusIndicator from '../../components/LocationStatusIndicator';
import { COLORS } from '../../constants';

// Note: Full map integration requires react-native-maps
// This is a basic navigation screen that can be enhanced with map components

const TripNavigationScreen = ({ navigation, route }: any) => {
  const { tripId } = route.params || {};
  const { currentTrip } = useSelector((state: RootState) => state.trip);
  const { currentLocation } = useSelector((state: RootState) => state.location);
  const [nextStop, setNextStop] = useState<any>(null);

  useEffect(() => {
    // Get next stop from route
    if (currentTrip?.route?.stops) {
      const stops = currentTrip.route.stops;
      const nextStopIndex = stops.findIndex(
        (stop: any) => !stop.arrived
      );
      if (nextStopIndex !== -1) {
        setNextStop(stops[nextStopIndex]);
      }
    }
  }, [currentTrip]);

  const handleMarkStopArrival = () => {
    if (nextStop) {
      // TODO: Implement mark stop arrival
      navigation.navigate('MarkStopArrival', { stopId: nextStop.id });
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Haversine formula
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const getDistanceToNextStop = () => {
    if (!currentLocation || !nextStop) return null;
    return calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      nextStop.latitude,
      nextStop.longitude
    );
  };

  const distance = getDistanceToNextStop();

  return (
    <View style={styles.container}>
      <LocationStatusIndicator />

      {/* Navigation Info */}
      <View style={styles.navigationCard}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        
        {nextStop ? (
          <>
            <Text style={styles.nextStopName}>{nextStop.name}</Text>
            <Text style={styles.nextStopAddress}>{nextStop.address}</Text>
            
            {distance !== null && (
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceValue}>
                  {distance < 1000
                    ? `${Math.round(distance)}m`
                    : `${(distance / 1000).toFixed(2)}km`}
                </Text>
                <Text style={styles.distanceLabel}>to next stop</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.markArrivalButton}
              onPress={handleMarkStopArrival}
            >
              <Text style={styles.markArrivalButtonText}>
                Mark Stop Arrival
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => navigation.navigate('TripMap')}
            >
              <Text style={styles.mapButtonText}>🗺️ View Map</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noStopText}>No more stops</Text>
        )}
      </View>

      {/* Route Information */}
      {currentTrip?.route && (
        <View style={styles.routeCard}>
          <Text style={styles.sectionTitle}>Route Information</Text>
          <Text style={styles.routeName}>{currentTrip.route.name}</Text>
          <Text style={styles.routeDetail}>
            {currentTrip.route.origin} → {currentTrip.route.destination}
          </Text>
        </View>
      )}

      {/* Current Location */}
      {currentLocation && (
        <View style={styles.locationCard}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <Text style={styles.locationText}>
            {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationAccuracy}>
            Accuracy: {Math.round(currentLocation.accuracy)}m
          </Text>
          {currentLocation.speed && (
            <Text style={styles.speedText}>
              Speed: {Math.round(currentLocation.speed * 3.6)} km/h
            </Text>
          )}
        </View>
      )}

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>
          📍 Map View
        </Text>
        <Text style={styles.mapPlaceholderSubtext}>
          Install react-native-maps for full map integration
        </Text>
        <Text style={styles.mapPlaceholderSubtext}>
          This would show:
        </Text>
        <Text style={styles.mapPlaceholderSubtext}>
          • Route polyline
        </Text>
        <Text style={styles.mapPlaceholderSubtext}>
          • Current location marker
        </Text>
        <Text style={styles.mapPlaceholderSubtext}>
          • Stop markers
        </Text>
        <Text style={styles.mapPlaceholderSubtext}>
          • Turn-by-turn directions
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  navigationCard: {
    backgroundColor: COLORS.BACKGROUND,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  nextStopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  nextStopAddress: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 16,
  },
  distanceContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  distanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  distanceLabel: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginTop: 4,
  },
  markArrivalButton: {
    backgroundColor: COLORS.SUCCESS,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  markArrivalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapButton: {
    backgroundColor: COLORS.PRIMARY,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noStopText: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.5,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  routeCard: {
    backgroundColor: COLORS.BACKGROUND,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  routeDetail: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  locationCard: {
    backgroundColor: COLORS.BACKGROUND,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  speedText: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 24,
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default TripNavigationScreen;

