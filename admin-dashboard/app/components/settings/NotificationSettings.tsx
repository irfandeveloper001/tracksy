import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from '@heroicons/react/24/outline';
import settingsService, { NotificationSettings } from '../../lib/api/settingsService';
import toast from 'react-hot-toast';

interface NotificationSettingsProps {
  settings: NotificationSettings;
}

export default function NotificationSettings({ settings }: NotificationSettingsProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<NotificationSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const updateMutation = useMutation({
    mutationFn: settingsService.updateNotificationSettings,
    onSuccess: () => {
      toast.success('Notification settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>

        {/* Email Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Enable or disable email notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.email_enabled}
                onChange={(e) =>
                  setFormData({ ...formData, email_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {formData.email_enabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Provider
                </label>
                <select
                  value={formData.email_provider || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, email_provider: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Provider</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="ses">Amazon SES</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="smtp">SMTP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={formData.email_from || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, email_from: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="noreply@tracksy.com"
                />
              </div>
            </div>
          )}
        </div>

        {/* SMS Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-medium text-gray-900">SMS Notifications</h3>
              <p className="text-sm text-gray-500">Enable or disable SMS notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sms_enabled}
                onChange={(e) =>
                  setFormData({ ...formData, sms_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {formData.sms_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMS Provider
              </label>
              <select
                value={formData.sms_provider || ''}
                onChange={(e) =>
                  setFormData({ ...formData, sms_provider: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Provider</option>
                <option value="twilio">Twilio</option>
                <option value="aws-sns">AWS SNS</option>
                <option value="nexmo">Vonage (Nexmo)</option>
              </select>
            </div>
          )}
        </div>

        {/* Push Notification Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-500">Enable or disable push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.push_enabled}
                onChange={(e) =>
                  setFormData({ ...formData, push_enabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
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

