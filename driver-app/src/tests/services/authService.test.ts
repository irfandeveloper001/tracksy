// Example unit test for authService
// Note: Requires Jest and React Native Testing Library

import authService from '../../services/authService';
import api from '../../services/api/api';

jest.mock('../../services/api/api');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: 'test-token',
            user: {
              id: 1,
              name: 'Test Driver',
              email: 'test@example.com',
            },
          },
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password');

      expect(result.token).toBe('test-token');
      expect(result.user.email).toBe('test@example.com');
      expect(api.post).toHaveBeenCalledWith('/driver/login', {
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should throw error with invalid credentials', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(mockError);

      await expect(
        authService.login('test@example.com', 'wrong')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 1,
            name: 'Test Driver',
            email: 'test@example.com',
          },
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const user = await authService.getCurrentUser();

      expect(user.id).toBe(1);
      expect(user.email).toBe('test@example.com');
    });
  });
});

