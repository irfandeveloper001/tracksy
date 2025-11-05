// Design System Constants for Driver App
// Optimized for driving with large, readable fonts and high contrast

export const DESIGN = {
  // Typography - Large, readable fonts for drivers
  FONTS: {
    SIZE: {
      XXL: 32, // Very large for important information
      XL: 24, // Large for headings
      L: 20, // Large for important text
      M: 16, // Medium for body text
      S: 14, // Small for secondary text
      XS: 12, // Extra small for labels
    },
    WEIGHT: {
      BOLD: 'bold' as const,
      SEMIBOLD: '600' as const,
      MEDIUM: '500' as const,
      REGULAR: '400' as const,
    },
    LINE_HEIGHT: {
      XXL: 40,
      XL: 32,
      L: 28,
      M: 24,
      S: 20,
      XS: 16,
    },
  },

  // Colors - High contrast, driver-friendly
  COLORS: {
    PRIMARY: '#1976D2', // Deeper blue for better contrast
    SECONDARY: '#424242',
    SUCCESS: '#388E3C', // Darker green for better visibility
    WARNING: '#F57C00', // Darker orange for better visibility
    ERROR: '#D32F2F', // Darker red for better visibility
    INFO: '#0288D1',
    
    BACKGROUND: '#FFFFFF',
    SURFACE: '#F5F5F5',
    TEXT: '#212121',
    TEXT_SECONDARY: '#757575',
    TEXT_DISABLED: '#BDBDBD',
    
    DIVIDER: '#E0E0E0',
    BORDER: '#BDBDBD',
    
    // High contrast combinations
    PRIMARY_DARK: '#1565C0',
    PRIMARY_LIGHT: '#BBDEFB',
    SUCCESS_DARK: '#2E7D32',
    WARNING_DARK: '#E65100',
    ERROR_DARK: '#C62828',
  },

  // Spacing - Generous spacing for large touch targets
  SPACING: {
    XS: 4,
    S: 8,
    M: 16,
    L: 24,
    XL: 32,
    XXL: 48,
  },

  // Touch Targets - Large for one-handed use
  TOUCH_TARGETS: {
    MIN_HEIGHT: 56, // Minimum height for buttons (Material Design)
    MIN_WIDTH: 56,
    LARGE_HEIGHT: 64, // Large buttons for important actions
    LARGE_WIDTH: 64,
    ICON_SIZE: 32, // Large icons
    ICON_SIZE_LARGE: 48,
  },

  // Border Radius
  RADIUS: {
    S: 4,
    M: 8,
    L: 12,
    XL: 16,
    ROUND: 9999,
  },

  // Shadows - Subtle but visible
  SHADOWS: {
    SMALL: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 2,
      elevation: 2,
    },
    MEDIUM: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 4,
      elevation: 4,
    },
    LARGE: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },

  // Animation Durations
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
};

export default DESIGN;

