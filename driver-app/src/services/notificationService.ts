import api from './api/api';

export interface Notification {
  id: number;
  type: 'announcement' | 'route_change' | 'emergency' | 'system' | 'maintenance';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  driver_id?: number;
}

class NotificationService {
  // Get notifications for driver
  async getNotifications(): Promise<Notification[]> {
    try {
      // Note: This endpoint may need to be created in backend
      // For now, we'll use a placeholder or get from alerts
      const response = await api.get('/driver/notifications');
      const notifications = response.data.data || response.data;
      return Array.isArray(notifications) ? notifications : [];
    } catch (error: any) {
      // If endpoint doesn't exist, return empty array
      if (error.response?.status === 404) {
        return [];
      }
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get notifications';
      throw new Error(errorMessage);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await api.put(`/driver/notifications/${notificationId}/read`);
    } catch (error: any) {
      // If endpoint doesn't exist, ignore
      if (error.response?.status === 404) {
        return;
      }
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    try {
      await api.put('/driver/notifications/read-all');
    } catch (error: any) {
      // If endpoint doesn't exist, ignore
      if (error.response?.status === 404) {
        return;
      }
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/driver/notifications/unread-count');
      return response.data.data?.count || response.data.count || 0;
    } catch (error: any) {
      // If endpoint doesn't exist, return 0
      if (error.response?.status === 404) {
        return 0;
      }
      return 0;
    }
  }
}

export default new NotificationService();

