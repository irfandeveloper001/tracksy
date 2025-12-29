import { useEffect, useState } from 'react';

// Hook to monitor network status and trigger sync
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Web: Use navigator.onLine
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      setIsOnline(navigator.onLine);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
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

