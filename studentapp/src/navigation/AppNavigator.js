import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ErrorBoundary from '../components/ErrorBoundary';
import OfflineIndicator from '../components/OfflineIndicator';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';
import { getCurrentUser, setUser } from '../store/slices/authSlice';
import { STORAGE_KEYS, COLORS } from '../constants';
import { setupGlobalErrorHandler } from '../services/errorLogger';
import { useNotifications } from '../hooks/useNotifications';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';
import SeatAvailabilityScreen from '../screens/SeatAvailabilityScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import RouteSelectionScreen from '../screens/RouteSelectionScreen';
import StopsScreen from '../screens/StopsScreen';
import RouteDetailsScreen from '../screens/RouteDetailsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator (for authenticated users)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E88E5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#1E88E5',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="TrackBus"
        component={LiveTrackingScreen}
        options={{
          tabBarLabel: 'Track',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🚌</Text>,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="BookSeat"
        component={SeatAvailabilityScreen}
        options={{
          tabBarLabel: 'Book',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🎫</Text>,
          headerTitle: 'Book Seat',
        }}
      />
      <Tab.Screen
        name="Routes"
        component={RouteSelectionScreen}
        options={{
          tabBarLabel: 'Routes',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🗺️</Text>,
          headerTitle: 'Routes',
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📋</Text>,
          headerTitle: 'My Bookings',
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔔</Text>,
          headerTitle: 'Notifications',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main Stack Navigator (for authenticated users)
const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen 
        name="RouteDetails" 
        component={RouteDetailsScreen}
        options={{ headerTitle: 'Route Details' }}
      />
      <Stack.Screen 
        name="Stops" 
        component={StopsScreen}
        options={{ headerTitle: 'Route Stops' }}
      />
      <Stack.Screen 
        name="TripHistory" 
        component={TripHistoryScreen}
        options={{ headerTitle: 'Trip History' }}
      />
      <Stack.Screen 
        name="Statistics" 
        component={StatisticsScreen}
        options={{ headerTitle: 'Statistics & Analytics' }}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  // Setup global error handler
  React.useEffect(() => {
    console.log('✅ AppNavigator mounted');
    setupGlobalErrorHandler();
  }, []);

  // Setup notifications when authenticated
  useNotifications();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication...');
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

        console.log('Token exists:', !!token);
        console.log('User data exists:', !!userData);

        if (token && userData) {
          const user = JSON.parse(userData);
          dispatch(setUser(user));
          console.log('✅ User loaded from storage');
          // Optionally refresh user data from API
          try {
            await dispatch(getCurrentUser()).unwrap();
            console.log('✅ User data refreshed from API');
          } catch (error) {
            console.warn('⚠️ Failed to refresh user data:', error.message);
            // If token is invalid, clear storage
            await AsyncStorage.multiRemove([
              STORAGE_KEYS.AUTH_TOKEN,
              STORAGE_KEYS.REFRESH_TOKEN,
              STORAGE_KEYS.USER_DATA,
            ]);
          }
        } else {
          console.log('ℹ️ No stored credentials, showing login screen');
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
      } finally {
        setIsLoading(false);
        console.log('✅ Auth check complete, isLoading:', false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (isLoading) {
    console.log('⏳ Showing loading screen...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  console.log('🎯 Rendering main navigation, isAuthenticated:', isAuthenticated);

  return (
    <ErrorBoundary>
      <View style={{ flex: 1 }}>
        <OfflineIndicator />
        <NavigationContainer>
          {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default AppNavigator;

