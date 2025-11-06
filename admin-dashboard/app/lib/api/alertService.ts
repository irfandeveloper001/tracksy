import api from './client';

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

  // Create notification
  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    try {
      const response = await api.post('/admin/notifications', notificationData);
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
}

export default new AlertService();

