import api from './api/api';

const STORAGE_KEY = '@tracksy_app_settings';

export interface SystemSettings {
  app_name?: string;
  app_logo?: string;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  language?: string;
  require_fee_clearance?: boolean;
}

export function getStoredSystemSettings(): SystemSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeSystemSettings(settings: SystemSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event('tracksy:settings-updated'));
}

class SystemSettingsService {
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await api.get('/settings/system');
    const data = response.data.data || response.data;
    storeSystemSettings(data || {});
    return data;
  }

  async updateSystemSettings(payload: Partial<SystemSettings>): Promise<SystemSettings> {
    const response = await api.put('/settings/system', payload);
    const data = response.data.data || response.data;
    const merged = { ...(getStoredSystemSettings() || {}), ...payload };
    storeSystemSettings(merged);
    return data;
  }

  async uploadLogo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post('/settings/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = response.data.data || response.data;
    if (data?.url) {
      const merged = { ...(getStoredSystemSettings() || {}), app_logo: data.url };
      storeSystemSettings(merged);
      return data.url;
    }
    throw new Error('Logo upload failed');
  }
}

export default new SystemSettingsService();
