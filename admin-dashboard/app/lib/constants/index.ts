// API Configuration
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';
export const WS_URL = process.env.WS_URL || 'http://localhost:8000';

// App Constants
export const APP_NAME = 'Tracksy Admin';
export const APP_VERSION = '1.0.0';

// Colors
export const COLORS = {
  PRIMARY: '#1E40AF',
  SECONDARY: '#059669',
  WARNING: '#D97706',
  ERROR: '#DC2626',
  INFO: '#0284C7',
  BACKGROUND: '#F9FAFB',
  TEXT: '#111827',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'tracksy_admin:auth_token',
  USER_DATA: 'tracksy_admin:user_data',
};

