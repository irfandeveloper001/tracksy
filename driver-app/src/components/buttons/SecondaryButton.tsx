import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { DESIGN } from '../../constants/design';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  large?: boolean;
  style?: any;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
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
        <ActivityIndicator color={DESIGN.COLORS.PRIMARY} />
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
    backgroundColor: DESIGN.COLORS.BACKGROUND,
    height: DESIGN.TOUCH_TARGETS.MIN_HEIGHT,
    borderRadius: DESIGN.RADIUS.M,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DESIGN.SPACING.L,
    borderWidth: 2,
    borderColor: DESIGN.COLORS.PRIMARY,
    ...DESIGN.SHADOWS.SMALL,
  },
  buttonLarge: {
    height: DESIGN.TOUCH_TARGETS.LARGE_HEIGHT,
    paddingHorizontal: DESIGN.SPACING.XL,
  },
  buttonDisabled: {
    borderColor: DESIGN.COLORS.TEXT_DISABLED,
    ...DESIGN.SHADOWS.SMALL,
  },
  buttonText: {
    color: DESIGN.COLORS.PRIMARY,
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

export default SecondaryButton;

