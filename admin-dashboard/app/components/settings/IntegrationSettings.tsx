import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from '@heroicons/react/24/outline';
import settingsService, { type IntegrationSettings } from '../../lib/api/settingsService';
import toast from 'react-hot-toast';

interface IntegrationSettingsProps {
  settings: IntegrationSettings;
}

export default function IntegrationSettings({ settings }: IntegrationSettingsProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<IntegrationSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: settingsService.updateIntegrationSettings,
    onSuccess: () => {
      toast.success('Integration settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Integration Settings</h2>

        {/* SMS Gateway */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-medium text-gray-900 mb-4">SMS Gateway</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider
              </label>
              <select
                value={formData.sms_gateway?.provider || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sms_gateway: {
                      ...formData.sms_gateway,
                      provider: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Provider</option>
                <option value="twilio">Twilio</option>
                <option value="aws-sns">AWS SNS</option>
                <option value="nexmo">Vonage (Nexmo)</option>
                <option value="messagebird">MessageBird</option>
              </select>
            </div>
            {formData.sms_gateway?.provider && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={formData.sms_gateway?.api_key || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sms_gateway: {
                          ...formData.sms_gateway,
                          provider: formData.sms_gateway?.provider || '',
                          api_key: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={formData.sms_gateway?.api_secret || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sms_gateway: {
                          ...formData.sms_gateway,
                          provider: formData.sms_gateway?.provider || '',
                          api_secret: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter API secret"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Email Service */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-medium text-gray-900 mb-4">Email Service</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider
              </label>
              <select
                value={formData.email_service?.provider || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email_service: {
                      ...formData.email_service,
                      provider: e.target.value,
                    },
                  })
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
            {formData.email_service?.provider && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={formData.email_service?.api_key || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email_service: {
                          ...formData.email_service,
                          provider: formData.email_service?.provider || '',
                          api_key: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={formData.email_service?.api_secret || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email_service: {
                          ...formData.email_service,
                          provider: formData.email_service?.provider || '',
                          api_secret: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter API secret"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Analytics Tools */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-medium text-gray-900 mb-4">Analytics Tools</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={formData.analytics_tools?.google_analytics || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    analytics_tools: {
                      ...formData.analytics_tools,
                      google_analytics: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mixpanel Token
              </label>
              <input
                type="text"
                value={formData.analytics_tools?.mixpanel || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    analytics_tools: {
                      ...formData.analytics_tools,
                      mixpanel: e.target.value,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Mixpanel token"
              />
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
