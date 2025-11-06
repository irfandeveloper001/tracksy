import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from '@heroicons/react/24/outline';
import settingsService, { SystemSettings } from '../../lib/api/settingsService';
import toast from 'react-hot-toast';

interface SystemSettingsProps {
  settings: SystemSettings;
}

export default function SystemSettings({ settings }: SystemSettingsProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

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
            App Name
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
            App Logo
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
            Timezone
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
            Date Format
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
            Time Format
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

        {/* Language */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ar">Arabic</option>
            <option value="ur">Urdu</option>
          </select>
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

