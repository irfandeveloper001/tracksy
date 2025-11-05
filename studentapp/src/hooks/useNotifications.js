import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import supabaseNotificationService from '../services/supabaseNotificationService';
import supabaseTrackingService from '../services/supabaseTrackingService';
import { addNotification, updateUnreadCount } from '../store/slices/notificationSlice';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Handle incoming notification
  const handleNotification = useCallback(
    (notification) => {
      dispatch(addNotification(notification));
      dispatch(updateUnreadCount());
      console.log('📬 New notification received:', notification);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    // Connect to Supabase Realtime
    supabaseTrackingService.connect();

    // Setup Supabase Realtime subscription for notifications
    const unsubscribeNotifications = supabaseNotificationService.setupRealtimeSubscription(
      handleNotification
    );

    // Setup bus tracking subscriptions that trigger notifications
    let unsubscribeRouteDeviation = () => {};
    let unsubscribeAlerts = () => {};
    let unsubscribeEmergency = () => {};
    let unsubscribeStopArrival = () => {};

    // Setup subscriptions asynchronously
    (async () => {
      unsubscribeRouteDeviation = await supabaseTrackingService.subscribeToRouteDeviation(
        (data) => {
          handleNotification({
            type: 'route_deviation',
            title: 'Route Deviation Alert',
            message: `Bus has deviated from its route`,
            severity: 'high',
            data: data,
          });
        }
      ) || (() => {});

      unsubscribeAlerts = await supabaseTrackingService.subscribeToAlerts((data) => {
        handleNotification({
          type: data.type || 'alert',
          title: data.title || 'Alert',
          message: data.message || 'New alert received',
          severity: data.severity || 'medium',
          data: data,
        });
      }) || (() => {});

      unsubscribeEmergency = await supabaseTrackingService.subscribeToEmergencyAlerts((data) => {
        handleNotification({
          type: 'emergency',
          title: data.title || 'Emergency Alert',
          message: data.message || 'Emergency alert received',
          severity: 'critical',
          data: data,
        });
      }) || (() => {});

      unsubscribeStopArrival = await supabaseTrackingService.subscribeToStopArrivals((data) => {
        handleNotification({
          type: 'stop_arrival',
          title: 'Stop Arrived',
          message: `Bus has arrived at stop`,
          severity: 'low',
          data: data,
        });
      }) || (() => {});
    })();

    // Cleanup on unmount
    return () => {
      unsubscribeNotifications();
      unsubscribeRouteDeviation();
      unsubscribeAlerts();
      unsubscribeEmergency();
      unsubscribeStopArrival();
      supabaseTrackingService.disconnect();
    };
  }, [user, handleNotification]);

  return {
    // Return any notification-related utilities if needed
  };
};

