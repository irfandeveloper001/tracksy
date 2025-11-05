import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Use AsyncStorage for native, localStorage for web
let storage;
if (Platform.OS === 'web') {
  // Web: Use localStorage directly
  storage = {
    getItem: async (key) => {
      try {
        return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      } catch (e) {
        return null;
      }
    },
    setItem: async (key, value) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value);
        }
      } catch (e) {
        console.warn('Failed to set item in localStorage:', e);
      }
    },
    removeItem: async (key) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('Failed to remove item from localStorage:', e);
      }
    },
  };
} else {
  // Native: Use AsyncStorage
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    storage = AsyncStorage;
  } catch (e) {
    console.warn('AsyncStorage not available, using memory storage');
    // Fallback to memory storage
    const memoryStorage = {};
    storage = {
      getItem: async (key) => memoryStorage[key] || null,
      setItem: async (key, value) => { memoryStorage[key] = value; },
      removeItem: async (key) => { delete memoryStorage[key]; },
    };
  }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials not found. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export default supabase;
