import api, { secureStorage, STORAGE_KEYS } from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  student_id?: string;
  institution?: string;
  role: string;
  phone?: string;
  status?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

class AuthService {
  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const data = response.data.data || response.data;
      
      if (data.token) {
        await secureStorage.setToken(data.token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed';
      throw new Error(errorMessage);
    }
  }

  // Register
  async register(
    name: string,
    email: string,
    password: string,
    studentId: string,
    institution?: string
  ): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation: password,
        student_id: studentId,
        institution: institution || '',
        role: 'student',
      });

      const data = response.data.data || response.data;
      
      if (data.token) {
        await secureStorage.setToken(data.token);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      }

      return data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration failed';
      throw new Error(errorMessage);
    }
  }

  // Get current user
  async me(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data || response.data;
      
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to get user';
      throw new Error(errorMessage);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await secureStorage.removeToken();
      await secureStorage.clearAll();
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    }
  }

  // Update profile
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await api.put('/auth/profile', data);
      const user = response.data.data || response.data;
      
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
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to change password';
      throw new Error(errorMessage);
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to send reset email';
      throw new Error(errorMessage);
    }
  }

  // Get stored user
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Check if authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await secureStorage.getToken();
    return !!token;
  }
}

export default new AuthService();

