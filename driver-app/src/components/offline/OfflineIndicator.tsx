import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { DESIGN } from '../../constants/design';

const OfflineIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);

      // Animate visibility
      Animated.timing(fadeAnim, {
        toValue: connected ? 0 : 1,
        duration: DESIGN.ANIMATION.NORMAL,
        useNativeDriver: true,
      }).start();
    });

    return () => unsubscribe();
  }, [fadeAnim]);

  if (isConnected) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>No Internet Connection</Text>
      <Text style={styles.subtext}>Some features may be limited</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: DESIGN.COLORS.WARNING,
    padding: DESIGN.SPACING.M,
    alignItems: 'center',
    zIndex: 1000,
    ...DESIGN.SHADOWS.LARGE,
  },
  icon: {
    fontSize: DESIGN.FONTS.SIZE.L,
    marginBottom: DESIGN.SPACING.XS,
  },
  text: {
    color: '#fff',
    fontSize: DESIGN.FONTS.SIZE.M,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
    marginBottom: DESIGN.SPACING.XS,
  },
  subtext: {
    color: '#fff',
    fontSize: DESIGN.FONTS.SIZE.S,
    opacity: 0.9,
  },
});

export default OfflineIndicator;

