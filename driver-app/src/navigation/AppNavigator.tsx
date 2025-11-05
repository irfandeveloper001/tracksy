import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { getCurrentUser } from '../store/slices/authSlice';
import supabaseAuthService from '../services/supabaseAuthService';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import StartTripScreen from '../screens/trip/StartTripScreen';
import EndTripScreen from '../screens/trip/EndTripScreen';
import TripNavigationScreen from '../screens/trip/TripNavigationScreen';
import RouteViewScreen from '../screens/route/RouteViewScreen';
import StopManagementScreen from '../screens/route/StopManagementScreen';
import StopDetailsScreen from '../screens/route/StopDetailsScreen';
import PassengersScreen from '../screens/passenger/PassengersScreen';
import CheckInScreen from '../screens/passenger/CheckInScreen';
import SeatManagementScreen from '../screens/passenger/SeatManagementScreen';
import PassengerDetailsScreen from '../screens/passenger/PassengerDetailsScreen';
import NotificationsScreen from '../screens/communication/NotificationsScreen';
import EmergencyScreen from '../screens/emergency/EmergencyScreen';
import IncidentReportScreen from '../screens/emergency/IncidentReportScreen';
import TripHistoryScreen from '../screens/history/TripHistoryScreen';
import TripDetailsScreen from '../screens/history/TripDetailsScreen';
import PerformanceScreen from '../screens/analytics/PerformanceScreen';
import RouteMapScreen from '../screens/map/RouteMapScreen';
import TripMapScreen from '../screens/map/TripMapScreen';
import OfflineIndicator from '../components/offline/OfflineIndicator';
import DebugScreen from '../components/debug/DebugScreen';
import ErrorBoundary from '../components/ErrorBoundary';

// Main Tab Navigator (for authenticated users)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
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
            <Tab.Screen
              name="Performance"
              component={PerformanceScreen}
              options={{
                tabBarLabel: 'Performance',
                tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
              }}
            />
          </Tab.Navigator>
        );
      };

// Auth Stack (Login & Register)
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Main Stack (Authenticated)
const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StartTrip"
        component={StartTripScreen}
        options={{ title: 'Start Trip' }}
      />
      <Stack.Screen
        name="EndTrip"
        component={EndTripScreen}
        options={{ title: 'End Trip' }}
      />
      <Stack.Screen
        name="TripNavigation"
        component={TripNavigationScreen}
        options={{ title: 'Navigation' }}
      />
      <Stack.Screen
        name="RouteView"
        component={RouteViewScreen}
        options={{ title: 'Route View' }}
      />
      <Stack.Screen
        name="StopManagement"
        component={StopManagementScreen}
        options={{ title: 'Stops' }}
      />
      <Stack.Screen
        name="StopDetails"
        component={StopDetailsScreen}
        options={{ title: 'Stop Details' }}
      />
      <Stack.Screen
        name="Passengers"
        component={PassengersScreen}
        options={{ title: 'Passengers' }}
      />
      <Stack.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{ title: 'Check-In' }}
      />
      <Stack.Screen
        name="SeatManagement"
        component={SeatManagementScreen}
        options={{ title: 'Seat Management' }}
      />
      <Stack.Screen
        name="PassengerDetails"
        component={PassengerDetailsScreen}
        options={{ title: 'Passenger Details' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{ title: 'Emergency Alert' }}
      />
      <Stack.Screen
        name="IncidentReport"
        component={IncidentReportScreen}
        options={{ title: 'Report Incident' }}
      />
      <Stack.Screen
        name="TripHistory"
        component={TripHistoryScreen}
        options={{ title: 'Trip History' }}
      />
      <Stack.Screen
        name="TripDetails"
        component={TripDetailsScreen}
        options={{ title: 'Trip Details' }}
      />
      <Stack.Screen
        name="Performance"
        component={PerformanceScreen}
        options={{ title: 'Performance' }}
      />
      <Stack.Screen
        name="RouteMap"
        component={RouteMapScreen}
        options={{ title: 'Route Map' }}
      />
      <Stack.Screen
        name="TripMap"
        component={TripMapScreen}
        options={{ title: 'Trip Map' }}
      />
      {__DEV__ && (
        <Stack.Screen
          name="Debug"
          component={DebugScreen}
          options={{ title: 'Debug' }}
        />
      )}
    </Stack.Navigator>
  );
};

export default function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Add timeout to prevent infinite loading - shorter timeout
      const timeout = setTimeout(() => {
        console.warn('⚠️ Auth check timeout - forcing completion');
        setIsCheckingAuth(false);
      }, 1500); // 1.5 second timeout - much shorter

      try {
        console.log('🔍 Checking auth in AppNavigator...');
        const session = await Promise.race([
          supabaseAuthService.getCurrentSession(),
          new Promise((resolve) => setTimeout(() => resolve(null), 1000)), // 1 second timeout
        ]);
        const authenticated = !!session;
        console.log('🔐 Auth status:', authenticated ? 'Authenticated' : 'Not authenticated');
        
        // Don't wait for getCurrentUser - dispatch it but don't await
        if (authenticated) {
          // Dispatch without awaiting - let it run in background
          dispatch(getCurrentUser()).catch((err) => {
            console.warn('⚠️ getCurrentUser failed (non-blocking):', err);
          });
        }
      } catch (error) {
        console.error('❌ Error checking auth:', error);
      } finally {
        console.log('✅ Auth check complete');
        clearTimeout(timeout);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  // Only show loading if we're checking auth, not if APIs are loading
  // This allows dashboard to show even if APIs are still loading
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <OfflineIndicator />
        {isAuthenticated ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

