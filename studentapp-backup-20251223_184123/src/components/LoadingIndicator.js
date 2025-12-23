import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

const LoadingIndicator = ({ 
  size = 'large', 
  color = COLORS.PRIMARY, 
  message,
  fullScreen = false 
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size={size} color={color} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  message: {
    marginTop: SPACING.md,
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default LoadingIndicator;
