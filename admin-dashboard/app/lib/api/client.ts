import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants';
import { supabase } from '../config/supabase';
import { handleApiError, showErrorToast } from '../utils/errorHandler';
import { retry } from '../utils/retry';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000, // Reduced timeout to 3 seconds for faster failure
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get token from Supabase session
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.warn('⚠️ Failed to get Supabase session for API request:', error);
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
      try {
        await supabase.auth.signOut();
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } catch (signOutError) {
        console.warn('⚠️ Failed to sign out from Supabase:', signOutError);
      }
    }

    // Handle API errors
    const apiError = handleApiError(error);
    
    // Suppress error toasts for:
    // 1. Network errors when backend is unavailable (we have Supabase fallback)
    // 2. CORS errors (backend not running or misconfigured)
    // 3. When explicitly requested via skipErrorToast
    const shouldSuppressToast = 
      error.config?.skipErrorToast ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ERR_FAILED' ||
      (error.response?.status && error.response.status >= 500) ||
      (error.message && error.message.includes('CORS'));
    
    // Only show toast for critical errors that need user attention
    if (error.config && !shouldSuppressToast) {
      // Don't show toast for offline errors if we have Supabase fallback
      if (apiError.code !== 'OFFLINE' || !navigator.onLine) {
      showErrorToast(apiError);
      }
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
