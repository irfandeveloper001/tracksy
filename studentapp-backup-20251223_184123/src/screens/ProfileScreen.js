import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, logoutUser, getCurrentUser } from '../store/slices/authSlice';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS, SPACING, FONTS } from '../constants';
import { validateForm } from '../utils/validation';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id: '',
    institution: '',
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        student_id: user.student_id || '',
        institution: user.institution || '',
      });
    }
  }, [user]);

  useEffect(() => {
    // Refresh user data when screen focuses
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(getCurrentUser());
    });
    return unsubscribe;
  }, [navigation, dispatch]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSave = async () => {
    const validation = validateForm({
      name: formData.name,
      email: formData.email,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logoutUser());
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    // Navigate to change password screen (can be implemented later)
    Alert.alert('Change Password', 'This feature will be available soon.');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

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
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{user.name || 'Student'}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Enter your full name"
            editable={isEditing}
            error={errors.name}
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={isEditing}
            error={errors.email}
          />

          <Input
            label="Student ID"
            value={formData.student_id}
            onChangeText={(value) => handleChange('student_id', value)}
            placeholder="Enter your student ID"
            editable={false}
          />

          <Input
            label="Institution"
            value={formData.institution}
            onChangeText={(value) => handleChange('institution', value)}
            placeholder="Your institution"
            editable={false}
          />
        </View>

        <View style={styles.actions}>
          {isEditing ? (
            <View style={styles.editActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setIsEditing(false);
                  // Reset form data
                  if (user) {
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      student_id: user.student_id || '',
                      institution: user.institution || '',
                    });
                  }
                  setErrors({});
                }}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Save Changes"
                onPress={handleSave}
                loading={isLoading}
                style={styles.actionButton}
              />
            </View>
          ) : (
            <>
              <Button
                title="Edit Profile"
                onPress={() => setIsEditing(true)}
                style={styles.actionButton}
              />
              <Button
                title="Change Password"
                onPress={handleChangePassword}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title="Logout"
                onPress={handleLogout}
                variant="danger"
                style={styles.actionButton}
              />
            </>
          )}
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
    padding: SPACING.lg,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: SPACING.xl,
    color: COLORS.TEXT_SECONDARY,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONTS.SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  name: {
    fontSize: FONTS.SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONTS.SIZES.md,
    color: COLORS.TEXT_SECONDARY,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.SIZES.lg,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: SPACING.md,
  },
  actions: {
    marginTop: SPACING.lg,
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.md,
  },
});

export default ProfileScreen;

