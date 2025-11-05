import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

const EmptyState = ({
  icon = '📭',
  title,
  message,
  actionLabel,
  onAction,
  iconSize = 64,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { fontSize: iconSize }]}>{icon}</Text>
      {title && <Text style={styles.title}>{title}</Text>}
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  icon: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.SIZES.xl,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.TEXT,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: FONTS.LINE_HEIGHTS.md,
    paddingHorizontal: SPACING.lg,
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.md,
    fontWeight: FONTS.WEIGHTS.semibold,
  },
});

export default EmptyState;

