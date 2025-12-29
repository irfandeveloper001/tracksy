import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  setSelectedCategory,
  updateUnreadCount,
} from '../store/slices/notificationSlice';
import NotificationCard from '../components/NotificationCard';
import { COLORS, SPACING, FONTS } from '../constants';

const NotificationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, selectedCategory, isLoading, error } =
    useSelector((state) => state.notification);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch notifications when screen mounts
    dispatch(fetchNotifications());
    dispatch(updateUnreadCount());
  }, [dispatch]);

  // Filter notifications by category
  const filteredNotifications = React.useMemo(() => {
    if (selectedCategory === 'all') {
      return notifications;
    }
    return notifications.filter((n) => n.type === selectedCategory);
  }, [notifications, selectedCategory]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchNotifications()).unwrap();
      await dispatch(updateUnreadCount()).unwrap();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
      await dispatch(updateUnreadCount()).unwrap();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            try {
              await dispatch(markAllAsRead()).unwrap();
              await dispatch(updateUnreadCount()).unwrap();
            } catch (error) {
              console.error('Error marking all as read:', error);
              Alert.alert('Error', 'Failed to mark all notifications as read');
            }
          },
        },
      ]
    );
  };

  // Handle delete notification
  const handleDelete = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteNotification(notificationId)).unwrap();
              await dispatch(updateUnreadCount()).unwrap();
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  // Handle clear all
  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(clearAllNotifications()).unwrap();
            } catch (error) {
              console.error('Error clearing notifications:', error);
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
        },
      ]
    );
  };

  // Handle notification press
  const handleNotificationPress = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data) {
      switch (notification.type) {
        case 'route_deviation':
        case 'stop_arrival':
          if (notification.data.busId) {
            navigation.navigate('TrackBus', { busId: notification.data.busId });
          }
          break;
        case 'seat_available':
          if (notification.data.busId) {
            navigation.navigate('BookSeat', { busId: notification.data.busId });
          }
          break;
        default:
          break;
      }
    }
  };

  // Categories
  const categories = [
    { id: 'all', label: 'All', icon: '📢' },
    { id: 'route_deviation', label: 'Deviations', icon: '⚠️' },
    { id: 'delay', label: 'Delays', icon: '⏰' },
    { id: 'seat_available', label: 'Seats', icon: '🎫' },
    { id: 'stop_arrival', label: 'Stops', icon: '📍' },
    { id: 'safety', label: 'Safety', icon: '🛡️' },
    { id: 'system', label: 'System', icon: '🔔' },
  ];

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyText}>
        {selectedCategory === 'all'
          ? "You're all caught up! No new notifications."
          : `No ${categories.find((c) => c.id === selectedCategory)?.label.toLowerCase()} notifications.`}
      </Text>
    </View>
  );

  // Render notification item
  const renderNotification = ({ item }) => (
    <NotificationCard
      notification={item}
      onPress={() => handleNotificationPress(item)}
      onDelete={handleDelete}
      onMarkAsRead={handleMarkAsRead}
    />
  );

  // Render category filter
  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedCategory === item.id;
          return (
            <TouchableOpacity
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              onPress={() => dispatch(setSelectedCategory(item.id))}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  isSelected && styles.categoryLabelSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          {notifications.length > 0 && unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.headerButtonText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity
              style={[styles.headerButton, styles.clearButton]}
              onPress={handleClearAll}
            >
              <Text style={[styles.headerButtonText, styles.clearButtonText]}>
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      {notifications.length > 0 && renderCategoryFilter()}

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderNotification}
        contentContainerStyle={
          filteredNotifications.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.SIZES.xl,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  badge: {
    backgroundColor: COLORS.ERROR,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.xs,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerButtonText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: COLORS.ERROR + '10',
  },
  clearButtonText: {
    color: COLORS.ERROR,
  },
  categoryContainer: {
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  categoryList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.PRIMARY + '20',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  list: {
    padding: SPACING.md,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONTS.SIZES.xl,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.ERROR + '10',
    margin: SPACING.md,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONTS.SIZES.sm,
    textAlign: 'center',
  },
});

export default NotificationsScreen;

