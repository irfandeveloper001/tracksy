import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { authService } from '../services/authService';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS, SPACING, FONTS } from '../constants';
import { validateEmail } from '../utils/validation';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.forgotPassword(email);

      if (result.success) {
        setSuccess(true);
        Alert.alert(
          'Success',
          'Password reset link has been sent to your email address. Please check your inbox.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        setError(result.error || 'Failed to send reset link. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError('');
            }}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            error={error}
            editable={!success}
          />

          {success && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                ✓ Password reset link has been sent to your email!
              </Text>
            </View>
          )}

          <Button
            title="Send Reset Link"
            onPress={handleReset}
            loading={loading}
            disabled={success}
            style={styles.resetButton}
          />

          <Button
            title="Back to Login"
            onPress={() => navigation.navigate('Login')}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS.SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  successText: {
    color: COLORS.SUCCESS,
    fontSize: FONTS.SIZES.sm,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
});

export default ForgotPasswordScreen;

