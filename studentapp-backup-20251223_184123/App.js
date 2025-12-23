import React from 'react';
import { Provider } from 'react-redux';
import { Platform, Linking } from 'react-native';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import supabasePushNotificationService from './src/services/supabasePushNotificationService';
import supabase from './src/config/supabase';
import supabaseAuthService from './src/services/supabaseAuthService';
import { setUser } from './src/store/slices/authSlice';

// Handle deep linking for email verification
const handleDeepLink = async (url) => {
  try {
    console.log('🔗 Handling deep link:', url);
    
    if (url.includes('email-verified') || url.includes('access_token')) {
      const result = await supabaseAuthService.verifyEmailFromURL(url);
      
      if (result.success && result.data) {
        console.log('✅ Email verified and user logged in');
        // User is now logged in via auth state change listener
        // Clear the URL hash
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        console.error('❌ Email verification failed:', result.error);
      }
    }
  } catch (error) {
    console.error('❌ Error handling deep link:', error);
  }
};

// Initialize app
const initializeApp = async () => {
  try {
    console.log('🚀 Initializing app...');
    console.log('Platform:', Platform.OS);
    
    // Only initialize push notifications on native platforms
    if (Platform.OS !== 'web') {
      try {
        await supabasePushNotificationService.initialize();
        console.log('✅ Push notifications initialized');
      } catch (error) {
        console.warn('⚠️ Push notifications initialization failed:', error.message);
        // Don't block app initialization if push notifications fail
      }
    } else {
      console.log('ℹ️ Skipping push notifications on web');
    }
    
    // Check if Supabase is configured
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
    
    if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
      console.warn('⚠️ Supabase not configured. Using placeholder credentials.');
      console.warn('⚠️ Please configure .env file with your Supabase credentials.');
      // Don't initialize Supabase auth if not configured
      return;
    }
    
    // Check for existing session
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('⚠️ Error getting session:', error.message);
        return;
      }
      
      if (session) {
        console.log('✅ Existing session found');
        // Dispatch user to store
        const user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || '',
          student_id: session.user.user_metadata?.student_id || '',
          institution: session.user.user_metadata?.institution || '',
          role: session.user.user_metadata?.role || 'student',
          email_verified: !!session.user.email_confirmed_at,
        };
        store.dispatch(setUser(user));
      }
    } catch (error) {
      console.warn('⚠️ Error checking session:', error.message);
    }
    
    // Listen to auth state changes
    try {
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔔 Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Ensure user profile exists
            await supabaseAuthService.ensureUserProfile(session.user);
            
            const user = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || '',
              student_id: session.user.user_metadata?.student_id || '',
              institution: session.user.user_metadata?.institution || '',
              role: session.user.user_metadata?.role || 'student',
              email_verified: !!session.user.email_confirmed_at,
            };
            store.dispatch(setUser(user));
            console.log('✅ User logged in:', user.email);
          }
        } else if (event === 'SIGNED_OUT') {
          store.dispatch(setUser(null));
          console.log('👋 User logged out');
        } else if (session?.user) {
          // Handle other events (like email verification)
          const user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || '',
            student_id: session.user.user_metadata?.student_id || '',
            institution: session.user.user_metadata?.institution || '',
            role: session.user.user_metadata?.role || 'student',
            email_verified: !!session.user.email_confirmed_at,
          };
          store.dispatch(setUser(user));
        } else {
          store.dispatch(setUser(null));
        }
      });
    } catch (error) {
      console.warn('⚠️ Error setting up auth listener:', error.message);
    }
    
    // Handle deep linking for email verification
    if (Platform.OS !== 'web') {
      // Handle initial URL (if app was opened via link)
      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink(url);
        }
      });

      // Handle URL when app is already running
      Linking.addEventListener('url', ({ url }) => {
        handleDeepLink(url);
      });
    } else {
      // For web, check URL hash on load
      if (typeof window !== 'undefined') {
        const handleHashChange = () => {
          const hash = window.location.hash;
          if (hash && hash.includes('access_token')) {
            const fullUrl = window.location.href;
            handleDeepLink(fullUrl);
          }
        };

        // Check on initial load
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);
      }
    }
    
    console.log('✅ App initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    // Don't crash the app - just log the error
  }
};

export default function App() {
  React.useEffect(() => {
    console.log('✅ App.js loaded');
    console.log('Platform:', Platform.OS);
    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    </ErrorBoundary>
  );
}
