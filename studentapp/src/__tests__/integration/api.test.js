/**
 * Integration tests for API services
 * These tests require a running backend server or mocked API
 */

import { authService } from '../../services/authService';
import { bookingService } from '../../services/bookingService';
import api from '../../services/api';

// Mock API module
jest.mock('../../services/api');

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication API', () => {
    it('should handle login flow', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'test-token',
          refreshToken: 'refresh-token',
          user: { id: 1, email: 'test@example.com' },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password');

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Booking API', () => {
    it('should fetch user bookings', async () => {
      const mockBookings = [
        { id: 1, bus_id: 1, seat_number: 'A1', status: 'confirmed' },
        { id: 2, bus_id: 2, seat_number: 'B2', status: 'completed' },
      ];

      api.get.mockResolvedValue({
        success: true,
        data: mockBookings,
      });

      const result = await bookingService.getUserBookings();

      expect(api.get).toHaveBeenCalledWith('/bookings');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBookings);
    });

    it('should create a booking', async () => {
      const bookingData = {
        bus_id: 1,
        seat_number: 'A1',
        trip_date: '2024-01-15',
      };

      const mockResponse = {
        success: true,
        data: { id: 1, ...bookingData, status: 'confirmed' },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await bookingService.createBooking(bookingData);

      expect(api.post).toHaveBeenCalledWith('/bookings', bookingData);
      expect(result.success).toBe(true);
    });
  });
});

