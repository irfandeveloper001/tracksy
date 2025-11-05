// Test helpers and utilities

import { LocationData } from '../services/location/locationService';
import { Trip } from '../services/tripService';

// Mock location data
export const createMockLocation = (
  overrides?: Partial<LocationData>
): LocationData => ({
  latitude: 37.78825,
  longitude: -122.4324,
  accuracy: 10,
  speed: 8.33, // ~30 km/h
  heading: 90,
  timestamp: Date.now(),
  ...overrides,
});

// Mock trip data
export const createMockTrip = (overrides?: Partial<Trip>): Trip => ({
  id: 1,
  driver_id: 1,
  bus_id: 1,
  route_id: 1,
  status: 'in_progress',
  start_time: new Date().toISOString(),
  distance: 5000,
  duration: 600,
  passenger_count: 10,
  ...overrides,
});

// Mock route data
export const createMockRoute = (overrides?: any) => ({
  id: 1,
  name: 'Route 1',
  origin: 'Start Point',
  destination: 'End Point',
  distance: 10000,
  estimated_duration: 1200,
  ...overrides,
});

// Mock stop data
export const createMockStop = (overrides?: any) => ({
  id: 1,
  name: 'Stop 1',
  address: '123 Main St',
  latitude: 37.78825,
  longitude: -122.4324,
  order: 1,
  ...overrides,
});

// Wait for async operations
export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Mock API response
export const createMockApiResponse = (data: any, success: boolean = true) => ({
  data: {
    success,
    data,
    message: success ? 'Success' : 'Error',
  },
});

// Mock error response
export const createMockErrorResponse = (message: string, status: number = 400) => ({
  response: {
    status,
    data: {
      success: false,
      message,
      error: message,
    },
  },
});

