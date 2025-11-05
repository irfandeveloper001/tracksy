import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';
import { supabase } from '../../config/supabase';
import inputSanitizer from '../../utils/inputSanitizer';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Reduced timeout to 5 seconds - fail fast
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get token from Supabase session instead of secureStorage
    try {
      // Add timeout to prevent hanging
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve(null), 1000) // 1 second timeout
      );
      
      const result = await Promise.race([sessionPromise, timeoutPromise]);
      if (result && typeof result === 'object' && 'data' in result) {
        const { data: { session } } = result as any;
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to get Supabase session for API request:', error);
      // Continue without token - some APIs might work without auth
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
            // Handle unauthorized - sign out from Supabase
            try {
              await supabase.auth.signOut();
              await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            } catch (signOutError) {
              console.warn('⚠️ Failed to sign out from Supabase:', signOutError);
            }
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

