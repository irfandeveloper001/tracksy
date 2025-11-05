import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  logoutUser,
} from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store/store';
import { COLORS } from '../../constants';
import { DESIGN } from '../../constants/design';

const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        license_number: user.license_number || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await dispatch(updateProfile(editData)).unwrap();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await dispatch(changePassword(passwordData)).unwrap();
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logoutUser());
          navigation.replace('Login');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const handleOpenDebug = () => {
    navigation.navigate('Debug');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Driver Profile</Text>
        {!isEditing && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.name}
              onChangeText={(text) => setEditData({ ...editData, name: text })}
              placeholder="Enter name"
            />
          ) : (
            <Text style={styles.value}>{user.name}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.email}
              onChangeText={(text) =>
                setEditData({ ...editData, email: text })
              }
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.value}>{user.email}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Driver ID</Text>
          <Text style={styles.value}>{user.driver_id}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>License Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.license_number}
              onChangeText={(text) =>
                setEditData({ ...editData, license_number: text })
              }
              placeholder="Enter license number"
            />
          ) : (
            <Text style={styles.value}>
              {user.license_number || 'Not set'}
            </Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.phone}
              onChangeText={(text) =>
                setEditData({ ...editData, phone: text })
              }
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{user.phone || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status</Text>
          <Text
            style={[
              styles.value,
              styles.statusValue,
              user.status === 'active' && styles.statusActive,
            ]}
          >
            {user.status || 'active'}
          </Text>
        </View>
      </View>

      {/* Assigned Bus */}
      {user.assigned_bus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Bus</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Bus Number</Text>
            <Text style={styles.value}>
              {user.assigned_bus.bus_number || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>License Plate</Text>
            <Text style={styles.value}>
              {user.assigned_bus.license_plate || 'N/A'}
            </Text>
          </View>
        </View>
      )}

      {/* Assigned Route */}
      {user.assigned_route && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Route</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Route Name</Text>
            <Text style={styles.value}>
              {user.assigned_route.name || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Origin</Text>
            <Text style={styles.value}>
              {user.assigned_route.origin || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Destination</Text>
            <Text style={styles.value}>
              {user.assigned_route.destination || 'N/A'}
            </Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => navigation.navigate('Debug')}
          >
            <Text style={styles.debugButtonText}>🔧 Debug Screen</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setIsEditing(false);
                setEditData({
                  name: user.name || '',
                  email: user.email || '',
                  phone: user.phone || '',
                  license_number: user.license_number || '',
                });
              }}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.passwordButton]}
              onPress={() => setShowPasswordModal(true)}
            >
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Current Password"
              secureTextEntry
              value={passwordData.current_password}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, current_password: text })
              }
            />

            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              secureTextEntry
              value={passwordData.new_password}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, new_password: text })
              }
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              secureTextEntry
              value={passwordData.confirm_password}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, confirm_password: text })
              }
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                  });
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: COLORS.TEXT,
    opacity: 0.7,
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: COLORS.TEXT,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  statusValue: {
    textTransform: 'capitalize',
  },
  statusActive: {
    color: COLORS.SUCCESS,
  },
  input: {
    flex: 2,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.TEXT,
    backgroundColor: '#FAFAFA',
  },
  actions: {
    padding: 20,
  },
  button: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  passwordButton: {
    backgroundColor: COLORS.WARNING,
  },
  logoutButton: {
    backgroundColor: COLORS.ERROR,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: COLORS.TEXT,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT,
    marginBottom: 20,
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  modalCancelButton: {
    backgroundColor: '#F5F5F5',
  },
  modalSaveButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#9C27B0',
    padding: DESIGN.SPACING.M,
    borderRadius: DESIGN.RADIUS.M,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DESIGN.SPACING.S,
    minHeight: DESIGN.TOUCH_TARGETS.MIN_HEIGHT,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: DESIGN.FONTS.SIZE.M,
    fontWeight: DESIGN.FONTS.WEIGHT.BOLD,
  },
});

export default ProfileScreen;

