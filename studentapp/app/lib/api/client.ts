import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: '@tracksy_student:auth_token',
  USER_DATA: '@tracksy_student:user_data',
  REMEMBER_ME: '@tracksy_student:remember_me',
};

// Track if we're already redirecting to prevent multiple redirects
let isRedirecting = false;

// Secure storage utility
const secureStorage = {
  async getToken(): Promise<string | null> {
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  async clearAll(): Promise<void> {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  validateStatus: function (status) {
    return status >= 200 && status < 600;
  },
});

// Request interceptor - Add Laravel JWT token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await secureStorage.getToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (import.meta.env.DEV) {
          console.log('✅ Using Laravel JWT token for API request');
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
    // Skip processing for blob responses (PDFs, images, etc.)
    if (response.config.responseType === 'blob') {
      return response;
    }
    
    if (response.status >= 400) {
      const error: any = new Error(response.data?.message || `Request failed with status ${response.status}`);
      error.response = response;
      error.status = response.status;
      return Promise.reject(error);
    }
    
    if (response.data && !response.data.success && response.data.data === undefined) {
      response.data = {
        success: true,
        data: response.data,
      };
    }
    return response;
  },
  async (error: AxiosError) => {
    if (!navigator.onLine) {
      const offlineError = new Error('Network error. You are currently offline.');
      toast.error(offlineError.message);
      return Promise.reject(offlineError);
    }

    // Handle fee restriction (403 with OVERDUE_FEES error code)
    if (error.response?.status === 403) {
      const errorData: any = error.response.data || {};
      
      if (errorData.error_code === 'OVERDUE_FEES') {
        const feeError = new Error(errorData.message || 'You have overdue fees. Please pay your fees to continue.');
        
        if (typeof window !== 'undefined' && !isRedirecting) {
          const currentPath = window.location.pathname;
          const isFeesPage = currentPath === '/fees' || currentPath.startsWith('/fees');
          
          if (!isFeesPage) {
            isRedirecting = true;
            toast.error(feeError.message, {
              duration: 5000,
              icon: '⚠️',
            });
            
            setTimeout(() => {
              if (window.location.pathname !== '/fees') {
                window.location.href = '/fees';
              }
              setTimeout(() => {
                isRedirecting = false;
              }, 1000);
            }, 2000);
          }
        }
        
        return Promise.reject(feeError);
      }
    }

    if (error.response?.status === 401) {
      const errorData: any = error.response.data || {};
      const errorMessage: string = errorData.message || 'Authentication required. Please log in again.';
      
      try {
        await secureStorage.removeToken();
        await secureStorage.clearAll();
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      } catch (clearError) {
        console.warn('⚠️ Failed to clear storage on 401:', clearError);
      }
      
      const authError = new Error(errorMessage);
      
      if (typeof window !== 'undefined' && !isRedirecting) {
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath === '/login' || currentPath.startsWith('/login');
        
        if (!isLoginPage) {
          isRedirecting = true;
          toast.error(authError.message);
          
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            setTimeout(() => {
              isRedirecting = false;
            }, 1000);
          }, 2000);
        }
      }
      
      return Promise.reject(authError);
    }
    
    if (error.response?.status === 500) {
      const serverError = new Error('Server error. Please try again later.');
      toast.error(serverError.message);
      return Promise.reject(serverError);
    }
    
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

    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_FAILED' || (!error.response && error.request)) {
      const networkError = new Error(`Cannot connect to backend API at ${API_BASE_URL}. Please ensure Laravel backend is running.`);
      toast.error(networkError.message);
      return Promise.reject(networkError);
    }
    
    const config: any = error.config || {};
    const shouldSuppressToast = config.skipErrorToast;
    
    if (error.config && !shouldSuppressToast && error.response?.data?.message) {
      toast.error(error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

export { API_BASE_URL, STORAGE_KEYS, secureStorage };
export default api;

