import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DESIGN } from '../../constants/design';

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'warning' | 'error' | 'success';
  label: string;
  large?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  large = false,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
      case 'success':
        return DESIGN.COLORS.SUCCESS;
      case 'warning':
        return DESIGN.COLORS.WARNING;
      case 'error':
        return DESIGN.COLORS.ERROR;
      case 'inactive':
      default:
        return DESIGN.COLORS.TEXT_SECONDARY;
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          {
            backgroundColor: getStatusColor(),
            width: large ? 16 : 12,
            height: large ? 16 : 12,
            borderRadius: large ? 8 : 6,
          },
        ]}
      />
      <Text
        style={[
          styles.label,
          { fontSize: large ? DESIGN.FONTS.SIZE.M : DESIGN.FONTS.SIZE.S },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DESIGN.SPACING.XS,
  },
  dot: {
    borderRadius: 6,
  },
  label: {
    color: DESIGN.COLORS.TEXT,
    fontWeight: DESIGN.FONTS.WEIGHT.MEDIUM,
  },
});

export default StatusIndicator;

