import errorLogger from '../services/errorLogger';
import toast from 'react-hot-toast';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class AppError extends Error {
  code?: string;
  status?: number;
  details?: any;
  userMessage?: string;

  constructor(
    message: string,
    code?: string,
    status?: number,
    details?: any,
    userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.userMessage = userMessage;
  }
}

export function handleError(error: unknown, component?: string): string {
  // Log error
  if (error instanceof Error) {
    errorLogger.logError(error, component);
  } else {
    errorLogger.logError(
      new Error(String(error)),
      component,
      { originalError: error }
    );
  }

  // Determine user-friendly message
  let userMessage = 'An unexpected error occurred. Please try again.';

  if (error instanceof AppError) {
    userMessage = error.userMessage || error.message;
  } else if (error instanceof Error) {
    // Handle common error types
    if (error.message.includes('network') || error.message.includes('fetch')) {
      userMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('timeout')) {
      userMessage = 'Request timed out. Please try again.';
    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
      userMessage = 'You are not authorized to perform this action.';
    } else if (error.message.includes('403') || error.message.includes('forbidden')) {
      userMessage = 'Access denied. You do not have permission.';
    } else if (error.message.includes('404')) {
      userMessage = 'The requested resource was not found.';
    } else if (error.message.includes('500') || error.message.includes('server')) {
      userMessage = 'Server error. Please try again later.';
    } else {
      userMessage = error.message;
    }
  }

  return userMessage;
}

export function showErrorToast(error: unknown, component?: string) {
  const message = handleError(error, component);
  toast.error(message);
}

export function handleApiError(error: any): AppError {
  if (error.response) {
    // API error response
    const status = error.response.status;
    const data = error.response.data;
    const message = data?.message || data?.error || error.message || 'API request failed';
    const code = data?.code || `HTTP_${status}`;

    return new AppError(
      message,
      code,
      status,
      data,
      data?.user_message || message
    );
  } else if (error.request) {
    // Network error
    return new AppError(
      'Network error. Please check your connection.',
      'NETWORK_ERROR',
      0,
      error.request,
      'Unable to connect to the server. Please check your internet connection.'
    );
  } else {
    // Other error
    return new AppError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      undefined,
      error
    );
  }
}

