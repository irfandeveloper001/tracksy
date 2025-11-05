import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LocationData } from '../../services/location/locationService';
import locationUpdateService from '../../services/location/locationUpdateService';

// Async thunks
export const sendLocationUpdate = createAsyncThunk(
  'location/sendUpdate',
  async (location: LocationData, { rejectWithValue }) => {
    try {
      const success = await locationUpdateService.sendLocationUpdate(location);
      if (!success) {
        return rejectWithValue('Failed to send location update');
      }
      return location;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send location update');
    }
  }
);

export const syncCachedLocations = createAsyncThunk(
  'location/syncCached',
  async (_, { rejectWithValue }) => {
    try {
      const cached = await locationUpdateService.getCachedLocations();
      const unsynced = cached.filter((loc) => !loc.synced);
      
      if (unsynced.length > 0) {
        const success = await locationUpdateService.sendBatchUpdates(unsynced);
        if (!success) {
          return rejectWithValue('Failed to sync cached locations');
        }
      }
      
      return unsynced.length;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sync cached locations');
    }
  }
);

interface LocationState {
  currentLocation: LocationData | null;
  isTracking: boolean;
  isBackgroundTracking: boolean;
  lastUpdateTime: number | null;
  updateCount: number;
  cachedLocations: number;
  error: string | null;
}

const initialState: LocationState = {
  currentLocation: null,
  isTracking: false,
  isBackgroundTracking: false,
  lastUpdateTime: null,
  updateCount: 0,
  cachedLocations: 0,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<LocationData>) => {
      state.currentLocation = action.payload;
      state.lastUpdateTime = Date.now();
      state.updateCount += 1;
    },
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    setBackgroundTracking: (state, action: PayloadAction<boolean>) => {
      state.isBackgroundTracking = action.payload;
    },
    resetLocationState: (state) => {
      state.currentLocation = null;
      state.isTracking = false;
      state.isBackgroundTracking = false;
      state.lastUpdateTime = null;
      state.updateCount = 0;
      state.cachedLocations = 0;
      state.error = null;
    },
    setCachedLocationsCount: (state, action: PayloadAction<number>) => {
      state.cachedLocations = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Send location update
    builder
      .addCase(sendLocationUpdate.pending, (state) => {
        state.error = null;
      })
      .addCase(sendLocationUpdate.fulfilled, (state, action) => {
        state.currentLocation = action.payload;
        state.lastUpdateTime = Date.now();
        state.updateCount += 1;
      })
      .addCase(sendLocationUpdate.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Sync cached locations
    builder
      .addCase(syncCachedLocations.fulfilled, (state, action) => {
        state.cachedLocations = Math.max(0, state.cachedLocations - action.payload);
      })
      .addCase(syncCachedLocations.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentLocation,
  setTracking,
  setBackgroundTracking,
  resetLocationState,
  setCachedLocationsCount,
  clearError,
} = locationSlice.actions;

export default locationSlice.reducer;

