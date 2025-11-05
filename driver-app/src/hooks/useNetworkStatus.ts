import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import syncService from '../services/syncService';
import logger from '../services/logger';

// Hook to monitor network status and trigger sync
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);

      if (online) {
        // Trigger sync when connection is restored
        handleSync();
      } else {
        logger.warn('Network connection lost');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const shouldSync = await syncService.shouldSync();
      if (shouldSync) {
        logger.info('Network restored - syncing offline data');
        await syncService.syncAll();
      }
    } catch (error) {
      logger.error('Error syncing after network restore', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    syncNow: handleSync,
  };
};

