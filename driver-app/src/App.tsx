import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Linking, Platform } from 'react-native';
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
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check for existing session
      const session = await supabaseAuthService.getCurrentSession();
      if (session?.user) {
        const user = await supabaseAuthService.getCurrentUser();
        if (user) {
          dispatch(setUser(user));
          dispatch(setAuthenticated(true));
        }
      }

      // Set up auth state listener
      supabaseAuthService.onAuthStateChange((event, session, user) => {
        if (event === 'SIGNED_IN' && user) {
          dispatch(setUser(user));
          dispatch(setAuthenticated(true));
        } else if (event === 'SIGNED_OUT') {
          dispatch(setUser(null));
          dispatch(setAuthenticated(false));
        }
      });

      // Handle deep linking for email verification
      if (Platform.OS !== 'web') {
        const url = await Linking.getInitialURL();
        if (url) {
          handleDeepLink(url);
        }

        Linking.addEventListener('url', ({ url }) => {
          handleDeepLink(url);
        });
      }

      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsReady(true);
    }
  };

  const handleDeepLink = async (url) => {
    if (url.includes('token_hash=')) {
      try {
        const { user, session } = await supabaseAuthService.verifyEmailFromURL(url);
        if (user && session) {
          dispatch(setUser(user));
          dispatch(setAuthenticated(true));
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    }
  };

  if (!isReady) {
    return null; // Or a loading screen
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

