// App Configuration
export const APP_VERSION = '1.0.0';

// API Configuration
// For physical device testing, replace 'localhost' with your computer's IP address
// Example: 'http://192.168.1.100:8000/api'
// To find your IP: Run 'ipconfig' on Windows or 'ifconfig' on Linux/Mac
const LOCAL_IP = '172.22.134.11'; // Your computer's IP address (for physical device testing)

// For testing on physical device, use local IP
// For production, change this to false and use production URL
const USE_LOCAL_BACKEND = true; // Set to false for production

export const API_BASE_URL = USE_LOCAL_BACKEND
  ? `http://${LOCAL_IP}:8000/api` 
  : 'https://api.tracksy.com/api';

// WebSocket Configuration
export const WS_BASE_URL = USE_LOCAL_BACKEND
  ? `http://${LOCAL_IP}:8000`
  : 'https://api.tracksy.com';

// Colors - Matching Design Guidelines
export const COLORS = {
  // Primary Colors
  PRIMARY: '#1E88E5',      // Blue - Trust, reliability
  PRIMARY_DARK: '#1565C0',  // Darker blue
  PRIMARY_LIGHT: '#64B5F6', // Lighter blue
  PRIMARY_OPACITY: '#1E88E520', // 20% opacity
  
  // Secondary Colors
  SECONDARY: '#43A047',     // Green - Success, safety
  SECONDARY_DARK: '#2E7D32',
  SECONDARY_LIGHT: '#66BB6A',
  SECONDARY_OPACITY: '#43A04720',
  
  // Status Colors
  SUCCESS: '#43A047',
  SUCCESS_LIGHT: '#66BB6A',
  SUCCESS_OPACITY: '#43A04720',
  
  WARNING: '#FB8C00',       // Orange - Alerts
  WARNING_LIGHT: '#FFB74D',
  WARNING_OPACITY: '#FB8C0020',
  
  ERROR: '#E53935',         // Red - Critical issues
  ERROR_LIGHT: '#EF5350',
  ERROR_OPACITY: '#E5393520',
  
  INFO: '#1E88E5',
  INFO_LIGHT: '#64B5F6',
  INFO_OPACITY: '#1E88E520',
  
  // Neutral Colors
  BACKGROUND: '#F5F5F5',   // Light Gray
  BACKGROUND_LIGHT: '#FAFAFA',
  BACKGROUND_DARK: '#EEEEEE',
  
  TEXT: '#212121',          // Dark Gray
  TEXT_SECONDARY: '#757575', // Medium Gray
  TEXT_LIGHT: '#9E9E9E',
  TEXT_DISABLED: '#BDBDBD',
  
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  
  BORDER: '#E0E0E0',
  BORDER_LIGHT: '#F5F5F5',
  BORDER_DARK: '#BDBDBD',
  
  // Shadows
  SHADOW: 'rgba(0, 0, 0, 0.1)',
  SHADOW_DARK: 'rgba(0, 0, 0, 0.2)',
};

// Spacing (8px grid)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography
export const FONTS = {
  REGULAR: 'System',
  MEDIUM: 'System',
  BOLD: 'System',
  SIZES: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  WEIGHTS: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  LINE_HEIGHTS: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
  },
};

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EASING: {
    EASE_OUT: 'ease-out',
    EASE_IN: 'ease-in',
    EASE_IN_OUT: 'ease-in-out',
  },
};

// Border Radius
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@tracksy_student:auth_token',
  REFRESH_TOKEN: '@tracksy_student:refresh_token',
  USER_DATA: '@tracksy_student:user_data',
  REMEMBER_ME: '@tracksy_student:remember_me',
};

// Touch Targets
export const TOUCH_TARGET_SIZE = 44;

