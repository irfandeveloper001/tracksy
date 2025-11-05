import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
} from '../../store/slices/notificationSlice';
import { COLORS } from '../../constants';

const NotificationsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, isLoading } = useSelector(
    (state: RootState) => state.notification
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [dispatch]);

  const loadNotifications = async () => {
    await dispatch(getNotifications());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    await dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllAsRead());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return '🚨';
      case 'route_change':
        return '🛣️';
      case 'announcement':
        return '📢';
      case 'system':
        return '⚙️';
      case 'maintenance':
        return '🔧';
      default:
        return '📬';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return COLORS.ERROR;
      case 'route_change':
        return COLORS.WARNING;
      case 'announcement':
        return COLORS.PRIMARY;
      case 'system':
        return COLORS.TEXT;
      case 'maintenance':
        return COLORS.WARNING;
      default:
        return COLORS.PRIMARY;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Actions */}
      {notifications.length > 0 && unreadCount > 0 && (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllButtonText}>Mark All as Read</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications</Text>
          <Text style={styles.emptySubtext}>
            You'll receive notifications here from admin
          </Text>
        </View>
      ) : (
        notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationItem,
              !notification.read && styles.unreadNotification,
            ]}
            onPress={() => handleMarkAsRead(notification.id)}
          >
            <View style={styles.notificationContent}>
              <View
                style={[
                  styles.notificationIcon,
                  { backgroundColor: getNotificationColor(notification.type) },
                ]}
              >
                <Text style={styles.iconText}>
                  {getNotificationIcon(notification.type)}
                </Text>
              </View>
              <View style={styles.notificationTextContainer}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.notificationMessage,
                    !notification.read && styles.unreadMessage,
                  ]}
                  numberOfLines={2}
                >
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>
                  {formatDate(notification.created_at)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: COLORS.BACKGROUND,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markAllButton: {
    backgroundColor: COLORS.PRIMARY,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationItem: {
    backgroundColor: COLORS.BACKGROUND,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
  },
  notificationContent: {
    flexDirection: 'row',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    marginBottom: 4,
  },
  unreadMessage: {
    opacity: 1,
    fontWeight: '500',
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.TEXT,
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT,
    opacity: 0.7,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default NotificationsScreen;

