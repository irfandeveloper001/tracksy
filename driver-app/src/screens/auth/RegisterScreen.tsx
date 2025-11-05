import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { COLORS } from '../../constants';
import supabaseAuthService from '../../services/supabaseAuthService';

const RegisterScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    driver_id: '',
    phone: '',
    license_number: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!formData.driver_id.trim()) {
      Alert.alert('Error', 'Please enter your driver ID');
      return;
    }

    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('📝 Registering driver...');
      const result = await supabaseAuthService.register(
        formData.email.trim(),
        formData.password.trim(),
        {
          name: formData.name.trim(),
          driver_id: formData.driver_id.trim(),
          phone: formData.phone.trim() || undefined,
          license_number: formData.license_number.trim() || undefined,
        }
      );

      if (result.success) {
        console.log('✅ Registration successful:', result);
        setIsLoading(false); // Clear loading immediately
        
        if (result.requiresVerification) {
          // Use setTimeout to ensure Alert shows after state update
          setTimeout(() => {
            Alert.alert(
              'Registration Successful',
              result.message || 'Please check your email to verify your account before logging in.',
              [
                {
                  text: 'Resend Email',
                  onPress: async () => {
                    try {
                      await supabaseAuthService.resendVerificationEmail(formData.email);
                      Alert.alert('Success', 'Verification email sent. Please check your inbox.');
                    } catch (err: any) {
                      Alert.alert('Error', err.message || 'Failed to resend verification email');
                    }
                  },
                },
                {
                  text: 'Go to Login',
                  onPress: () => {
                    navigation.navigate('Login');
                  },
                  style: 'default',
                },
              ]
            );
          }, 100);
        } else {
          // Use setTimeout to ensure Alert shows after state update
          setTimeout(() => {
            Alert.alert('Success', 'Registration successful!', [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Login');
                },
              },
            ]);
          }, 100);
        }
      } else {
        console.error('❌ Registration failed:', result.error);
        setIsLoading(false);
        setError(result.error || 'Registration failed');
        setTimeout(() => {
          Alert.alert('Registration Failed', result.error || 'Registration failed');
        }, 100);
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      const errorMessage = err.message || err.error || 'Registration failed';
      setError(errorMessage);
      setIsLoading(false);
      setTimeout(() => {
        Alert.alert('Registration Failed', errorMessage);
      }, 100);
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
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to become a driver</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={!isLoading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>

            {/* Driver ID Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Driver ID *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your driver ID"
                placeholderTextColor="#999"
                value={formData.driver_id}
                onChangeText={(text) => setFormData({ ...formData, driver_id: text })}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            {/* License Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>License Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter license number"
                placeholderTextColor="#999"
                value={formData.license_number}
                onChangeText={(text) => setFormData({ ...formData, license_number: text })}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password (min 6 characters)"
                  placeholderTextColor="#999"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeButtonText}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Error Message */}
            {error && !isLoading ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                disabled={isLoading}
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: COLORS.TEXT,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.TEXT,
  },
  eyeButton: {
    padding: 16,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  registerButton: {
    height: 56,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginLinkText: {
    fontSize: 16,
    color: COLORS.TEXT,
    opacity: 0.7,
  },
  loginLink: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
});

export default RegisterScreen;

