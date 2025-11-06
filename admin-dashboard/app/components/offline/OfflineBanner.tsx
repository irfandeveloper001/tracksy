import { WifiIcon } from '@heroicons/react/24/outline';
import { useOffline } from '../../lib/hooks/useOffline';

export default function OfflineBanner() {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center">
        <WifiIcon className="h-5 w-5 text-yellow-600 mr-2" />
        <p className="text-sm text-yellow-800">
          You are currently offline. Some features may not work until you reconnect.
        </p>
      </div>
    </div>
  );
}

