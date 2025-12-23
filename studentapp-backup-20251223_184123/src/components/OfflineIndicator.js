import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import networkService from '../services/networkService';
import { COLORS, SPACING, FONTS, ANIMATION } from '../constants';

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Initialize network service
    networkService.init();

    // Listen for network changes
    const unsubscribe = networkService.onNetworkChange((isConnected) => {
      setIsOffline(!isConnected);
      
      if (!isConnected) {
        // Slide down
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      } else {
        // Slide up
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: ANIMATION.NORMAL,
          useNativeDriver: true,
        }).start();
      }
    });

    // Check initial connection
    networkService.checkConnection().then((connected) => {
      setIsOffline(!connected);
    });

    return () => {
      unsubscribe();
      networkService.cleanup();
    };
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.icon}>📶</Text>
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.ERROR,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    ...Platform.select({
      ios: {
        paddingTop: SPACING.md + 20, // Account for status bar
      },
      android: {
        paddingTop: SPACING.md,
      },
    }),
  },
  icon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  text: {
    color: COLORS.WHITE,
    fontSize: FONTS.SIZES.sm,
    fontWeight: FONTS.WEIGHTS.medium,
  },
});

export default OfflineIndicator;

