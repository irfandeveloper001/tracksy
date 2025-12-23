import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import trackingReducer from './slices/trackingSlice';
import bookingReducer from './slices/bookingSlice';
import notificationReducer from './slices/notificationSlice';
import tripReducer from './slices/tripSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tracking: trackingReducer,
    booking: bookingReducer,
    notification: notificationReducer,
    trip: tripReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

