import api from './client';

export interface SystemSettings {
  app_name: string;
  app_logo?: string;
  timezone: string;
  date_format: string;
  time_format: string;
  language: string;
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
  // Get system settings
  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const response = await api.get('/admin/settings/system');
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return {
          app_name: 'Tracksy Admin',
          timezone: 'UTC',
          date_format: 'YYYY-MM-DD',
          time_format: 'HH:mm',
          language: 'en',
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
      return response.data.data || response.data;
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
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return {
          map_provider: 'google',
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
      return response.data.data || response.data;
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

