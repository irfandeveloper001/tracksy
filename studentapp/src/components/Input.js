import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rightIcon,
  onRightIconPress,
  editable = true,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={[styles.input, !editable && styles.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.SIZES.md,
    fontWeight: '500',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE,
    minHeight: 44, // Minimum touch target
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT,
    paddingVertical: SPACING.sm,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  inputDisabled: {
    backgroundColor: COLORS.BACKGROUND,
    color: COLORS.TEXT_SECONDARY,
  },
  rightIcon: {
    padding: SPACING.xs,
  },
  errorText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.ERROR,
    marginTop: SPACING.xs,
  },
});

export default Input;

