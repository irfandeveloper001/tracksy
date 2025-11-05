import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import trackingService from './trackingService';

const NOTIFICATIONS_KEY = '@tracksy_student:notifications';
const UNREAD_COUNT_KEY = '@tracksy_student:unread_count';

export const notificationService = {
  // Get all notifications
  async getAllNotifications() {
    try {
      // First try to get from local storage
      const localNotifications = await this.getLocalNotifications();
      
      // Then try to fetch from API
      try {
        const response = await api.get('/notifications');
        if (response.success && response.data) {
          const notifications = Array.isArray(response.data) ? response.data : [];
          // Merge with local notifications
          await this.saveLocalNotifications(notifications);
          return notifications;
        }
      } catch (error) {
        console.log('Failed to fetch notifications from API, using local:', error);
      }
      
      return localNotifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  // Get local notifications from storage
  async getLocalNotifications() {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting local notifications:', error);
      return [];
    }
  },

  // Save notifications to local storage
  async saveLocalNotifications(notifications) {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving local notifications:', error);
    }
  },

  // Add notification
  async addNotification(notification) {
    try {
      const notifications = await this.getLocalNotifications();
      notifications.unshift({
        ...notification,
        id: notification.id || Date.now().toString(),
        read: false,
        created_at: notification.created_at || new Date().toISOString(),
      });
      await this.saveLocalNotifications(notifications);
      await this.updateUnreadCount();
      return notifications;
    } catch (error) {
      console.error('Error adding notification:', error);
      return [];
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notifications = await this.getLocalNotifications();
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      await this.saveLocalNotifications(updated);
      await this.updateUnreadCount();
      return updated;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return [];
    }
  },

  // Mark all as read
  async markAllAsRead() {
    try {
      const notifications = await this.getLocalNotifications();
      const updated = notifications.map((n) => ({ ...n, read: true }));
      await this.saveLocalNotifications(updated);
      await this.updateUnreadCount();
      return updated;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return [];
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const notifications = await this.getLocalNotifications();
      const updated = notifications.filter((n) => n.id !== notificationId);
      await this.saveLocalNotifications(updated);
      await this.updateUnreadCount();
      return updated;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return [];
    }
  },

  // Clear all notifications
  async clearAllNotifications() {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
      await AsyncStorage.removeItem(UNREAD_COUNT_KEY);
      return [];
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return [];
    }
  },

  // Get unread count
  async getUnreadCount() {
    try {
      const count = await AsyncStorage.getItem(UNREAD_COUNT_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      return 0;
    }
  },

  // Update unread count
  async updateUnreadCount() {
    try {
      const notifications = await this.getLocalNotifications();
      const unreadCount = notifications.filter((n) => !n.read).length;
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, unreadCount.toString());
      return unreadCount;
    } catch (error) {
      return 0;
    }
  },

  // Setup WebSocket listeners for notifications
  setupWebSocketListeners(onNotification) {
    const unsubscribers = [];

    // Listen for route deviation alerts
    const unsubscribeDeviation = trackingService.onRouteDeviation((data) => {
      if (onNotification) {
        onNotification({
          type: 'route_deviation',
          title: 'Route Deviation Alert',
          message: `Bus ${data.busId} has deviated from its route`,
          severity: 'high',
          data: data,
        });
      }
    });
    unsubscribers.push(unsubscribeDeviation);

    // Listen for general alerts
    const unsubscribeAlert = trackingService.onAlert((data) => {
      if (onNotification) {
        onNotification({
          type: data.type || 'alert',
          title: data.title || 'Alert',
          message: data.message || data.description || 'New alert received',
          severity: data.severity || 'medium',
          data: data,
        });
      }
    });
    unsubscribers.push(unsubscribeAlert);

    // Listen for emergency alerts
    const unsubscribeEmergency = trackingService.onEmergencyAlert((data) => {
      if (onNotification) {
        onNotification({
          type: 'emergency',
          title: data.title || 'Emergency Alert',
          message: data.message || data.description || 'Emergency alert received',
          severity: 'critical',
          data: data,
        });
      }
    });
    unsubscribers.push(unsubscribeEmergency);

    // Listen for stop arrival notifications
    const unsubscribeStopArrived = trackingService.onStopArrived((data) => {
      if (onNotification) {
        onNotification({
          type: 'stop_arrival',
          title: 'Stop Arrived',
          message: `Bus has arrived at ${data.stopName || 'stop'}`,
          severity: 'low',
          data: data,
        });
      }
    });
    unsubscribers.push(unsubscribeStopArrived);

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  },

  // Register device token for push notifications
  async registerDeviceToken(token) {
    try {
      const response = await api.post('/notifications/register-token', {
        device_token: token,
        platform: 'mobile',
      });
      return {
        success: response.success !== false,
        message: response.message || 'Device token registered',
      };
    } catch (error) {
      console.error('Error registering device token:', error);
      return {
        success: false,
        error: error.message || 'Failed to register device token',
      };
    }
  },

  // Get notification categories
  getNotificationCategories() {
    return [
      'all',
      'route_deviation',
      'delay',
      'seat_available',
      'stop_arrival',
      'safety',
      'system',
    ];
  },

  // Filter notifications by category
  filterByCategory(notifications, category) {
    if (category === 'all') {
      return notifications;
    }
    return notifications.filter((n) => n.type === category);
  },
};


