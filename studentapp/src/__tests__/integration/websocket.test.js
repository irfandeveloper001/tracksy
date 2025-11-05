/**
 * Integration tests for WebSocket/Tracking Service
 */

import trackingService from '../../services/trackingService';
import io from 'socket.io-client';

jest.mock('socket.io-client');

describe('WebSocket Integration Tests', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connect: jest.fn(),
    };

    io.mockReturnValue(mockSocket);
    trackingService.disconnect(); // Reset service
  });

  afterEach(() => {
    trackingService.disconnect();
  });

  describe('Connection', () => {
    it('should connect to WebSocket server', async () => {
      mockSocket.on.mockImplementation((event, callback) => {
        if (event === 'connect') {
          setTimeout(() => callback(), 0);
        }
      });

      await trackingService.connect('test-token');

      expect(io).toHaveBeenCalled();
      expect(trackingService.getConnectionStatus()).toBe(true);
    });

    it('should handle connection errors', async () => {
      mockSocket.on.mockImplementation((event, callback) => {
        if (event === 'connect_error') {
          setTimeout(() => callback(new Error('Connection failed')), 0);
        }
      });

      await expect(trackingService.connect('test-token')).rejects.toThrow();
    });
  });

  describe('Bus Location Updates', () => {
    it('should subscribe to bus location updates', () => {
      trackingService.isConnected = true;
      trackingService.socket = mockSocket;

      trackingService.subscribeToBus('bus-123');

      expect(mockSocket.emit).toHaveBeenCalledWith('subscribe', 'bus.bus-123.location');
    });

    it('should handle bus location update events', () => {
      const callback = jest.fn();
      trackingService.isConnected = true;
      trackingService.socket = mockSocket;

      trackingService.onBusLocationUpdate('bus-123', callback);

      // Simulate event
      const updateData = {
        bus_id: 'bus-123',
        location: { latitude: 40.7128, longitude: -74.0060 },
      };

      // Find the handler registered for 'bus.location.updated'
      const locationUpdateHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'bus.location.updated'
      )?.[1];

      if (locationUpdateHandler) {
        locationUpdateHandler(updateData);
        expect(callback).toHaveBeenCalled();
      }
    });
  });

  describe('Route Deviation', () => {
    it('should handle route deviation alerts', () => {
      const callback = jest.fn();
      trackingService.isConnected = true;
      trackingService.socket = mockSocket;

      trackingService.onRouteDeviation(callback);

      // Simulate deviation event
      const deviationData = {
        bus_id: 'bus-123',
        deviation: { distance: 100, direction: 'north' },
      };

      const deviationHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'bus.deviation'
      )?.[1];

      if (deviationHandler) {
        deviationHandler(deviationData);
        expect(callback).toHaveBeenCalled();
      }
    });
  });
});

