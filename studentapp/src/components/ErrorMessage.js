import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';
import { errorLogger } from '../services/errorLogger';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  onDismiss,
  style,
  showRetry = true,
  showDismiss = true,
}) => {
  if (!error) return null;

  const userFriendlyMessage = errorLogger.formatErrorForUser(error);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Error</Text>
          <Text style={styles.message}>{userFriendlyMessage}</Text>
        </View>
      </View>
      
      {(showRetry || showDismiss) && (
        <View style={styles.actions}>
          {showRetry && onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
          {showDismiss && onDismiss && (
            <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.ERROR_OPACITY,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ERROR,
    borderRadius: SPACING.sm,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONTS.SIZES.md,
    fontWeight: FONTS.WEIGHTS.bold,
    color: COLORS.ERROR,
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT,
    lineHeight: FONTS.LINE_HEIGHTS.sm,
  },
  actions: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  retryButton: {
    backgroundColor: COLORS.ERROR,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.xs,
  },
  retryText: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.sm,
    fontWeight: FONTS.WEIGHTS.medium,
  },
  dismissButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  dismissText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.sm,
  },
});

export default ErrorMessage;

