import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

const StatCard = ({ title, value, subtitle, icon, color = COLORS.PRIMARY, onPress }) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.container, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Text style={[styles.value, { color }]} numberOfLines={1}>
          {value}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    // Using shadowColor for React Native compatibility (works on both native and web)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // Web-specific boxShadow (if needed, can be added via Platform.select)
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  icon: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: FONTS.SIZES.xxl,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.SIZES.xs,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default StatCard;

