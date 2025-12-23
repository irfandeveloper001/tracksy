import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError, resendVerificationEmail } from '../store/slices/authSlice';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS, SPACING, FONTS } from '../constants';
import { validateForm } from '../utils/validation';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error, loginRequiresVerification, loginPendingEmail } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    // Clear errors when component mounts
    dispatch(clearError());
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleLogin = async () => {
    // Validate form
    const validation = validateForm({
      email: formData.email,
      password: formData.password,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      console.log('📝 Attempting login...');
      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
      })).unwrap();

      console.log('✅ Login successful!');
      // Navigation will be handled by navigation guard
      if (result) {
        // Success - user will be redirected automatically
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = error || 'Invalid credentials. Please try again.';
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const handleResendVerification = async () => {
    const targetEmail = formData.email || loginPendingEmail;

    if (!targetEmail) {
      Alert.alert('Email Required', 'Enter your email so we can resend the verification link.');
      return;
    }

    try {
      await dispatch(resendVerificationEmail(targetEmail)).unwrap();
      Alert.alert('Verification Sent', 'Please check your inbox (and spam folder) for the new link.');
    } catch (err) {
      Alert.alert('Unable to Resend', err || 'Please try again later.');
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email or Student ID"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="Enter your email or student ID"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            error={errors.password}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            }
          />

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setFormData((prev) => ({ ...prev, rememberMe: !prev.rememberMe }))}
            >
              <View style={[styles.checkbox, formData.rememberMe && styles.checkboxChecked]}>
                {formData.rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {loginRequiresVerification && (
            <View style={styles.helperContainer}>
              <Text style={styles.helperText}>
                Didn&apos;t get the verification email?
              </Text>
              <TouchableOpacity onPress={handleResendVerification}>
                <Text style={styles.helperLink}>Resend link</Text>
              </TouchableOpacity>
            </View>
          )}

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
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
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    borderRadius: 4,
    marginRight: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.PRIMARY,
  },
  checkmark: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT,
  },
  forgotPassword: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONTS.SIZES.sm,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
  },
  signupLink: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  eyeIcon: {
    fontSize: 20,
  },
  helperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 4,
  },
  helperText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONTS.SIZES.sm,
  },
  helperLink: {
    color: COLORS.PRIMARY,
    fontSize: FONTS.SIZES.sm,
    fontWeight: '600',
  },
});

export default LoginScreen;

