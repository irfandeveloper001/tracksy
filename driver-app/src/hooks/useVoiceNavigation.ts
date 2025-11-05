import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import voiceService from '../services/voiceService';
import { LocationData } from '../services/location/locationService';

// Hook for voice navigation prompts
export const useVoiceNavigation = () => {
  const { currentLocation } = useSelector((state: RootState) => state.location);
  const { routeStops } = useSelector((state: RootState) => state.route);
  const { currentTrip } = useSelector((state: RootState) => state.trip);
  
  const lastAnnouncementRef = useRef<string>('');
  const announcementCooldownRef = useRef<number>(0);

  useEffect(() => {
    if (!currentLocation || !routeStops.length || !currentTrip) return;

    const now = Date.now();
    // Cooldown of 30 seconds between announcements
    if (now - announcementCooldownRef.current < 30000) return;

    // Find next stop
    let minDistance = Infinity;
    let nextStop: any = null;

    routeStops.forEach((stop: any) => {
      if (stop.latitude && stop.longitude) {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          stop.latitude,
          stop.longitude
        );
        if (distance < minDistance && distance < 500) {
          // Only announce if within 500m
          minDistance = distance;
          nextStop = stop;
        }
      }
    });

    if (nextStop && nextStop.name !== lastAnnouncementRef.current) {
      voiceService.announceNextStop(nextStop.name, minDistance);
      lastAnnouncementRef.current = nextStop.name;
      announcementCooldownRef.current = now;
    }
  }, [currentLocation, routeStops, currentTrip]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
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

  return {
    isVoiceEnabled: voiceService.isVoiceEnabled(),
    toggleVoice: () => voiceService.setEnabled(!voiceService.isVoiceEnabled()),
  };
};

