import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from '@heroicons/react/24/outline';
import settingsService, { type SystemSettings } from '../../lib/api/settingsService';
import LanguageSelect from '../ui/LanguageSelect';
import { useLanguage } from '../../lib/i18n/LanguageProvider';
import { SUPPORTED_LANGUAGE_CODES } from '../../lib/i18n/languages';
import toast from 'react-hot-toast';

interface SystemSettingsProps {
  settings: SystemSettings;
}

export default function SystemSettings({ settings }: SystemSettingsProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    setFormData(settings);
    if (settings.language) {
      setLanguage(settings.language);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: settingsService.updateSystemSettings,
    onSuccess: () => {
      toast.success('System settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
      setIsSaving(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    updateMutation.mutate(formData);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h2>

        {/* App Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('appNameLabel')}
          </label>
          <input
            type="text"
            value={formData.app_name}
            onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Logo Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('appLogoLabel')}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                settingsService.uploadLogo(file).then((url) => {
                  setFormData({ ...formData, app_logo: url });
                  toast.success('Logo uploaded successfully');
                });
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formData.app_logo && (
            <img
              src={formData.app_logo}
              alt="App Logo"
              className="mt-2 h-16 w-auto"
            />
          )}
        </div>

        {/* Timezone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('timezoneLabel')}
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Asia/Dubai">Dubai (GST)</option>
            <option value="Asia/Karachi">Karachi (PKT)</option>
            <option value="Asia/Kolkata">Kolkata (IST)</option>
          </select>
        </div>

        {/* Date Format */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('dateFormatLabel')}
          </label>
          <select
            value={formData.date_format}
            onChange={(e) => setFormData({ ...formData, date_format: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
          </select>
        </div>

        {/* Time Format */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('timeFormatLabel')}
          </label>
          <select
            value={formData.time_format}
            onChange={(e) => setFormData({ ...formData, time_format: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="HH:mm">24-hour (HH:mm)</option>
            <option value="hh:mm A">12-hour (hh:mm AM/PM)</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('languageLabel')}
          </label>
          <LanguageSelect
            value={language.code}
            onChange={(code) => {
              setLanguage(code);
              setFormData((prev) => ({ ...prev, language: code }));
            }}
            allowedCodes={[...SUPPORTED_LANGUAGE_CODES]}
          />
          <p className="mt-2 text-xs text-gray-500">
            {t('languageHint')}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {t('languageOfflineNote')}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('portalAccessPolicyTitle')}
          </label>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50/70 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {t('requireFeeClearanceTitle')}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {t('requireFeeClearanceHint')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {formData.require_fee_clearance ? t('portalAccessEnforced') : t('portalAccessNotEnforced')}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={formData.require_fee_clearance}
                onClick={() =>
                  setFormData({
                    ...formData,
                    require_fee_clearance: !formData.require_fee_clearance,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.require_fee_clearance ? 'bg-slate-500' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    formData.require_fee_clearance ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            'Saving...'
          ) : (
            <>
              <CheckIcon className="h-5 w-5 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
