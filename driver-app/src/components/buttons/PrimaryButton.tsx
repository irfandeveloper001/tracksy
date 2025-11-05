import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { DESIGN } from '../../constants/design';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  large?: boolean;
  style?: any;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  large = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        large && styles.buttonLarge,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text
          style={[
            styles.buttonText,
            large && styles.buttonTextLarge,
            disabled && styles.buttonTextDisabled,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: DESIGN.COLORS.PRIMARY,
    height: DESIGN.TOUCH_TARGETS.MIN_HEIGHT,
    borderRadius: DESIGN.RADIUS.M,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DESIGN.SPACING.L,
    ...DESIGN.SHADOWS.MEDIUM,
  },
  buttonLarge: {
    height: DESIGN.TOUCH_TARGETS.LARGE_HEIGHT,
    paddingHorizontal: DESIGN.SPACING.XL,
  },
  buttonDisabled: {
    backgroundColor: DESIGN.COLORS.TEXT_DISABLED,
    ...DESIGN.SHADOWS.SMALL,
  },
  buttonText: {
    color: '#fff',
    fontSize: DESIGN.FONTS.SIZE.M,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
    lineHeight: DESIGN.FONTS.LINE_HEIGHT.M,
  },
  buttonTextLarge: {
    fontSize: DESIGN.FONTS.SIZE.L,
    lineHeight: DESIGN.FONTS.LINE_HEIGHT.L,
  },
  buttonTextDisabled: {
    color: DESIGN.COLORS.TEXT_DISABLED,
  },
});

export default PrimaryButton;

