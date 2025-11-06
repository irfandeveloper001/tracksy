import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckIcon } from '@heroicons/react/24/outline';
import settingsService, { MapSettings } from '../../lib/api/settingsService';
import toast from 'react-hot-toast';

interface MapSettingsProps {
  settings: MapSettings;
}

export default function MapSettings({ settings }: MapSettingsProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<MapSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const updateMutation = useMutation({
    mutationFn: settingsService.updateMapSettings,
    onSuccess: () => {
      toast.success('Map settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['map-settings'] });
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Map Settings</h2>

        {/* Map Provider */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Map Provider
          </label>
          <select
            value={formData.map_provider}
            onChange={(e) =>
              setFormData({ ...formData, map_provider: e.target.value as any })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="google">Google Maps</option>
            <option value="mapbox">Mapbox</option>
            <option value="openstreetmap">OpenStreetMap</option>
          </select>
        </div>

        {/* API Key */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <input
            type="password"
            value={formData.api_key || ''}
            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter API key"
          />
          <p className="mt-1 text-xs text-gray-500">
            Your API key will be securely stored
          </p>
        </div>

        {/* Default Zoom */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Zoom Level
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={formData.default_zoom}
            onChange={(e) =>
              setFormData({ ...formData, default_zoom: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Zoom level: 1 (world) to 20 (buildings)</p>
        </div>

        {/* Default Center */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Center Coordinates
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.default_center?.lat || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    default_center: {
                      ...formData.default_center,
                      lat: parseFloat(e.target.value),
                      lng: formData.default_center?.lng || 0,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.0000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.default_center?.lng || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    default_center: {
                      ...formData.default_center,
                      lat: formData.default_center?.lat || 0,
                      lng: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.0000"
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

