import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Cog6ToothIcon,
  BellIcon,
  MapIcon,
  ShieldCheckIcon,
  PuzzlePieceIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import settingsService from '../../lib/api/settingsService';
import SystemSettings from '../../components/settings/SystemSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import MapSettings from '../../components/settings/MapSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';
import IntegrationSettings from '../../components/settings/IntegrationSettings';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'system' | 'notifications' | 'map' | 'security' | 'integrations'>('system');

  // Fetch all settings
  const { data: systemSettings, isLoading: systemLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: settingsService.getSystemSettings,
  });

  const { data: notificationSettings, isLoading: notificationLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: settingsService.getNotificationSettings,
  });

  const { data: mapSettings, isLoading: mapLoading } = useQuery({
    queryKey: ['map-settings'],
    queryFn: settingsService.getMapSettings,
  });

  const { data: securitySettings, isLoading: securityLoading } = useQuery({
    queryKey: ['security-settings'],
    queryFn: settingsService.getSecuritySettings,
  });

  const { data: integrationSettings, isLoading: integrationLoading } = useQuery({
    queryKey: ['integration-settings'],
    queryFn: settingsService.getIntegrationSettings,
  });

  const tabs = [
    { id: 'system', name: 'System', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'map', name: 'Map', icon: MapIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'integrations', name: 'Integrations', icon: PuzzlePieceIcon },
  ];

  const isLoading =
    systemLoading ||
    notificationLoading ||
    mapLoading ||
    securityLoading ||
    integrationLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure system settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center px-6 py-4 text-sm font-medium border-b-2
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading settings...</span>
            </div>
          ) : (
            <>
              {activeTab === 'system' && systemSettings && (
                <SystemSettings settings={systemSettings} />
              )}
              {activeTab === 'notifications' && notificationSettings && (
                <NotificationSettings settings={notificationSettings} />
              )}
              {activeTab === 'map' && mapSettings && (
                <MapSettings settings={mapSettings} />
              )}
              {activeTab === 'security' && securitySettings && (
                <SecuritySettings settings={securitySettings} />
              )}
              {activeTab === 'integrations' && integrationSettings && (
                <IntegrationSettings settings={integrationSettings} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
