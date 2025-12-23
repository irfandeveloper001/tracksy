import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

const PlaceholderScreen = ({ route }) => {
  const screenName = route?.params?.name || route?.name || 'Screen';
  
  // If route is not available, try to get from navigation
  const getScreenName = () => {
    if (route?.params?.name) return route.params.name;
    if (route?.name) return route.name;
    return 'Screen';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🚧</Text>
        <Text style={styles.title}>{getScreenName()}</Text>
        <Text style={styles.subtitle}>
          This feature will be available in the next phase.
        </Text>
        <Text style={styles.description}>
          Phase 2 focuses on Authentication & User Management.{'\n'}
          Stay tuned for more features coming soon!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS.SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.SIZES.lg,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default PlaceholderScreen;

