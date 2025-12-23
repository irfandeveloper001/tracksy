import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../constants';
import { STORAGE_KEYS } from '../../constants';
import secureStorage from '../../utils/secureStorage';
import inputSanitizer from '../../utils/inputSanitizer';
import toast from 'react-hot-toast';

// Track if we're already redirecting to prevent multiple redirects
let isRedirecting = false;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  validateStatus: function (status) {
    // Don't throw errors for 4xx and 5xx, let us handle them
    return status >= 200 && status < 600;
  },
});

// Request interceptor - Add Laravel JWT token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get Laravel JWT token from secure storage
      const token = await secureStorage.getToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
    
    // Sanitize request data
    if (config.data && typeof config.data === 'object') {
      config.data = inputSanitizer.sanitizeObject(config.data);
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
      const offlineError = new Error('Network error. You are currently offline.');
      toast.error(offlineError.message);
      return Promise.reject(offlineError);
    }

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      const errorData: any = error.response.data || {};
      const errorMessage: string = errorData.message || 'Authentication required. Please log in again.';
      const errorType: string = errorData.error || 'unauthorized';
      
      // Clear invalid tokens
      try {
        await secureStorage.removeToken();
        await secureStorage.clearAll();
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      } catch (clearError) {
        console.warn('⚠️ Failed to clear storage on 401:', clearError);
      }
      
      // Show specific error message (only once)
      let authError: Error;
      if (errorType === 'token_expired' || errorType === 'token_invalid' || errorType === 'token_error') {
        authError = new Error('Your session has expired. Please log in again.');
      } else if (errorType === 'missing_token') {
        authError = new Error('Please log in to continue.');
      } else {
        authError = new Error(errorMessage);
      }
      
      // Only show toast and redirect if not already redirecting and not on login page
      if (typeof window !== 'undefined' && !isRedirecting) {
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath === '/login' || currentPath.startsWith('/login');
        
        if (!isLoginPage) {
          isRedirecting = true;
          toast.error(authError.message);
          
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
      toast.error(serverError.message);
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

    // Handle network errors - show helpful message
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_FAILED' || (!error.response && error.request)) {
      // Check if it's a CORS error
      const errorMsg: string = (error as any).message || '';
      if (errorMsg.includes('CORS') || errorMsg.includes('Access-Control')) {
        const corsError = new Error('CORS error: Backend may not be running or CORS not configured. Please ensure Laravel backend is running on http://localhost:8000');
        toast.error(corsError.message);
        return Promise.reject(corsError);
      }
      
      // Network error - backend not reachable
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const networkError = new Error(`Cannot connect to backend API at ${apiUrl}. Please ensure Laravel backend is running.`);
      toast.error(networkError.message);
      return Promise.reject(networkError);
    }
    
    // Show toast for other errors (unless explicitly suppressed)
    const config: any = error.config || {};
    const shouldSuppressToast = config.skipErrorToast;
    
    if (error.config && !shouldSuppressToast && error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
