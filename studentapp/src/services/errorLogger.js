// Error logging service
import AsyncStorage from '@react-native-async-storage/async-storage';

const ERROR_LOG_KEY = '@tracksy_student:error_logs';
const MAX_LOG_ENTRIES = 100;

export const errorLogger = {
  // Log error with context
  async logError(error, context = {}) {
    try {
      const errorEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        error: {
          message: error?.message || String(error),
          stack: error?.stack,
          name: error?.name,
        },
        context,
        userAgent: 'React Native',
        platform: 'mobile',
      };

      // Get existing logs
      const existingLogs = await this.getErrorLogs();
      
      // Add new log
      existingLogs.unshift(errorEntry);
      
      // Keep only last MAX_LOG_ENTRIES
      const logsToKeep = existingLogs.slice(0, MAX_LOG_ENTRIES);
      
      // Save logs
      await AsyncStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logsToKeep));
      
      // Also log to console in development
      if (__DEV__) {
        console.error('Error logged:', errorEntry);
      }
      
      return errorEntry;
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  },

  // Get error logs
  async getErrorLogs() {
    try {
      const logs = await AsyncStorage.getItem(ERROR_LOG_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to get error logs:', error);
      return [];
    }
  },

  // Clear error logs
  async clearErrorLogs() {
    try {
      await AsyncStorage.removeItem(ERROR_LOG_KEY);
    } catch (error) {
      console.error('Failed to clear error logs:', error);
    }
  },

  // Send error logs to server (for production)
  async sendErrorLogsToServer() {
    try {
      const logs = await this.getErrorLogs();
      if (logs.length === 0) return;

      // TODO: Implement API call to send logs to server
      // await api.post('/errors/logs', { logs });
      
      // Clear logs after successful send
      await this.clearErrorLogs();
    } catch (error) {
      console.error('Failed to send error logs to server:', error);
    }
  },

  // Format error for user display
  formatErrorForUser(error) {
    const errorMessage = error?.message || String(error);
    
    // User-friendly error messages
    const userFriendlyMessages = {
      'Network request failed': 'No internet connection. Please check your network and try again.',
      'timeout': 'Request timed out. Please try again.',
      '401': 'Your session has expired. Please login again.',
      '403': 'You do not have permission to perform this action.',
      '404': 'The requested resource was not found.',
      '500': 'Server error. Please try again later.',
    };

    for (const [key, message] of Object.entries(userFriendlyMessages)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return message;
      }
    }

    return 'Something went wrong. Please try again.';
  },
};

// Global error handler
export const setupGlobalErrorHandler = () => {
  // Handle unhandled promise rejections
  const originalHandler = global.ErrorUtils?.getGlobalHandler();
  
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    errorLogger.logError(error, {
      isFatal,
      type: 'unhandled',
    });
    
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
};

export default errorLogger;

