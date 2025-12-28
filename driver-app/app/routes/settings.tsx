import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../src/store/store";
import { getCurrentUser } from "../../src/store/slices/authSlice";
import Header from "../../src/components/layouts/Header";
import Sidebar from "../../src/components/layouts/Sidebar";
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  LanguageIcon,
  SpeakerWaveIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useLanguage } from "../../src/lib/i18n/LanguageProvider";
import { SUPPORTED_LANGUAGE_CODES } from "../../src/lib/i18n/languages";
import LanguageSelect from "../../src/components/ui/LanguageSelect";

export default function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [settings, setSettings] = useState({
    notifications: true,
    soundEnabled: true,
    darkMode: false,
    language: 'en',
    autoRefresh: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [dispatch]);

  useEffect(() => {
    setSettings((prev) => ({ ...prev, language: language.code }));
  }, [language.code]);

  const loadSettings = async () => {
    try {
      await dispatch(getCurrentUser());
      // Load settings from localStorage
      const savedSettings = localStorage.getItem('driver_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsed, language: parsed.language || language.code });
        if (parsed.language) {
          setLanguage(parsed.language);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error loading settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in real app, this would be saved to backend)
      localStorage.setItem('driver_settings', JSON.stringify(settings));
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageChange = (language: string) => {
    setSettings(prev => ({ ...prev, language }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 w-full min-w-0">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t('settingsTitle')}
                </h1>
                <p className="mt-2 text-gray-600">
                  {t('settingsSubtitle')}
                </p>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BellIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <BellIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Enable Notifications</p>
                        <p className="text-sm text-gray-500">Receive push notifications for important updates</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle('notifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <SpeakerWaveIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Sound Alerts</p>
                        <p className="text-sm text-gray-500">Play sound when receiving notifications</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle('soundEnabled')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.soundEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Appearance Settings */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Cog6ToothIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Appearance</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-4">
                      {settings.darkMode ? (
                        <MoonIcon className="h-5 w-5 text-gray-600" />
                      ) : (
                        <SunIcon className="h-5 w-5 text-gray-600" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">Dark Mode</p>
                        <p className="text-sm text-gray-500">Switch to dark theme</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle('darkMode')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.darkMode ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-4 mb-4">
                      <LanguageIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">{t('language')}</p>
                        <p className="text-sm text-gray-500">{t('languageHint')}</p>
                      </div>
                    </div>
                    <LanguageSelect
                      value={language.code}
                      onChange={(code) => {
                        handleLanguageChange(code);
                        setLanguage(code);
                      }}
                      allowedCodes={[...SUPPORTED_LANGUAGE_CODES]}
                    />
                  </div>
                </div>
              </div>

              {/* General Settings */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Cog6ToothIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">General</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Auto Refresh</p>
                        <p className="text-sm text-gray-500">Automatically refresh data every 30 seconds</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle('autoRefresh')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.autoRefresh ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <ShieldCheckIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Security</h2>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Change Password</p>
                        <p className="text-sm text-gray-500">Update your account password</p>
                      </div>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}








