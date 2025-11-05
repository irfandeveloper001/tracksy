import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';
import secureStorage from '../../utils/secureStorage';
import inputSanitizer from '../../utils/inputSanitizer';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Normalize backend responses - wrap direct data in success structure if needed
    if (response.data && !response.data.success && response.data.data === undefined) {
      // Backend returned data directly, wrap it
      response.data = {
        success: true,
        data: response.data,
      };
    }
    return response;
  },
        async (error) => {
          if (error.response?.status === 401) {
            // Handle unauthorized - clear secure token and redirect to login
            await secureStorage.removeToken();
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
          }
    
    // Normalize error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.message || errorData.error) {
        error.response.data = {
          success: false,
          message: errorData.message || errorData.error,
          error: errorData.error || errorData.message,
        };
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

