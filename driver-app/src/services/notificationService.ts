import api from './api/api';

export interface Notification {
  id: number;
  type: string; // Can be 'route_deviation', 'delay', 'seat_available', 'stop_arrival', 'safety', 'emergency', 'general', etc.
  notification_type?: string; // Display type: 'info', 'warning', 'success', 'error'
  title: string;
  message: string;
  data?: any;
  read: boolean;
  read_at?: string | null;
  created_at: string;
  user_id?: number;
  driver_id?: number;
}

class NotificationService {
  // Get notifications for driver
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/driver/notifications');
      const notifications = response.data.data || response.data;
      return Array.isArray(notifications) ? notifications : [];
    } catch (error: any) {
      // If endpoint doesn't exist or backend unavailable, return empty array
      if (error.response?.status === 404 || error.response?.status === 500 || !error.response) {
        console.warn('⚠️ Backend unavailable getting notifications, returning empty array');
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
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to mark notification as read';
      throw new Error(errorMessage);
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
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to mark all notifications as read';
      throw new Error(errorMessage);
    }
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/driver/notifications/unread-count');
      return response.data.data?.count || response.data.count || 0;
    } catch (error: any) {
      // If endpoint doesn't exist or backend unavailable, return 0
      if (error.response?.status === 404 || error.response?.status === 500 || !error.response) {
        console.warn('⚠️ Backend unavailable getting unread count, returning 0');
        return 0;
      }
      return 0;
    }
  }
}

export default new NotificationService();

