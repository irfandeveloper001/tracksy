import api from './client';

export interface StudentNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  notification_type?: string;
  type?: string;
  data?: Record<string, any>;
}

const notificationService = {
  async getNotifications(): Promise<StudentNotification[]> {
    const response = await api.get('/student/notifications');
    const payload = response.data?.data ?? response.data;
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }
    return [];
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/student/notifications/unread-count');
    const payload = response.data?.data ?? response.data;
    return payload?.count || 0;
  },

  async markAsRead(id: number): Promise<void> {
    await api.put(`/student/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/student/notifications/read-all');
  },

  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/student/notifications/${id}`);
  },
};

export default notificationService;
