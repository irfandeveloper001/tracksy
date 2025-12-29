// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// App Constants
export const APP_NAME = 'Tracksy Driver';
export const APP_VERSION = '1.0.0';

// Colors (Legacy - use DESIGN.COLORS for new components)
export const COLORS = {
  PRIMARY: '#1976D2', // Updated for better contrast
  SUCCESS: '#388E3C', // Updated for better contrast
  WARNING: '#F57C00', // Updated for better contrast
  ERROR: '#D32F2F', // Updated for better contrast
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
  ACCURACY_THRESHOLD: 50, // meters - only accept locations with accuracy < 50m
  MIN_UPDATE_INTERVAL: 10000, // 10 seconds (when moving fast)
  MAX_UPDATE_INTERVAL: 30000, // 30 seconds (when stationary)
};

// WebSocket Configuration
export const WS_BASE_URL = process.env.WS_BASE_URL || 'http://localhost:8000';

