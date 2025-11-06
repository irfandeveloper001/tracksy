import { createClient } from '@supabase/supabase-js';

// Support both VITE_ (for Vite) and EXPO_PUBLIC_ (for consistency with student/driver apps)
// This allows sharing the same .env file or using the same values
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL ||
  import.meta.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20;

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase credentials not found or invalid. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or EXPO_PUBLIC_*) in your .env file.'
  );
  console.warn('⚠️ You can use the same Supabase project as student/driver apps by copying their .env values.');
}

// Create client with fallback to prevent errors during build
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key',
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 Supabase configured:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NOT SET',
    hasKey: !!supabaseAnonKey && supabaseAnonKey.length > 0,
    isConfigured: isSupabaseConfigured,
  });
  
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
    console.warn('⚠️ You can use the same values from student-app/.env or driver-app/.env');
  }
}

export default supabase;

