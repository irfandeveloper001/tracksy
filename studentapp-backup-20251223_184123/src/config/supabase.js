import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase Configuration
// Get these from your Supabase project settings: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Check if Supabase is properly configured
const isSupabaseConfigured = 
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' && 
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_ANON_KEY.length > 20;

// Create Supabase client with AsyncStorage for session persistence
// Use dummy values if not configured to prevent errors
export const supabase = createClient(
  isSupabaseConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Log configuration (remove in production)
if (__DEV__) {
  console.log('🔧 Supabase configured:', {
    url: SUPABASE_URL,
    hasKey: !!SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY',
    isConfigured: isSupabaseConfigured,
  });
  
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured! Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env file');
  }
}

export default supabase;

