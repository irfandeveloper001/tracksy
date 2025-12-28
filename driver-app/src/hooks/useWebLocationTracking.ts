import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import type { LocationData } from '../services/location/locationService';
import locationUpdateService from '../services/location/locationUpdateService';
import { LOCATION_CONFIG } from '../constants';
import { setCurrentLocation, setTracking } from '../store/slices/locationSlice';

const GPS_TRACKING_STORAGE_KEY = '@tracksy_driver:gps_tracking_enabled';

const readTrackingPreference = () => {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(GPS_TRACKING_STORAGE_KEY) !== 'false';
};

export const useWebLocationTracking = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isTracking: trackingState } = useSelector(
    (state: RootState) => state.location
  );
  const [isSupported, setIsSupported] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentAtRef = useRef<number>(0);

  const hasAssignedBus = Boolean(user?.assigned_bus?.id || user?.assigned_bus);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsSupported(Boolean(navigator?.geolocation));
    setIsEnabled(readTrackingPreference());
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    locationUpdateService.stop();
    dispatch(setTracking(false));
  }, [dispatch]);

  const handlePosition = useCallback(
    async (position: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastSentAtRef.current < LOCATION_CONFIG.MIN_UPDATE_INTERVAL) {
        return;
      }

      const accuracy = position.coords.accuracy ?? 0;
      if (
        accuracy !== 0 &&
        accuracy > LOCATION_CONFIG.ACCURACY_THRESHOLD
      ) {
        return;
      }

      const location: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy,
        speed: position.coords.speed ?? undefined,
        heading: position.coords.heading ?? undefined,
        timestamp: position.timestamp || now,
      };

      lastSentAtRef.current = now;
      setLastUpdateTime(now);
      dispatch(setCurrentLocation(location));

      try {
        await locationUpdateService.sendLocationUpdate(location);
      } catch (sendError: any) {
        setError(sendError?.message || 'Unable to send location update');
      }
    },
    [dispatch]
  );

  const startTracking = useCallback(async () => {
    if (!isSupported || !hasAssignedBus || !isAuthenticated) {
      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    try {
      setError(null);
      await locationUpdateService.initialize();

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          handlePosition(position);
        },
        (geoError) => {
          const message =
            geoError.code === 1
              ? 'Location permission denied. Enable GPS access to share live location.'
              : geoError.code === 2
              ? 'Location unavailable. Please check device GPS.'
              : 'Location request timed out. Please try again.';
          setError(message);
          dispatch(setTracking(false));
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        }
      );

      dispatch(setTracking(true));
    } catch (trackingError: any) {
      setError(trackingError?.message || 'Failed to start GPS tracking');
      dispatch(setTracking(false));
    }
  }, [dispatch, handlePosition, hasAssignedBus, isAuthenticated, isSupported]);

  const toggleTracking = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(GPS_TRACKING_STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isEnabled || !isAuthenticated || !hasAssignedBus || !isSupported) {
      stopTracking();
      return;
    }

    startTracking();

    return () => {
      stopTracking();
    };
  }, [isEnabled, isAuthenticated, hasAssignedBus, isSupported, startTracking, stopTracking]);

  return {
    isSupported,
    isEnabled,
    isTracking: trackingState && isEnabled,
    lastUpdateTime,
    error,
    toggleTracking,
  };
};
