import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      if (wasOffline) {
        toast.success('Connection restored');
        setWasOffline(false);
        // Refresh data
        window.location.reload();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setWasOffline(true);
      toast.error('You are offline. Some features may not work.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOffline, wasOffline };
}

