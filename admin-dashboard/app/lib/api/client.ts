import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants';
import { handleApiError, showErrorToast } from '../utils/errorHandler';
import { retry } from '../utils/retry';

// Track if we're already redirecting to prevent multiple redirects
let isRedirecting = false;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds for better reliability
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  validateStatus: function (status) {
    // Don't throw errors for 4xx and 5xx, let us handle them
    return status >= 200 && status < 600;
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get JWT token from localStorage (stored by Laravel login)
    try {
      // Get Laravel JWT token (required for all API requests)
      const laravelToken = localStorage.getItem('laravel_token') || localStorage.getItem('tracksy_admin:auth_token');
      
      if (laravelToken) {
        config.headers.Authorization = `Bearer ${laravelToken}`;
        if (import.meta.env.DEV) {
          console.log('✅ Using Laravel JWT token for API request');
        }
      } else {
        // Only warn if not on login page (to reduce console noise)
        if (import.meta.env.DEV && typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const isLoginPage = currentPath === '/login' || currentPath.startsWith('/login');
          if (!isLoginPage) {
            console.warn('⚠️ No Laravel authentication token found. API request may fail with 401.');
          }
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Failed to get auth token for API request:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with error handling
api.interceptors.response.use(
  (response) => {
    // Check for error status codes
    if (response.status >= 400) {
      // Convert error response to rejected promise
      const error: any = new Error(response.data?.message || `Request failed with status ${response.status}`);
      error.response = response;
      error.status = response.status;
      return Promise.reject(error);
    }
    
    // Normalize backend responses
    if (response.data && !response.data.success && response.data.data === undefined) {
      response.data = {
        success: true,
        data: response.data,
      };
    }
    return response;
  },
  async (error: AxiosError) => {
    // Handle offline
    if (!navigator.onLine) {
      const offlineError = handleApiError({
        message: 'Network error. You are currently offline.',
        code: 'OFFLINE',
      });
      showErrorToast(offlineError);
      return Promise.reject(offlineError);
    }

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      const errorData: any = error.response.data || {};
      const errorMessage: string = errorData.message || 'Authentication required. Please log in again.';
      const errorType: string = errorData.error || 'unauthorized';
      
      // Clear invalid tokens
      localStorage.removeItem('laravel_token');
      localStorage.removeItem('tracksy_admin:auth_token');
      
      // Show specific error message (only once)
      let authError: Error;
      if (errorType === 'token_expired' || errorType === 'token_invalid' || errorType === 'token_error') {
        authError = new Error('Your session has expired. Please log in again.');
      } else if (errorType === 'missing_token' || errorMessage.toLowerCase().includes('token not provided')) {
        authError = new Error('Token not provided. Please log in again.');
      } else {
        authError = new Error(errorMessage);
      }
      
      // Only show toast and redirect if not already redirecting and not on login page
      if (typeof window !== 'undefined' && !isRedirecting) {
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath === '/login' || currentPath.startsWith('/login');
        
        if (!isLoginPage) {
          isRedirecting = true;
          showErrorToast(authError);
          
          // Redirect to login after a delay (only once)
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            // Reset redirect flag after redirect
            setTimeout(() => {
              isRedirecting = false;
            }, 1000);
          }, 2000);
        }
      }
      
      return Promise.reject(authError);
    }
    
    // Handle 500 - Server Error
    if (error.response?.status === 500) {
      const serverError = new Error('Backend server error. Please check Laravel logs and ensure database is connected.');
      showErrorToast(serverError);
      return Promise.reject(serverError);
    }
    
    // Handle 422 - Validation errors
    if (error.response?.status === 422) {
      const responseData: any = error.response.data || {};
      const validationErrors = responseData.errors;
      if (validationErrors) {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        error.message = errorMessages || responseData.message || 'Validation failed';
      }
    }

    // Handle API errors
    const apiError = handleApiError(error);
    
    // Handle network errors - show helpful message
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_FAILED' || (!error.response && error.request)) {
      // Check if it's a CORS error
      const errorMsg: string = (error as any).message || '';
      if (errorMsg.includes('CORS') || errorMsg.includes('Access-Control')) {
        const corsError = new Error('CORS error: Backend may not be running or CORS not configured. Please ensure Laravel backend is running on http://localhost:8000');
        showErrorToast(corsError);
        return Promise.reject(corsError);
      }
      
      // Network error - backend not reachable
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const networkError = new Error(`Cannot connect to backend API at ${apiUrl}. Please ensure Laravel backend is running.`);
      showErrorToast(networkError);
      return Promise.reject(networkError);
    }
    
    // Suppress error toasts for:
    // 1. When explicitly requested via skipErrorToast
    // 2. Server errors (500+) - show generic message
    const config: any = error.config || {};
    const shouldSuppressToast = config.skipErrorToast;
    
    // Show toast for all other errors
    if (error.config && !shouldSuppressToast) {
      showErrorToast(apiError);
    }

    return Promise.reject(apiError);
  }
);

// Wrapper for API calls with retry logic
export function apiCallWithRetry<T>(
  apiCall: () => Promise<T>,
  options?: { maxAttempts?: number; skipErrorToast?: boolean }
): Promise<T> {
  return retry(
    () => apiCall(),
    {
      maxAttempts: options?.maxAttempts || 3,
      delay: 1000,
      backoff: true,
      onRetry: (attempt) => {
        if (import.meta.env.DEV) {
          console.log(`Retrying API call (attempt ${attempt})...`);
        }
      },
    }
  );
}

export default api;
