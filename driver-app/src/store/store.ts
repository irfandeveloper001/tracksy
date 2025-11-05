import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import locationReducer from './slices/locationSlice';
import tripReducer from './slices/tripSlice';
import routeReducer from './slices/routeSlice';
import passengerReducer from './slices/passengerSlice';
import notificationReducer from './slices/notificationSlice';
import emergencyReducer from './slices/emergencySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    trip: tripReducer,
    route: routeReducer,
    passenger: passengerReducer,
    notification: notificationReducer,
    emergency: emergencyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

