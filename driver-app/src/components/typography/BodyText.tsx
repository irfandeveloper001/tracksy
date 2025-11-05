import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { DESIGN } from '../../constants/design';

interface BodyTextProps extends TextProps {
  size?: 'large' | 'medium' | 'small';
  weight?: 'bold' | 'medium' | 'regular';
  children: React.ReactNode;
}

const BodyText: React.FC<BodyTextProps> = ({
  size = 'medium',
  weight = 'regular',
  children,
  style,
  ...props
}) => {
  const getFontSize = () => {
    switch (size) {
      case 'large':
        return DESIGN.FONTS.SIZE.L;
      case 'small':
        return DESIGN.FONTS.SIZE.S;
      default:
        return DESIGN.FONTS.SIZE.M;
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'bold':
        return DESIGN.FONTS.WEIGHT.BOLD;
      case 'medium':
        return DESIGN.FONTS.WEIGHT.MEDIUM;
      default:
        return DESIGN.FONTS.WEIGHT.REGULAR;
    }
  };

  const getLineHeight = () => {
    switch (size) {
      case 'large':
        return DESIGN.FONTS.LINE_HEIGHT.L;
      case 'small':
        return DESIGN.FONTS.LINE_HEIGHT.S;
      default:
        return DESIGN.FONTS.LINE_HEIGHT.M;
    }
  };

  return (
    <Text
      style={[
        styles.text,
        {
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          lineHeight: getLineHeight(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: DESIGN.COLORS.TEXT,
  },
});

export default BodyText;

