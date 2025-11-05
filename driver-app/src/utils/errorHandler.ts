import logger from '../services/logger';
import { Alert } from 'react-native';

// Centralized error handling utility

export interface AppError {
  code?: string;
  message: string;
  context?: any;
}

class ErrorHandler {
  // Handle API errors
  handleApiError(error: any, context?: string): AppError {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    const appError: AppError = {
      code: error.response?.status?.toString() || 'UNKNOWN',
      message: errorMessage,
      context: {
        url: error.config?.url,
        method: error.config?.method,
        originalContext: context,
      },
    };

    logger.logApiError(
      error.config?.method || 'UNKNOWN',
      error.config?.url || 'UNKNOWN',
      appError
    );

    return appError;
  }

  // Handle network errors
  handleNetworkError(error: any): AppError {
    const appError: AppError = {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed. Please check your internet connection.',
      context: error,
    };

    logger.error('Network error', error);
    return appError;
  }

  // Handle location errors
  handleLocationError(error: any): AppError {
    const appError: AppError = {
      code: 'LOCATION_ERROR',
      message: 'Failed to get location. Please check location permissions.',
      context: error,
    };

    logger.error('Location error', error);
    return appError;
  }

  // Handle validation errors
  handleValidationError(errors: any): AppError {
    const errorMessage =
      typeof errors === 'string'
        ? errors
        : Object.values(errors).join(', ') || 'Validation failed';

    const appError: AppError = {
      code: 'VALIDATION_ERROR',
      message: errorMessage,
      context: errors,
    };

    logger.warn('Validation error', errors);
    return appError;
  }

  // Show user-friendly error message
  showError(error: AppError, title: string = 'Error'): void {
    Alert.alert(title, error.message, [{ text: 'OK' }]);
  }

  // Show error with retry option
  showErrorWithRetry(
    error: AppError,
    onRetry: () => void,
    title: string = 'Error'
  ): void {
    Alert.alert(title, error.message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Retry', onPress: onRetry },
    ]);
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: AppError): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again.';
      case 'LOCATION_ERROR':
        return 'Please enable location permissions in settings.';
      case 'VALIDATION_ERROR':
        return error.message;
      case '401':
        return 'Your session has expired. Please log in again.';
      case '403':
        return 'You do not have permission to perform this action.';
      case '404':
        return 'The requested resource was not found.';
      case '500':
        return 'A server error occurred. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
}

export default new ErrorHandler();

