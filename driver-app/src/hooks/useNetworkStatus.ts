import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Hook to monitor network status and trigger sync
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Web: Use navigator.onLine
    if (Platform.OS === 'web') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      setIsOnline(navigator.onLine);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // Native: Use NetInfo
      const unsubscribe = NetInfo.addEventListener((state) => {
        const online = state.isConnected ?? false;
        setIsOnline(online);

        if (online && !isSyncing) {
          // Trigger sync when connection is restored (optional)
          // handleSync();
        }
      });

      return () => unsubscribe();
    }
  }, [isSyncing]);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    // Sync logic can be added here if needed
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return {
    isOnline,
    isSyncing,
    syncNow: handleSync,
  };
};

