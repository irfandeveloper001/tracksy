import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { DESIGN } from '../../constants/design';

interface HeadingProps extends TextProps {
  level?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}

const Heading: React.FC<HeadingProps> = ({ level = 1, children, style, ...props }) => {
  const getStyles = () => {
    switch (level) {
      case 1:
        return styles.h1;
      case 2:
        return styles.h2;
      case 3:
        return styles.h3;
      case 4:
        return styles.h4;
      default:
        return styles.h1;
    }
  };

  return (
    <Text style={[getStyles(), style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: DESIGN.FONTS.SIZE.XL,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
    color: DESIGN.COLORS.TEXT,
    lineHeight: DESIGN.FONTS.LINE_HEIGHT.XL,
  },
  h2: {
    fontSize: DESIGN.FONTS.SIZE.L,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
    color: DESIGN.COLORS.TEXT,
    lineHeight: DESIGN.FONTS.LINE_HEIGHT.L,
  },
  h3: {
    fontSize: DESIGN.FONTS.SIZE.M,
    fontWeight: DESIGN.FONTS.WEIGHT.SEMIBOLD,
    color: DESIGN.COLORS.TEXT,
    lineHeight: DESIGN.FONTS.LINE_HEIGHT.M,
  },
  h4: {
    fontSize: DESIGN.FONTS.SIZE.S,
    fontWeight: DESIGN.FONTS.WEIGHT.SEMIBOLD,
    color: DESIGN.COLORS.TEXT,
    lineHeight: DESIGN.FONTS.LINE_HEIGHT.S,
  },
});

export default Heading;

