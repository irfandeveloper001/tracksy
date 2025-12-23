import { authService } from '../../services/authService';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';

jest.mock('../../services/api');
jest.mock('@react-native-async-storage/async-storage');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'test-token',
          refreshToken: 'refresh-token',
          user: { id: 1, name: 'Test User', email: 'test@example.com' },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.data.token).toBe('test-token');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN, 'test-token');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN, 'refresh-token');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(mockResponse.data.user)
      );
    });

    it('should handle login failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials',
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should handle API errors', async () => {
      api.post.mockRejectedValue(new Error('Network error'));

      const result = await authService.login('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockUserData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        student_id: 'STU-123',
      };

      const mockResponse = {
        success: true,
        data: {
          token: 'test-token',
          refreshToken: 'refresh-token',
          user: { id: 1, ...mockUserData },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.register(mockUserData);

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear all stored data', async () => {
      await authService.logout();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    });
  });

  describe('getStoredAuth', () => {
    it('should retrieve stored auth data', async () => {
      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === STORAGE_KEYS.AUTH_TOKEN) return Promise.resolve('test-token');
        if (key === STORAGE_KEYS.USER_DATA) return Promise.resolve(JSON.stringify({ id: 1, name: 'Test' }));
        return Promise.resolve(null);
      });

      const result = await authService.getStoredAuth();

      expect(result.token).toBe('test-token');
      expect(result.user).toEqual({ id: 1, name: 'Test' });
    });

    it('should return null if no data stored', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await authService.getStoredAuth();

      expect(result).toBe(null);
    });
  });
});

