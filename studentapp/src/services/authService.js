import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

export const authService = {
  // Login
  async login(email, password) {
    try {
      console.log('🔐 Logging in user:', email);
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      console.log('✅ Login API response:', response);

      // Handle both response formats
      // Backend returns: { token, user } directly
      // Interceptor wraps it: { success: true, data: { token, user } }
      const responseData = response.data || response;
      const token = responseData.token;
      const refreshToken = responseData.refreshToken || responseData.token; // Use token as refresh if not provided
      const user = responseData.user;

      if (token && user) {
        // Store tokens
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        if (refreshToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

        console.log('✅ User logged in and tokens stored');
        return { success: true, data: { token, user } };
      }

      console.warn('⚠️ Login response missing token or user:', response);
      return { success: false, error: response.message || 'Login failed - invalid response' };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
        return { 
          success: false, 
          error: 'Network Error: Unable to connect to server. Please check if the backend is running on http://localhost:8000' 
        };
      }
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Login failed';
      
      return { success: false, error: errorMessage };
    }
  },

  // Register
  async register(userData) {
    try {
      console.log('🔐 Registering user with data:', { ...userData, password: '***' });
      const response = await api.post('/auth/register', userData);
      console.log('✅ Registration API response:', response);

      // Handle both response formats
      // Backend returns: { token, user } directly
      // Interceptor wraps it: { success: true, data: { token, user } }
      const responseData = response.data || response;
      const token = responseData.token;
      const refreshToken = responseData.refreshToken || responseData.token; // Use token as refresh if not provided
      const user = responseData.user;

      if (token && user) {
        // Store tokens
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        if (refreshToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

        console.log('✅ User registered and tokens stored');
        return { success: true, data: { token, user } };
      }

      console.warn('⚠️ Registration response missing token or user:', response);
      return { success: false, error: response.message || 'Registration failed - invalid response' };
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
        return { 
          success: false, 
          error: 'Network Error: Unable to connect to server. Please check if the backend is running on http://localhost:8000' 
        };
      }
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors)[0];
        return { success: false, error: Array.isArray(firstError) ? firstError[0] : firstError };
      }
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Registration failed';
      
      return { success: false, error: errorMessage };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      if (response.success && response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Failed to get user data' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get user data',
      };
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.log('Logout API error:', error);
    } finally {
      // Clear all stored data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.REMEMBER_ME,
      ]);
    }
  },

  // Forgot Password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        success: response.success || false,
        message: response.message || 'Password reset link sent to your email',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send reset link',
      };
    }
  },

  // Reset Password
  async resetPassword(token, email, password, password_confirmation) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation,
      });
      return {
        success: response.success || false,
        message: response.message || 'Password reset successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Password reset failed',
      };
    }
  },

  // Update Profile
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/me', userData);
      if (response.success && response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message || 'Profile update failed' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Profile update failed',
      };
    }
  },

  // Check if user is logged in
  async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return !!(token && userData);
    } catch (error) {
      return false;
    }
  },

  // Get stored user data
  async getStoredUser() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },
};

