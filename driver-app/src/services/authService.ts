import api from './api/api';
import { STORAGE_KEYS } from '../constants';
import secureStorage from '../utils/secureStorage';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface DriverUser {
  id: number;
  name: string;
  email: string;
  role: string;
  driver_id: string;
  assigned_bus?: any;
  assigned_route?: any;
  license_number?: string;
  phone?: string;
  status?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: DriverUser;
}

class AuthService {
  // Login driver
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/driver/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data.data || response.data;
      const { token, refreshToken, user } = data;

      // Store token securely
      await secureStorage.setToken(token);

      // Store user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      // Store remember me preference
      if (credentials.rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      }

      return { token, refreshToken, user };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  }

  // Logout driver
  async logout(): Promise<void> {
    try {
      await api.post('/driver/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage (secure and regular)
      await secureStorage.removeToken();
      await secureStorage.clearAll();
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    }
  }

  // Signup driver
  async signup(signupData: {
    name: string;
    email: string;
    password: string;
    driver_id: string;
    phone?: string;
    license_number?: string;
  }): Promise<AuthResponse> {
    try {
      // Use the public driver signup endpoint
      const response = await api.post('/driver/signup', {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        driver_id: signupData.driver_id,
        phone: signupData.phone || null,
        license_number: signupData.license_number || null,
      });

      const data = response.data.data || response.data;
      
      // After signup, automatically login
      const loginResponse = await this.login({
        email: signupData.email,
        password: signupData.password,
      });

      return loginResponse;
    } catch (error: any) {
      // Parse Laravel validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0] as string[];
        const errorMessage = firstError?.[0] || 'Validation failed';
        throw new Error(errorMessage);
      }
      
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Signup failed. Please check your information.';
      throw new Error(errorMessage);
    }
  }

  // Get current user
  async getCurrentUser(): Promise<DriverUser | null> {
    try {
      // Try to get from API first
      const response = await api.get('/driver/me');
      const user = response.data.data || response.data;
      
      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      
      // Fallback to stored user data
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        return storedUser ? JSON.parse(storedUser) : null;
      } catch {
        return null;
      }
    }
  }

  // Refresh token
  async refreshToken(): Promise<string> {
    try {
      const response = await api.post('/driver/refresh-token');
      const { token } = response.data.data || response.data;
      
      await secureStorage.setToken(token);
      
      return token;
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  // Check if user is logged in
  async isAuthenticated(): Promise<boolean> {
    const token = await secureStorage.getToken();
    return !!token;
  }

  // Get stored token
  async getToken(): Promise<string | null> {
    return await secureStorage.getToken();
  }

  // Get stored user
  async getStoredUser(): Promise<DriverUser | null> {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }

  // Update profile
  async updateProfile(profileData: {
    name?: string;
    email?: string;
    phone?: string;
    license_number?: string;
  }): Promise<DriverUser> {
    try {
      const response = await api.put('/driver/profile', profileData);
      const user = response.data.data || response.data;
      
      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update profile';
      throw new Error(errorMessage);
    }
  }

  // Change password
  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> {
    try {
      await api.post('/driver/change-password', passwordData);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to change password';
      throw new Error(errorMessage);
    }
  }
}

export default new AuthService();

