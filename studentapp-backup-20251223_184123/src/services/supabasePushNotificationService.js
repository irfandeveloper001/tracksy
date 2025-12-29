import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import supabase from '../config/supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class SupabasePushNotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  // Initialize push notifications
  async initialize() {
    if (this.isInitialized) {
      return this.expoPushToken;
    }

    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('⚠️ Push notification permissions not granted');
        return null;
      }

      // Get Expo push token
      const token = await this.getExpoPushToken();
      if (token) {
        this.expoPushToken = token;
        await this.registerWithSupabase(token);
        this.setupNotificationListeners();
        this.isInitialized = true;
        console.log('✅ Push notifications initialized:', token);
        return token;
      }

      return null;
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
      return null;
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      if (!Device.isDevice) {
        console.warn('⚠️ Must use physical device for push notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Failed to get push notification permissions');
        return false;
      }

      // Configure Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1E88E5',
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  // Get Expo push token
  async getExpoPushToken() {
    try {
      if (!Device.isDevice) {
        console.warn('⚠️ Push notifications only work on physical devices');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '5a65ef4d-0a4a-45c9-b90c-2a671b2777d5', // Your Expo project ID
      });

      return tokenData.data;
    } catch (error) {
      console.error('❌ Error getting Expo push token:', error);
      return null;
    }
  }

  // Register push token with Supabase
  async registerWithSupabase(expoPushToken) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('⚠️ No user logged in, skipping push token registration');
        return;
      }

      // Store push token in Supabase database
      // You'll need to create a 'user_push_tokens' table in Supabase
      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: user.id,
          expo_push_token: expoPushToken,
          platform: Platform.OS,
          device_id: Device.deviceName || Device.modelName || 'unknown',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,expo_push_token',
        });

      if (error) {
        console.error('❌ Error registering push token with Supabase:', error);
        // Don't throw - app should still work without push notifications
      } else {
        console.log('✅ Push token registered with Supabase');
      }
    } catch (error) {
      console.error('❌ Error registering push token:', error);
    }
  }

  // Setup notification listeners
  setupNotificationListeners() {
    // Listen for notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification received:', notification);
        // Handle notification in your app
        this.handleNotification(notification);
      }
    );

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        // Handle notification tap
        this.handleNotificationTap(response);
      }
    );
  }

  // Handle received notification
  handleNotification(notification) {
    const { title, body, data } = notification.request.content;
    
    // You can dispatch to Redux store here
    // dispatch(addNotification({ title, body, data }));
    
    console.log('📬 Notification:', { title, body, data });
  }

  // Handle notification tap
  handleNotificationTap(response) {
    const { notification } = response;
    const { data } = notification.request.content;

    // Navigate to appropriate screen based on notification data
    // navigation.navigate(data.screen, data.params);
    
    console.log('👆 Notification tapped:', data);
  }

  // Send local notification (for testing)
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
    }
  }

  // Get badge count
  async getBadgeCount() {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('❌ Error getting badge count:', error);
      return 0;
    }
  }

  // Set badge count
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('❌ Error setting badge count:', error);
    }
  }

  // Clear all notifications
  async clearAllNotifications() {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }

  // Cleanup
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    this.isInitialized = false;
  }

  // Get current push token
  getPushToken() {
    return this.expoPushToken;
  }
}

// Export singleton instance
export default new SupabasePushNotificationService();

