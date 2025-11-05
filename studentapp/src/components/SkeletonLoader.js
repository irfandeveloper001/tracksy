import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants';

const SkeletonLoader = ({ width, height, borderRadius = RADIUS.sm, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width || '100%',
          height: height || 20,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton for different use cases
export const SkeletonCard = () => (
  <View style={styles.cardContainer}>
    <SkeletonLoader height={40} width="60%" style={styles.titleSkeleton} />
    <SkeletonLoader height={16} width="100%" style={styles.lineSkeleton} />
    <SkeletonLoader height={16} width="80%" style={styles.lineSkeleton} />
    <SkeletonLoader height={16} width="60%" style={styles.lineSkeleton} />
  </View>
);

export const SkeletonList = ({ count = 3 }) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.BORDER,
  },
  cardContainer: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
  },
  titleSkeleton: {
    marginBottom: SPACING.sm,
  },
  lineSkeleton: {
    marginTop: SPACING.xs,
  },
});

export default SkeletonLoader;

