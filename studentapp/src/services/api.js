import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Log API base URL on initialization
console.log('🌐 API Base URL:', API_BASE_URL);

// Request interceptor - Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    // Transform backend response to match frontend expectations
    const data = response.data;
    
    // If backend returns data directly (not wrapped in success/data), wrap it
    if (data && !data.success && !data.data) {
      return {
        success: true,
        data: data,
        message: data.message || 'Success',
      };
    }
    
    return data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error details for debugging
    console.error('🚨 API Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Handle network errors (no response from server)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        console.error('⏱️ Request timeout - server took too long to respond');
        error.message = 'Request timeout. Please check your connection and try again.';
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('🌐 Network error - cannot reach server');
        error.message = 'Network Error: Cannot connect to server. Please ensure the backend is running on http://localhost:8000';
      } else {
        console.error('🔌 Connection error');
        error.message = error.message || 'Network Error: Unable to connect to server.';
      }
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          // You can implement token refresh logic here
          // For now, just clear storage and redirect to login
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_DATA,
          ]);
        }
      } catch (refreshError) {
        // Clear storage on refresh failure
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

