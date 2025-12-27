import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Cog6ToothIcon,
  BellIcon,
  MapIcon,
  ShieldCheckIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline';
import settingsService, {
  type SystemSettings,
  type NotificationSettings,
  type MapSettings as MapSettingsType,
  type SecuritySettings,
  type IntegrationSettings,
} from '../../lib/api/settingsService';
import SystemSettings from '../../components/settings/SystemSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import MapSettings from '../../components/settings/MapSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';
import IntegrationSettings from '../../components/settings/IntegrationSettings';
import { useLanguage } from '../../lib/i18n/LanguageProvider';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'system' | 'notifications' | 'map' | 'security' | 'integrations'>('system');
  const { t } = useLanguage();

  const systemFallback: SystemSettings = {
    app_name: 'Tracksy Admin',
    timezone: 'UTC',
    date_format: 'YYYY-MM-DD',
    time_format: 'HH:mm',
    language: 'en',
    require_fee_clearance: true,
  };

  const notificationFallback: NotificationSettings = {
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
  };

  const mapFallback: MapSettingsType = {
    map_provider: 'openstreetmap',
    default_zoom: 6,
    default_center: { lat: 30.3753, lng: 69.3451 },
  };

  const securityFallback: SecuritySettings = {
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_symbols: false,
    session_timeout: 30,
    two_factor_enabled: false,
  };

  const integrationFallback: IntegrationSettings = {};

  // Fetch all settings
  const { data: systemSettings = systemFallback, isLoading: systemLoading, isError: systemError } = useQuery({
    queryKey: ['system-settings'],
    queryFn: settingsService.getSystemSettings,
    placeholderData: systemFallback,
  });

  const { data: notificationSettings = notificationFallback, isLoading: notificationLoading, isError: notificationError } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: settingsService.getNotificationSettings,
    placeholderData: notificationFallback,
  });

  const { data: mapSettings = mapFallback, isLoading: mapLoading, isError: mapError } = useQuery({
    queryKey: ['map-settings'],
    queryFn: settingsService.getMapSettings,
    placeholderData: mapFallback,
  });

  const { data: securitySettings = securityFallback, isLoading: securityLoading, isError: securityError } = useQuery({
    queryKey: ['security-settings'],
    queryFn: settingsService.getSecuritySettings,
    placeholderData: securityFallback,
  });

  const { data: integrationSettings = integrationFallback, isLoading: integrationLoading, isError: integrationError } = useQuery({
    queryKey: ['integration-settings'],
    queryFn: settingsService.getIntegrationSettings,
    placeholderData: integrationFallback,
  });

  const tabs = [
    { id: 'system', name: t('tabSystem'), icon: Cog6ToothIcon, description: t('tabSystemDesc') },
    { id: 'notifications', name: t('tabNotifications'), icon: BellIcon, description: t('tabNotificationsDesc') },
    { id: 'map', name: t('tabMap'), icon: MapIcon, description: t('tabMapDesc') },
    { id: 'security', name: t('tabSecurity'), icon: ShieldCheckIcon, description: t('tabSecurityDesc') },
    { id: 'integrations', name: t('tabIntegrations'), icon: PuzzlePieceIcon, description: t('tabIntegrationsDesc') },
  ];

  const isLoading =
    systemLoading ||
    notificationLoading ||
    mapLoading ||
    securityLoading ||
    integrationLoading;

  const hasError =
    systemError ||
    notificationError ||
    mapError ||
    securityError ||
    integrationError;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Administration
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">{t('settingsTitle')}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {t('settingsSubtitle')}
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            {t('settingsSecureChip')}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm">
          <nav className="space-y-1" aria-label="Settings navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                        {tab.name}
                      </p>
                      <p className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
          {hasError && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Some settings could not be loaded from the server. Showing safe defaults so you can continue.
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
              <span className="ml-3 text-slate-600">Loading settings...</span>
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
