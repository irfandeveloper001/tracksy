import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { DESIGN } from '../../constants/design';

interface IconButtonProps {
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  disabled = false,
  size = 'medium',
  color,
  style,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return DESIGN.TOUCH_TARGETS.MIN_HEIGHT;
      case 'large':
        return DESIGN.TOUCH_TARGETS.LARGE_HEIGHT;
      default:
        return DESIGN.TOUCH_TARGETS.MIN_HEIGHT;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return DESIGN.TOUCH_TARGETS.ICON_SIZE;
      case 'large':
        return DESIGN.TOUCH_TARGETS.ICON_SIZE_LARGE;
      default:
        return DESIGN.TOUCH_TARGETS.ICON_SIZE;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: getSize(),
          height: getSize(),
          borderRadius: getSize() / 2,
        },
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.icon,
          {
            fontSize: getIconSize(),
            color: color || DESIGN.COLORS.PRIMARY,
          },
          disabled && styles.iconDisabled,
        ]}
      >
        {icon}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: DESIGN.COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    ...DESIGN.SHADOWS.MEDIUM,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    textAlign: 'center',
  },
  iconDisabled: {
    color: DESIGN.COLORS.TEXT_DISABLED,
  },
});

export default IconButton;

