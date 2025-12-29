import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import authService from "../lib/api/authService";
import {
  UserCircleIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../lib/i18n/LanguageProvider";
import { SUPPORTED_LANGUAGE_CODES } from "../lib/i18n/languages";
import LanguageSelect from "../components/ui/LanguageSelect";
import systemSettingsService, { getStoredSystemSettings } from "../lib/api/systemSettingsService";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const { language, setLanguage, t } = useLanguage();
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.me();
      setUser(userData);
      const stored = getStoredSystemSettings();
      if (stored?.app_logo) {
        setAppLogo(stored.app_logo);
      }
      systemSettingsService.getSystemSettings().catch(() => {});
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAppLogo(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setLogoUploading(true);
    try {
      const url = await systemSettingsService.uploadLogo(logoFile);
      setAppLogo(url);
      setLogoFile(null);
    } finally {
      setLogoUploading(false);
    }
  };

  const tabs = [
    { id: "profile", name: t('tabProfile'), icon: UserCircleIcon },
    { id: "notifications", name: t('tabNotifications'), icon: BellIcon },
    { id: "security", name: t('tabSecurity'), icon: LockClosedIcon },
    { id: "preferences", name: t('tabPreferences'), icon: PaintBrushIcon },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('settingsTitle')}</h1>
          <p className="text-gray-600 mt-1">
            {t('settingsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('profileSettings')}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.name || ""}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || ""}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        defaultValue={user?.phone || ""}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      {t('saveChanges')}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('notificationPreferences')}
                  </h2>
                  <div className="space-y-4">
                    {[
                      { label: "Email Notifications", checked: true },
                      { label: "Push Notifications", checked: true },
                      { label: "SMS Notifications", checked: false },
                      { label: "Booking Updates", checked: true },
                      { label: "Fee Reminders", checked: true },
                      { label: "Bus Location Updates", checked: true },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b border-gray-200"
                      >
                        <span className="text-gray-700">{item.label}</span>
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('securitySettings')}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      {t('updatePassword')}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('preferences')}
                  </h2>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center">
                            {appLogo ? (
                              <img
                                src={appLogo}
                                alt="App logo preview"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs font-semibold">Logo</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">App Logo</p>
                            <p className="text-sm text-gray-500">Upload a logo to replace the header icon.</p>
                          </div>
                        </div>
                        <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer">
                          <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                          Choose File
                        </label>
                      </div>
                      {logoFile && (
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <span className="text-xs text-gray-500">Selected: {logoFile.name}</span>
                          <button
                            type="button"
                            onClick={handleLogoUpload}
                            disabled={logoUploading}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-60"
                          >
                            {logoUploading ? 'Uploading...' : 'Upload'}
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('language')}
                      </label>
                      <LanguageSelect
                        value={language.code}
                        onChange={setLanguage}
                        allowedCodes={[...SUPPORTED_LANGUAGE_CODES]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('theme')}
                      </label>
                      <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>Auto</option>
                      </select>
                    </div>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      {t('savePreferences')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
