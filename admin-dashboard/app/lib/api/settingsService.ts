import api from './client';

export interface SystemSettings {
  app_name: string;
  app_logo?: string;
  timezone: string;
  date_format: string;
  time_format: string;
  language: string;
  require_fee_clearance: boolean;
}

export interface NotificationSettings {
  email_enabled: boolean;
  email_provider?: string;
  email_from?: string;
  sms_enabled: boolean;
  sms_provider?: string;
  push_enabled: boolean;
  email_templates?: {
    welcome?: string;
    password_reset?: string;
    alert?: string;
  };
}

export interface MapSettings {
  map_provider: 'google' | 'mapbox' | 'openstreetmap';
  api_key?: string;
  default_zoom: number;
  default_center?: {
    lat: number;
    lng: number;
  };
}

export interface SecuritySettings {
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  session_timeout: number; // in minutes
  two_factor_enabled: boolean;
  ip_whitelist?: string[];
  api_keys?: Array<{
    name: string;
    key: string;
    created_at: string;
  }>;
}

export interface IntegrationSettings {
  sms_gateway?: {
    provider: string;
    api_key?: string;
    api_secret?: string;
  };
  email_service?: {
    provider: string;
    api_key?: string;
    api_secret?: string;
  };
  payment_gateway?: {
    provider: string;
    api_key?: string;
    api_secret?: string;
  };
  analytics_tools?: {
    google_analytics?: string;
    mixpanel?: string;
  };
  webhooks?: Array<{
    url: string;
    events: string[];
    enabled: boolean;
  }>;
}

class SettingsService {
  private normalizeBoolean(value: unknown, fallback: boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value === '1' || value.toLowerCase() === 'true';
    }
    return fallback;
  }

  private normalizeNumber(value: unknown, fallback: number): number {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  }

  // Get system settings
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await api.get('/admin/settings/system');
      const data = response.data.data || response.data;
      return {
        app_name: data.app_name || 'Tracksy Admin',
        app_logo: data.app_logo,
        timezone: data.timezone || 'UTC',
        date_format: data.date_format || 'YYYY-MM-DD',
        time_format: data.time_format || 'HH:mm',
        language: data.language || 'en',
        require_fee_clearance: this.normalizeBoolean(
          data.require_fee_clearance,
          true
        ),
      };
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return {
          app_name: 'Tracksy Admin',
          timezone: 'UTC',
          date_format: 'YYYY-MM-DD',
          time_format: 'HH:mm',
          language: 'en',
          require_fee_clearance: true,
        };
      }
      throw error;
    }
  }

  // Update system settings
  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await api.put('/admin/settings/system', settings);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update system settings');
    }
  }

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await api.get('/admin/settings/notifications');
      const data = response.data.data || response.data;
      return {
        email_enabled: this.normalizeBoolean(data.email_enabled, true),
        email_provider: data.email_provider,
        email_from: data.email_from,
        sms_enabled: this.normalizeBoolean(data.sms_enabled, false),
        sms_provider: data.sms_provider,
        push_enabled: this.normalizeBoolean(data.push_enabled, true),
        email_templates: data.email_templates,
      };
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return {
          email_enabled: true,
          sms_enabled: false,
          push_enabled: true,
        };
      }
      throw error;
    }
  }

  // Update notification settings
  async updateNotificationSettings(
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    try {
      const response = await api.put('/admin/settings/notifications', settings);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update notification settings'
      );
    }
  }

  // Get map settings
  async getMapSettings(): Promise<MapSettings> {
    try {
      const response = await api.get('/admin/settings/map');
      const data = response.data.data || response.data;
      let defaultCenter = data.default_center;
      if (typeof defaultCenter === 'string') {
        try {
          defaultCenter = JSON.parse(defaultCenter);
        } catch {
          defaultCenter = undefined;
        }
      }
      return {
        map_provider: (data.map_provider as MapSettings['map_provider']) || 'openstreetmap',
        api_key: data.api_key,
        default_zoom: this.normalizeNumber(data.default_zoom, 12),
        default_center: defaultCenter,
      };
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return {
          map_provider: 'openstreetmap',
          default_zoom: 12,
        };
      }
      throw error;
    }
  }

  // Update map settings
  async updateMapSettings(settings: Partial<MapSettings>): Promise<MapSettings> {
    try {
      const response = await api.put('/admin/settings/map', settings);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update map settings');
    }
  }

  // Get security settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await api.get('/admin/settings/security');
      const data = response.data.data || response.data;
      return {
        password_min_length: this.normalizeNumber(data.password_min_length, 8),
        password_require_uppercase: this.normalizeBoolean(data.password_require_uppercase, true),
        password_require_lowercase: this.normalizeBoolean(data.password_require_lowercase, true),
        password_require_numbers: this.normalizeBoolean(data.password_require_numbers, true),
        password_require_symbols: this.normalizeBoolean(data.password_require_symbols, false),
        session_timeout: this.normalizeNumber(data.session_timeout, 30),
        two_factor_enabled: this.normalizeBoolean(data.two_factor_enabled, false),
        ip_whitelist: data.ip_whitelist,
        api_keys: data.api_keys,
      };
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return {
          password_min_length: 8,
          password_require_uppercase: true,
          password_require_lowercase: true,
          password_require_numbers: true,
          password_require_symbols: false,
          session_timeout: 30,
          two_factor_enabled: false,
        };
      }
      throw error;
    }
  }

  // Update security settings
  async updateSecuritySettings(
    settings: Partial<SecuritySettings>
  ): Promise<SecuritySettings> {
    try {
      const response = await api.put('/admin/settings/security', settings);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update security settings');
    }
  }

  // Get integration settings
  async getIntegrationSettings(): Promise<IntegrationSettings> {
    try {
      const response = await api.get('/admin/settings/integrations');
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return {};
      }
      throw error;
    }
  }

  // Update integration settings
  async updateIntegrationSettings(
    settings: Partial<IntegrationSettings>
  ): Promise<IntegrationSettings> {
    try {
      const response = await api.put('/admin/settings/integrations', settings);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update integration settings'
      );
    }
  }

  // Upload logo
  async uploadLogo(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const response = await api.post('/admin/settings/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data?.url || response.data.url;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload logo');
    }
  }
}

export default new SettingsService();
