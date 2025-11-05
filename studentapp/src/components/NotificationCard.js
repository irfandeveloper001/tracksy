import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

const NotificationCard = ({ notification, onPress, onDelete, onMarkAsRead }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return COLORS.ERROR;
      case 'high':
        return COLORS.WARNING;
      case 'medium':
        return COLORS.PRIMARY;
      case 'low':
        return COLORS.SECONDARY;
      default:
        return COLORS.TEXT_SECONDARY;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'route_deviation':
        return '⚠️';
      case 'delay':
        return '⏰';
      case 'seat_available':
        return '🎫';
      case 'stop_arrival':
        return '📍';
      case 'safety':
        return '🛡️';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const severityColor = getSeverityColor(notification.severity);
  const typeIcon = getTypeIcon(notification.type);

  return (
    <TouchableOpacity
      style={[styles.container, !notification.read && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{typeIcon}</Text>
          </View>
          <View style={styles.info}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>
                {notification.title || 'Notification'}
              </Text>
              {!notification.read && (
                <View style={[styles.unreadIndicator, { backgroundColor: severityColor }]} />
              )}
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {notification.message || notification.body || ''}
            </Text>
            <View style={styles.footer}>
              <Text style={styles.date}>{formatDate(notification.created_at)}</Text>
              {notification.severity && (
                <View style={[styles.severityBadge, { backgroundColor: severityColor + '20' }]}>
                  <Text style={[styles.severityText, { color: severityColor }]}>
                    {notification.severity.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {onMarkAsRead || onDelete ? (
        <View style={styles.actions}>
          {!notification.read && onMarkAsRead && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onMarkAsRead(notification.id)}
            >
              <Text style={styles.actionText}>Mark as Read</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(notification.id)}
            >
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + '05',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '600',
    color: COLORS.TEXT,
    flex: 1,
    marginRight: SPACING.xs,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: FONTS.SIZES.xs,
    color: COLORS.TEXT_SECONDARY,
  },
  severityBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityText: {
    fontSize: FONTS.SIZES.xs,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 6,
    backgroundColor: COLORS.BACKGROUND,
    alignItems: 'center',
  },
  actionText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: COLORS.ERROR + '10',
  },
  deleteText: {
    color: COLORS.ERROR,
  },
});

export default NotificationCard;


