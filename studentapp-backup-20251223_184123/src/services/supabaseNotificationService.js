import supabase from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabasePushNotificationService from './supabasePushNotificationService';

const NOTIFICATIONS_KEY = '@tracksy_student:notifications';
const UNREAD_COUNT_KEY = '@tracksy_student:unread_count';

class SupabaseNotificationService {
  constructor() {
    this.realtimeSubscription = null;
    this.notificationListeners = [];
  }

  // Get all notifications from Supabase
  async getAllNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user logged in, returning local notifications');
        return await this.getLocalNotifications();
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching notifications from Supabase:', error);
        return await this.getLocalNotifications();
      }

      // Save to local storage for offline access
      if (data && data.length > 0) {
        await this.saveLocalNotifications(data);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return await this.getLocalNotifications();
    }
  }

  // Get local notifications
  async getLocalNotifications() {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting local notifications:', error);
      return [];
    }
  }

  // Save notifications to local storage
  async saveLocalNotifications(notifications) {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving local notifications:', error);
    }
  }

  // Add notification (used when receiving from realtime)
  async addNotification(notification) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save to Supabase
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: notification.type || 'info',
          title: notification.title,
          message: notification.message || notification.body,
          severity: notification.severity || 'medium',
          read: false,
          data: notification.data || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving notification to Supabase:', error);
        // Still save locally
        await this.addLocalNotification(notification);
      } else {
        // Save locally
        await this.addLocalNotification(data);
        
        // Show push notification
        await supabasePushNotificationService.sendLocalNotification(
          notification.title,
          notification.message || notification.body,
          notification
        );
      }

      // Notify listeners
      this.notificationListeners.forEach((listener) => {
        listener(notification);
      });

      return data;
    } catch (error) {
      console.error('Error adding notification:', error);
      await this.addLocalNotification(notification);
      return null;
    }
  }

  // Add notification to local storage only
  async addLocalNotification(notification) {
    try {
      const notifications = await this.getLocalNotifications();
      notifications.unshift({
        ...notification,
        id: notification.id || Date.now().toString(),
        read: notification.read || false,
        created_at: notification.created_at || new Date().toISOString(),
      });
      await this.saveLocalNotifications(notifications);
      await this.updateUnreadCount();
    } catch (error) {
      console.error('Error adding local notification:', error);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking notification as read in Supabase:', error);
      }

      // Update locally
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
  }

  // Mark all as read
  async markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all as read in Supabase:', error);
      }

      // Update locally
      const notifications = await this.getLocalNotifications();
      const updated = notifications.map((n) => ({ ...n, read: true }));
      await this.saveLocalNotifications(updated);
      await this.updateUnreadCount();

      return updated;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return [];
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete from Supabase
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting notification from Supabase:', error);
      }

      // Delete locally
      const notifications = await this.getLocalNotifications();
      const filtered = notifications.filter((n) => n.id !== notificationId);
      await this.saveLocalNotifications(filtered);
      await this.updateUnreadCount();

      return filtered;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return [];
    }
  }

  // Clear all notifications
  async clearAll() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete from Supabase
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing notifications from Supabase:', error);
      }

      // Clear locally
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
      await this.updateUnreadCount();

      return [];
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return [];
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const localNotifications = await this.getLocalNotifications();
        return localNotifications.filter((n) => !n.read).length;
      }

      // Get from Supabase
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error getting unread count from Supabase:', error);
        const localNotifications = await this.getLocalNotifications();
        return localNotifications.filter((n) => !n.read).length;
      }

      // Save locally
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, count?.toString() || '0');
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Update unread count
  async updateUnreadCount() {
    try {
      const count = await this.getUnreadCount();
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, count.toString());
      return count;
    } catch (error) {
      return 0;
    }
  }

  // Setup Supabase Realtime subscription for notifications
  setupRealtimeSubscription(onNotification) {
    try {
      const { data: { user } } = supabase.auth.getUser();
      if (!user) {
        console.warn('No user logged in, cannot setup realtime subscription');
        return () => {};
      }

      console.log('🔔 Setting up Supabase Realtime subscription for notifications');

      // Subscribe to notifications table changes
      this.realtimeSubscription = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('📬 New notification received:', payload.new);
            const notification = {
              id: payload.new.id,
              type: payload.new.type,
              title: payload.new.title,
              message: payload.new.message,
              severity: payload.new.severity,
              read: payload.new.read,
              data: payload.new.data || {},
              created_at: payload.new.created_at,
            };

            // Add to local storage
            this.addLocalNotification(notification);

            // Show push notification
            supabasePushNotificationService.sendLocalNotification(
              notification.title,
              notification.message,
              notification
            );

            // Notify callback
            if (onNotification) {
              onNotification(notification);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('📬 Notification updated:', payload.new);
            // Update local storage
            this.updateLocalNotification(payload.new);
          }
        )
        .subscribe((status) => {
          console.log('🔔 Realtime subscription status:', status);
        });

      // Return unsubscribe function
      return () => {
        if (this.realtimeSubscription) {
          supabase.removeChannel(this.realtimeSubscription);
          this.realtimeSubscription = null;
        }
      };
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      return () => {};
    }
  }

  // Update local notification
  async updateLocalNotification(notification) {
    try {
      const notifications = await this.getLocalNotifications();
      const updated = notifications.map((n) =>
        n.id === notification.id ? { ...n, ...notification } : n
      );
      await this.saveLocalNotifications(updated);
      await this.updateUnreadCount();
    } catch (error) {
      console.error('Error updating local notification:', error);
    }
  }

  // Add notification listener
  addListener(callback) {
    this.notificationListeners.push(callback);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  // Cleanup
  cleanup() {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
    }
    this.notificationListeners = [];
  }
}

export default new SupabaseNotificationService();

