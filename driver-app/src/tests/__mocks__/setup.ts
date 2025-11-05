// Test setup and mocks
// This file configures the testing environment

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    __esModule: true,
    default: (props: any) => React.createElement(View, props),
    Marker: (props: any) => React.createElement(View, props),
    Polyline: (props: any) => React.createElement(View, props),
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock Geolocation
jest.mock('react-native-geolocation-service', () => ({
  requestAuthorization: jest.fn(() => Promise.resolve('granted')),
  getCurrentPosition: jest.fn((success) =>
    success({
      coords: {
        latitude: 37.78825,
        longitude: -122.4324,
        accuracy: 10,
        speed: 0,
        heading: 0,
      },
      timestamp: Date.now(),
    })
  ),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn(),
}));

export {};

