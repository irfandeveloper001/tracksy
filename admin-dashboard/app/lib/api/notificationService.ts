import api from './client';

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  notification_type?: string;
  data?: Record<string, any>;
}

export interface AdminNotificationResponse {
  notifications: AdminNotification[];
  total: number;
}

const notificationService = {
  async getNotifications(params?: {
    user_id?: number | string;
    read?: boolean;
    per_page?: number;
  }): Promise<AdminNotificationResponse> {
    const response = await api.get('/admin/notifications', { params });
    const payload = response.data?.data ?? response.data;

    if (payload && Array.isArray(payload.data)) {
      const notifications = payload.data.map((item: any) => ({
        id: item.id,
        title: item.title || 'Notification',
        message: item.message || '',
        read: Boolean(item.read),
        created_at: item.created_at,
        notification_type: item.notification_type,
        data: item.data || {},
      }));

      return { notifications, total: payload.total || notifications.length };
    }

    if (Array.isArray(payload)) {
      const notifications = payload.map((item: any) => ({
        id: item.id,
        title: item.title || 'Notification',
        message: item.message || '',
        read: Boolean(item.read),
        created_at: item.created_at,
        notification_type: item.notification_type,
        data: item.data || {},
      }));

      return { notifications, total: notifications.length };
    }

    return { notifications: [], total: 0 };
  },

  async markAsRead(id: number): Promise<void> {
    await api.put(`/admin/notifications/${id}/read`);
  },

  async markAllAsRead(userId?: number | string): Promise<void> {
    await api.put('/admin/notifications/read-all', {
      user_id: userId,
    });
  },
};

export default notificationService;
