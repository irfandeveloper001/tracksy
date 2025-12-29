import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../src/store/store";
import { getCurrentUser, updateProfile, changePassword } from "../../src/store/slices/authSlice";
import Header from "../../src/components/layouts/Header";
import Sidebar from "../../src/components/layouts/Sidebar";
import {
  UserIcon,
  TruckIcon,
  MapPinIcon,
  IdentificationIcon,
  PhoneIcon,
  EnvelopeIcon,
  KeyIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    loadProfileData();
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

  const loadProfileData = async () => {
    try {
      await dispatch(getCurrentUser());
    } catch (error) {
      console.warn('⚠️ Error loading profile data:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await dispatch(updateProfile(editData)).unwrap();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
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
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to change password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 w-full min-w-0">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    My Profile
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Manage your driver profile and account settings
                  </p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : user ? (
                <>
                  {/* Profile Information */}
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <div className="flex items-center space-x-3">
                              <UserIcon className="h-5 w-5 text-gray-400" />
                              <p className="text-base text-gray-900">{user.name}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          ) : (
                            <div className="flex items-center space-x-3">
                              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                              <p className="text-base text-gray-900">{user.email}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Driver ID
                          </label>
                          <div className="flex items-center space-x-3">
                            <IdentificationIcon className="h-5 w-5 text-gray-400" />
                            <p className="text-base text-gray-900">{user.driver_id}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            License Number
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editData.license_number}
                              onChange={(e) => setEditData({ ...editData, license_number: e.target.value })}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter license number"
                            />
                          ) : (
                            <div className="flex items-center space-x-3">
                              <IdentificationIcon className="h-5 w-5 text-gray-400" />
                              <p className="text-base text-gray-900">{user.license_number || 'Not set'}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editData.phone}
                              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter phone number"
                            />
                          ) : (
                            <div className="flex items-center space-x-3">
                              <PhoneIcon className="h-5 w-5 text-gray-400" />
                              <p className="text-base text-gray-900">{user.phone || 'Not set'}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Status
                          </label>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.status || 'active'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={handleUpdateProfile}
                            disabled={isLoading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setEditData({
                                name: user.name || '',
                                email: user.email || '',
                                phone: user.phone || '',
                                license_number: user.license_number || '',
                              });
                            }}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assigned Bus */}
                  {user.assigned_bus && (
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                      <div className="flex items-center space-x-3 mb-4">
                        <TruckIcon className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-xl font-bold text-gray-900">Assigned Bus</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Bus Number</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {user.assigned_bus.bus_number || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">License Plate</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {user.assigned_bus.license_plate || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Bus Type</p>
                          <p className="text-lg font-semibold text-gray-900 capitalize">
                            {user.assigned_bus.bus_type || 'Standard'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Capacity</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {user.assigned_bus.capacity || 'N/A'} seats
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assigned Route */}
                  {user.assigned_route && (
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                      <div className="flex items-center space-x-3 mb-4">
                        <MapPinIcon className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-xl font-bold text-gray-900">Assigned Route</h2>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Route Name</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {user.assigned_route.name || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Start Location</p>
                          <p className="text-base text-gray-900">
                            {user.assigned_route.start_location || user.assigned_route.start_point || user.assigned_route.origin || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">End Location</p>
                          <p className="text-base text-gray-900">
                            {user.assigned_route.end_location || user.assigned_route.end_point || user.assigned_route.destination || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Change Password */}
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <KeyIcon className="h-6 w-6 text-indigo-600" />
                          <h2 className="text-xl font-bold text-gray-900">Password</h2>
                        </div>
                        <p className="text-sm text-gray-500">Change your account password</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h3>
                  <p className="text-gray-500 mb-6">
                    Unable to load your profile. Please try refreshing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                  });
                }}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}













