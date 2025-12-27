import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from '@heroicons/react/24/outline';
import settingsService, { type SecuritySettings } from '../../lib/api/settingsService';
import toast from 'react-hot-toast';

interface SecuritySettingsProps {
  settings: SecuritySettings;
}

export default function SecuritySettings({ settings }: SecuritySettingsProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SecuritySettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: settingsService.updateSecuritySettings,
    onSuccess: () => {
      toast.success('Security settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>

        {/* Password Policy */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-medium text-gray-900 mb-4">Password Policy</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                min="6"
                max="32"
                value={formData.password_min_length}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password_min_length: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.password_require_uppercase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password_require_uppercase: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require uppercase letters</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.password_require_lowercase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password_require_lowercase: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require lowercase letters</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.password_require_numbers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password_require_numbers: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require numbers</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.password_require_symbols}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password_require_symbols: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Require symbols</span>
              </label>
            </div>
          </div>
        </div>

        {/* Session Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-medium text-gray-900 mb-4">Session Settings</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="480"
              value={formData.session_timeout}
              onChange={(e) =>
                setFormData({ ...formData, session_timeout: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Users will be logged out after this period of inactivity
            </p>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">
                Require 2FA for admin accounts
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.two_factor_enabled}
                onChange={(e) =>
                  setFormData({ ...formData, two_factor_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* IP Whitelist */}
        {formData.ip_whitelist && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-medium text-gray-900 mb-4">IP Whitelist</h3>
            <div className="space-y-2">
              {formData.ip_whitelist.map((ip, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={ip}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              IP whitelist management will be available in advanced settings
            </p>
          </div>
        )}
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
