import React, { useEffect, useState } from 'react';

const OfflineIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Web: Use navigator.onLine
    const handleOnline = () => {
      setIsConnected(true);
      setIsVisible(false);
    };
    const handleOffline = () => {
      setIsConnected(false);
      setIsVisible(true);
    };
      
      setIsConnected(navigator.onLine);
    setIsVisible(!navigator.onLine);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
  }, []);

  if (!isVisible || isConnected) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 bg-yellow-600 text-white p-4 text-center z-50 shadow-lg transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div className="text-2xl mb-2">📡</div>
      <div className="font-bold mb-1">No Internet Connection</div>
      <div className="text-sm opacity-90">Some features may be limited</div>
    </div>
  );
};

export default OfflineIndicator;

