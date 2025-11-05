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
import { registerUser, resendVerificationEmail } from '../store/slices/authSlice';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS, SPACING, FONTS } from '../constants';
import { validateForm } from '../utils/validation';

const institutions = [
  'University of Technology',
  'State University',
  'Community College',
  'Private University',
  'Other',
];

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    institution: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [showInstitutionPicker, setShowInstitutionPicker] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleRegister = async () => {
    // Validate form
    const validation = validateForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (!formData.acceptTerms) {
      Alert.alert('Terms Required', 'Please accept the Terms & Conditions to continue.');
      return;
    }

    // Validate password match
    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match' });
      return;
    }

    try {
      const userData = {
        student_id: formData.student_id,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        institution: formData.institution,
      };

      console.log('📝 Attempting registration...');
      const result = await dispatch(registerUser(userData)).unwrap();

      // Check if email verification is required
      if (result && result.requiresVerification) {
        console.log('📧 Email verification required');
        Alert.alert(
          'Email Verification Required',
          result.message || 'Please check your email to verify your account before logging in.',
          [
            {
              text: 'Resend Email',
              onPress: async () => {
                try {
                  await dispatch(resendVerificationEmail(userData.email)).unwrap();
                  Alert.alert('Success', 'Verification email sent! Please check your inbox.');
                } catch (err) {
                  Alert.alert('Error', err || 'Failed to resend verification email.');
                }
              },
            },
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else if (result) {
        // Registration successful and user is logged in
        console.log('✅ Registration successful!');
        Alert.alert('Success', 'Registration successful! Welcome to TRACKSY.');
      }
    } catch (error) {
      console.error('❌ Registration failed:', error);
      const errorMessage = error || 'Please check your information and try again.';
      Alert.alert('Registration Failed', errorMessage);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Student ID"
            value={formData.student_id}
            onChangeText={(value) => handleChange('student_id', value)}
            placeholder="Enter your student ID"
            autoCapitalize="none"
            error={errors.student_id}
          />

          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Enter your full name"
            autoCapitalize="words"
            error={errors.name}
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Institution"
            value={formData.institution}
            onChangeText={(value) => handleChange('institution', value)}
            placeholder="Select your institution"
            editable={false}
            error={errors.institution}
            rightIcon={
              <TouchableOpacity onPress={() => setShowInstitutionPicker(!showInstitutionPicker)}>
                <Text style={styles.pickerIcon}>▼</Text>
              </TouchableOpacity>
            }
          />

          {showInstitutionPicker && (
            <View style={styles.pickerContainer}>
              {institutions.map((institution) => (
                <TouchableOpacity
                  key={institution}
                  style={styles.pickerItem}
                  onPress={() => {
                    handleChange('institution', institution);
                    setShowInstitutionPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{institution}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

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

          <Input
            label="Confirm Password"
            value={formData.password_confirmation}
            onChangeText={(value) => handleChange('password_confirmation', value)}
            placeholder="Confirm your password"
            secureTextEntry={!showPasswordConfirmation}
            error={errors.password_confirmation}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPasswordConfirmation(!showPasswordConfirmation)}>
                <Text style={styles.eyeIcon}>{showPasswordConfirmation ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            }
          />

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setFormData((prev) => ({ ...prev, acceptTerms: !prev.acceptTerms }))}
            >
              <View style={[styles.checkbox, formData.acceptTerms && styles.checkboxChecked]}>
                {formData.acceptTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I accept the{' '}
                <Text style={styles.termsLink}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign Up"
            onPress={handleRegister}
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: SPACING.xl,
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
  pickerContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: SPACING.md,
    maxHeight: 200,
  },
  pickerItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  pickerItemText: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT,
  },
  pickerIcon: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  termsContainer: {
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
  termsText: {
    fontSize: FONTS.SIZES.sm,
    color: COLORS.TEXT,
    flex: 1,
  },
  termsLink: {
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  registerButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
  },
  loginLink: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  eyeIcon: {
    fontSize: 20,
  },
});

export default RegisterScreen;

