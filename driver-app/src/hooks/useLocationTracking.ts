import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import locationService from '../services/location/locationService';
import backgroundLocationService from '../services/background/backgroundLocationService';
import locationUpdateService from '../services/location/locationUpdateService';
import {
  setCurrentLocation,
  setTracking,
  setBackgroundTracking,
  sendLocationUpdate,
  syncCachedLocations,
} from '../store/slices/locationSlice';
import { LOCATION_CONFIG } from '../constants';

export const useLocationTracking = (enableBackground: boolean = false) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isTracking, isBackgroundTracking } = useSelector(
    (state: RootState) => state.location
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const watchIdRef = useRef<number | null>(null);

  // Initialize location update service
  useEffect(() => {
    if (isAuthenticated) {
      locationUpdateService.initialize();
    }

    return () => {
      locationUpdateService.stop();
    };
  }, [isAuthenticated]);

  // Handle location update
  const handleLocationUpdate = useCallback(
    async (location: any) => {
      // Update Redux state
      dispatch(setCurrentLocation(location));

      // Send to backend
      if (isAuthenticated) {
        await dispatch(sendLocationUpdate(location));
      }
    },
    [dispatch, isAuthenticated]
  );

  // Start location tracking
  const startTracking = useCallback(async () => {
    try {
      // Request permissions
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        console.error('Location permission denied');
        return false;
      }

      if (enableBackground) {
        // Start background tracking
        const started = await backgroundLocationService.initialize(
          handleLocationUpdate
        );
        if (started) {
          dispatch(setBackgroundTracking(true));
          dispatch(setTracking(true));
          return true;
        }
      } else {
        // Start foreground tracking
        const watchId = locationService.watchLocation(
          handleLocationUpdate,
          (error) => {
            console.error('Location tracking error:', error);
          }
        );
        watchIdRef.current = watchId;
        dispatch(setTracking(true));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }, [enableBackground, handleLocationUpdate, dispatch]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (enableBackground && isBackgroundTracking) {
      backgroundLocationService.stop();
      dispatch(setBackgroundTracking(false));
    } else if (watchIdRef.current !== null) {
      locationService.stopWatching();
      watchIdRef.current = null;
    }
    dispatch(setTracking(false));
  }, [enableBackground, isBackgroundTracking, dispatch]);

  // Sync cached locations
  const syncCached = useCallback(async () => {
    await dispatch(syncCachedLocations());
  }, [dispatch]);

  return {
    startTracking,
    stopTracking,
    syncCached,
    isTracking: isTracking || isBackgroundTracking,
  };
};

