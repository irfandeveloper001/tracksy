// API Configuration
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';

// App Constants
export const APP_NAME = 'Tracksy Driver';
export const APP_VERSION = '1.0.0';

// Colors
export const COLORS = {
  PRIMARY: '#2196F3',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  BACKGROUND: '#FFFFFF',
  TEXT: '#212121',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@tracksy_driver:auth_token',
  USER_DATA: '@tracksy_driver:user_data',
  REMEMBER_ME: '@tracksy_driver:remember_me',
};

// Location Configuration
export const LOCATION_CONFIG = {
  ACCURACY: 'high' as const,
  DISTANCE_FILTER: 10, // meters
  UPDATE_INTERVAL: 30000, // 30 seconds
  FASTEST_INTERVAL: 10000, // 10 seconds
};

