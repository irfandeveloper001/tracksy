import api from './client';
import { supabase } from '../config/supabase';

export interface Alert {
  id: string;
  type: 'route_deviation' | 'bus_delay' | 'emergency' | 'maintenance' | 'system_error';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  status: 'new' | 'acknowledged' | 'resolved';
  bus_id?: string;
  bus_number?: string;
  route_id?: string;
  route_name?: string;
  driver_id?: string;
  driver_name?: string;
  created_at: string;
  updated_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
  resolved_by?: string;
}

export interface AlertFilters {
  type?: string;
  severity?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface AlertListResponse {
  alerts: Alert[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  audience_type: 'all' | 'route' | 'driver' | 'student' | 'custom';
  audience_ids?: string[];
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  created_at: string;
}

class AlertService {
  // Get all alerts with filters and pagination
  async getAlerts(
    page: number = 1,
    perPage: number = 20,
    filters?: AlertFilters
  ): Promise<AlertListResponse> {
    try {
      const params: any = {
        page,
        per_page: perPage,
        ...filters,
      };

      const response = await api.get('/admin/alerts', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning empty alerts list');
        return {
          alerts: [],
          total: 0,
          current_page: 1,
          per_page: perPage,
          last_page: 1,
        };
      }
      throw error;
    }
  }

  // Get single alert by ID
  async getAlertById(alertId: string): Promise<Alert> {
    try {
      const response = await api.get(`/admin/alerts/${alertId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        throw new Error('Backend unavailable');
      }
      throw error;
    }
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId: string, notes?: string): Promise<Alert> {
    try {
      const response = await api.post(`/admin/alerts/${alertId}/acknowledge`, { notes });
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to acknowledge alert');
    }
  }

  // Resolve alert
  async resolveAlert(alertId: string, resolution?: string): Promise<Alert> {
    try {
      const response = await api.post(`/admin/alerts/${alertId}/resolve`, { resolution });
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resolve alert');
    }
  }

  // Forward alert
  async forwardAlert(
    alertId: string,
    recipientType: 'driver' | 'student',
    recipientIds: string[]
  ): Promise<void> {
    try {
      await api.post(`/admin/alerts/${alertId}/forward`, {
        recipient_type: recipientType,
        recipient_ids: recipientIds,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to forward alert');
    }
  }

  // Get alert history
  async getAlertHistory(alertId: string): Promise<any[]> {
    try {
      const response = await api.get(`/admin/alerts/${alertId}/history`);
      return response.data.data || response.data || [];
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return [];
      }
      return [];
    }
  }

  // Create notification - Try Supabase first, fallback to API
  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    try {
      // First, try to create in Supabase directly
      const supabaseNotification = await this.createNotificationInSupabase(notificationData);
      if (supabaseNotification) {
        console.log('✅ Notification created in Supabase:', supabaseNotification);
        return supabaseNotification;
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase creation failed, trying API:', supabaseError);
    }

    // Fallback to API if Supabase fails
    try {
      const response = await api.post('/admin/notifications', notificationData, {
        skipErrorToast: true,
      } as any);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create notification');
    }
  }

  // Get notifications
  async getNotifications(
    page: number = 1,
    perPage: number = 20
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const response = await api.get('/admin/notifications', {
        params: { page, per_page: perPage },
      });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return { notifications: [], total: 0 };
      }
      return { notifications: [], total: 0 };
    }
  }

  // Send notification
  async sendNotification(notificationId: string): Promise<void> {
    try {
      await api.post(`/admin/notifications/${notificationId}/send`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send notification');
    }
  }

  // Get notification preferences
  async getNotificationPreferences(): Promise<any> {
    try {
      const response = await api.get('/admin/notifications/preferences');
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return {};
      }
      return {};
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences: any): Promise<void> {
    try {
      await api.put('/admin/notifications/preferences', preferences);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  }

  // Create notification directly in Supabase
  async createNotificationInSupabase(notificationData: Partial<Notification>): Promise<Notification | null> {
    try {
      // Validate required fields
      if (!notificationData.title || !notificationData.message) {
        throw new Error('Title and message are required');
      }

      // Map the data to Supabase alerts schema
      const alertData: any = {
        type: notificationData.type || 'info',
        title: notificationData.title,
        message: notificationData.message,
        severity: 'medium', // Default severity
        audience_type: notificationData.audience_type || 'all',
        status: 'active',
      };

      // Add optional fields
      if (notificationData.audience_ids && notificationData.audience_ids.length > 0) {
        alertData.audience_ids = notificationData.audience_ids;
      }

      console.log('🔔 Inserting alert into Supabase:', alertData);

      const { data, error } = await supabase
        .from('alerts')
        .insert(alertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        
        // Provide user-friendly error messages
        if (error.code === '23505') {
          throw new Error('An alert with this information already exists.');
        }
        
        throw new Error(error.message || 'Failed to create alert in database');
      }

      if (!data) {
        throw new Error('Alert was created but no data was returned');
      }

      console.log('✅ Alert successfully created in Supabase:', data);

      // Map Supabase response to Notification interface
      const notification: Notification = {
        id: data.id,
        title: data.title,
        message: data.message,
        type: data.type as any,
        audience_type: data.audience_type as any,
        audience_ids: data.audience_ids || [],
        status: 'sent',
        created_at: data.created_at,
      };

      return notification;
    } catch (error: any) {
      console.error('❌ Failed to create alert in Supabase:', error);
      throw error;
    }
  }
}

export default new AlertService();

