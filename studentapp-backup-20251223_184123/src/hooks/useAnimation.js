import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { ANIMATION } from '../constants';

export const useAnimation = (initialValue = 0) => {
  const animValue = useRef(new Animated.Value(initialValue)).current;

  const animate = (toValue, config = {}) => {
    return Animated.timing(animValue, {
      toValue,
      duration: config.duration || ANIMATION.NORMAL,
      easing: config.easing || Easing.out(Easing.cubic),
      useNativeDriver: config.useNativeDriver !== false,
      ...config,
    });
  };

  const spring = (toValue, config = {}) => {
    return Animated.spring(animValue, {
      toValue,
      tension: config.tension || 65,
      friction: config.friction || 11,
      useNativeDriver: config.useNativeDriver !== false,
      ...config,
    });
  };

  const fadeIn = (duration = ANIMATION.NORMAL) => {
    return animate(1, { duration });
  };

  const fadeOut = (duration = ANIMATION.NORMAL) => {
    return animate(0, { duration });
  };

  const slideIn = (from = -100, duration = ANIMATION.NORMAL) => {
    animValue.setValue(from);
    return animate(0, { duration });
  };

  const slideOut = (to = -100, duration = ANIMATION.NORMAL) => {
    return animate(to, { duration });
  };

  const scaleIn = (duration = ANIMATION.NORMAL) => {
    animValue.setValue(0);
    return animate(1, { duration });
  };

  const scaleOut = (duration = ANIMATION.NORMAL) => {
    return animate(0, { duration });
  };

  const shake = () => {
    return Animated.sequence([
      animate(-10, { duration: ANIMATION.FAST }),
      animate(10, { duration: ANIMATION.FAST }),
      animate(-10, { duration: ANIMATION.FAST }),
      animate(10, { duration: ANIMATION.FAST }),
      animate(0, { duration: ANIMATION.FAST }),
    ]);
  };

  const pulse = () => {
    return Animated.loop(
      Animated.sequence([
        animate(1.1, { duration: ANIMATION.NORMAL }),
        animate(1, { duration: ANIMATION.NORMAL }),
      ])
    );
  };

  return {
    animValue,
    animate,
    spring,
    fadeIn,
    fadeOut,
    slideIn,
    slideOut,
    scaleIn,
    scaleOut,
    shake,
    pulse,
  };
};

export const useFadeIn = (duration = ANIMATION.NORMAL) => {
  const { animValue, fadeIn } = useAnimation(0);

  useEffect(() => {
    fadeIn(duration).start();
  }, []);

  return animValue;
};

export const useSlideIn = (from = -100, duration = ANIMATION.NORMAL) => {
  const { animValue, slideIn } = useAnimation(from);

  useEffect(() => {
    slideIn(from, duration).start();
  }, []);

  return animValue;
};

