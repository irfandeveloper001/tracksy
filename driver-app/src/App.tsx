import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { Linking, Platform, View, ActivityIndicator, Text } from 'react-native';
import { store } from './store/store';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { setUser, setAuthenticated, getCurrentUser } from './store/slices/authSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store/store';
import authService from './services/authService';

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
      
      // Check for existing session using Laravel API
      try {
        const token = await authService.getToken();
        if (token) {
          console.log('📦 Token found, fetching user...');
          const user = await authService.getCurrentUser();
          if (user) {
            console.log('✅ User found:', user.email);
            dispatch(setUser(user));
            dispatch(setAuthenticated(true));
          } else {
            // Token exists but user fetch failed - clear token
            await authService.logout();
          }
        } else {
          console.log('📦 No token found');
        }
      } catch (sessionError) {
        console.warn('⚠️ Session check error (non-critical):', sessionError);
        // Clear invalid token
        await authService.logout();
      }

      // Deep linking can be added later if needed for password reset, etc.
      // For now, Laravel API handles email verification differently

      console.log('✅ App initialization complete');
      setIsReady(true);
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      // Always set ready even on error to prevent infinite loading
      setIsReady(true);
    }
  };

  // Deep linking handler can be added later if needed

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

