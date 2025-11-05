import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Linking, Platform, View, ActivityIndicator, Text } from 'react-native';
import { store } from './store/store';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { supabase } from './config/supabase';
import supabaseAuthService from './services/supabaseAuthService';
import { setUser, setAuthenticated } from './store/slices/authSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store/store';

const AppContent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isReady, setIsReady] = useState(false);

  // Monitor network status
  useNetworkStatus();

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('⚠️ App initialization timeout - forcing ready state');
      setIsReady(true);
    }, 5000); // 5 second timeout

    initializeApp().finally(() => {
      clearTimeout(timeout);
    });

    return () => clearTimeout(timeout);
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing app...');
      
      // Check for existing session
      try {
        const session = await supabaseAuthService.getCurrentSession();
        console.log('📦 Session check:', session ? 'Found' : 'None');
        if (session?.user) {
          const user = await supabaseAuthService.getCurrentUser();
          if (user) {
            console.log('✅ User found:', user.email);
            dispatch(setUser(user));
            dispatch(setAuthenticated(true));
          }
        }
      } catch (sessionError) {
        console.warn('⚠️ Session check error (non-critical):', sessionError);
      }

      // Set up auth state listener
      try {
        supabaseAuthService.onAuthStateChange((event, session, user) => {
          console.log('🔔 Auth state changed:', event);
          if (event === 'SIGNED_IN' && user) {
            dispatch(setUser(user));
            dispatch(setAuthenticated(true));
          } else if (event === 'SIGNED_OUT') {
            dispatch(setUser(null));
            dispatch(setAuthenticated(false));
          }
        });
      } catch (listenerError) {
        console.warn('⚠️ Auth listener error (non-critical):', listenerError);
      }

      // Handle deep linking for email verification
      if (Platform.OS === 'web') {
        // For web, check URL hash for email verification
        if (typeof window !== 'undefined') {
          const url = window.location.href;
          if (url.includes('email-verified') || url.includes('access_token') || url.includes('token_hash')) {
            console.log('🔗 Detected email verification link in URL');
            handleDeepLink(url);
          }
        }
      } else {
        // For native platforms
        try {
          const url = await Linking.getInitialURL();
          if (url) {
            handleDeepLink(url);
          }

          Linking.addEventListener('url', ({ url }) => {
            handleDeepLink(url);
          });
        } catch (linkError) {
          console.warn('⚠️ Deep linking error (non-critical):', linkError);
        }
      }

      console.log('✅ App initialization complete');
      setIsReady(true);
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      // Always set ready even on error to prevent infinite loading
      setIsReady(true);
    }
  };

  const handleDeepLink = async (url) => {
    console.log('🔗 Handling deep link:', url);
    
    // Check for error in URL (expired link, etc.)
    if (url.includes('error=') || url.includes('error_code=')) {
      console.warn('⚠️ Email verification error detected in URL');
      // Clear error from URL immediately
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/');
      }
      // Don't try to process - let user login normally
      return;
    }
    
    // Check for Supabase email verification tokens
    if (url.includes('access_token=') || url.includes('token_hash=') || url.includes('email-verified')) {
      try {
        console.log('✅ Processing email verification...');
        const { user, session } = await supabaseAuthService.verifyEmailFromURL(url);
        if (user && session) {
          console.log('✅ Email verified successfully, user:', user.email);
          dispatch(setUser(user));
          dispatch(setAuthenticated(true));
          
          // Clear URL hash after processing (for web)
          if (Platform.OS === 'web' && typeof window !== 'undefined') {
            window.history.replaceState(null, '', '/');
          }
        }
      } catch (error) {
        console.error('❌ Error handling deep link:', error);
        // Clear error URL
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/');
        }
        // Don't show error to user - let them login normally
      }
    }
  };

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading Tracksy Driver...</Text>
      </View>
    );
  }

  return <AppNavigator />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <StatusBar style="auto" />
        <AppContent />
      </Provider>
    </ErrorBoundary>
  );
};

export default App;

