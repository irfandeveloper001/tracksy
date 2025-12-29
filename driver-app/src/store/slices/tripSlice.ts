import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import tripService, {
  Trip,
  StartTripRequest,
  EndTripRequest,
} from '../../services/tripService';

// Async thunks
export const startTrip = createAsyncThunk(
  'trip/start',
  async (data: StartTripRequest, { rejectWithValue }) => {
    try {
      const trip = await tripService.startTrip(data);
      return trip;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to start trip');
    }
  }
);

export const endTrip = createAsyncThunk(
  'trip/end',
  async (
    { tripId, data }: { tripId: number; data: EndTripRequest },
    { rejectWithValue }
  ) => {
    try {
      const trip = await tripService.endTrip(tripId, data);
      return trip;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to end trip');
    }
  }
);

export const getCurrentTrip = createAsyncThunk(
  'trip/getCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const trip = await tripService.getCurrentTrip();
      return trip;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get current trip');
    }
  }
);

export const getTripHistory = createAsyncThunk(
  'trip/getHistory',
  async (
    params?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      page?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await tripService.getTripHistory(params);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get trip history');
    }
  }
);

export const getTripDetails = createAsyncThunk(
  'trip/getDetails',
  async (tripId: number, { rejectWithValue }) => {
    try {
      const trip = await tripService.getTripDetails(tripId);
      return trip;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get trip details');
    }
  }
);

interface TripState {
  currentTrip: Trip | null;
  tripHistory: Trip[];
  tripDetails: Trip | null;
  selectedTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
  totalTrips: number;
  currentPage: number;
}

const initialState: TripState = {
  currentTrip: null,
  tripHistory: [],
  tripDetails: null,
  selectedTrip: null,
  isLoading: false,
  error: null,
  totalTrips: 0,
  currentPage: 1,
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTrip: (state, action: PayloadAction<Trip | null>) => {
      state.currentTrip = action.payload;
    },
    clearCurrentTrip: (state) => {
      state.currentTrip = null;
    },
  },
  extraReducers: (builder) => {
    // Start trip - Optimistic update
    builder
      .addCase(startTrip.pending, (state, action) => {
        // Optimistically set current trip if we have route_id
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTrip = action.payload;
        state.error = null;
      })
      .addCase(startTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // End trip - Optimistic update
    builder
      .addCase(endTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        // Optimistically add current trip to history and clear it
        if (state.currentTrip) {
          const endedTrip = {
            ...state.currentTrip,
            status: 'completed' as const,
            end_time: new Date().toISOString(),
          };
          state.tripHistory.unshift(endedTrip);
          state.currentTrip = null;
        }
      })
      .addCase(endTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTrip = null;
        // Replace optimistic entry with actual response
        if (state.tripHistory.length > 0 && state.tripHistory[0].id === action.payload.id) {
          state.tripHistory[0] = action.payload;
        } else {
          state.tripHistory.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(endTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Revert optimistic update - restore current trip if it was cleared
        if (state.tripHistory.length > 0) {
          const lastTrip = state.tripHistory[0];
          if (lastTrip.status === 'completed' && !lastTrip.end_time) {
            state.tripHistory.shift();
            // Restore current trip if needed
            if (!state.currentTrip && lastTrip.status === 'in_progress') {
              state.currentTrip = lastTrip;
            }
          }
        }
      });

    // Get current trip
    builder
      .addCase(getCurrentTrip.pending, (state) => {
        // Don't set isLoading - we don't want to block UI
        // state.isLoading = true; // REMOVED - non-blocking
        state.error = null;
      })
      .addCase(getCurrentTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTrip = action.payload;
        state.error = null;
      })
      .addCase(getCurrentTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.currentTrip = null;
        // Don't set error for "no current trip" - it's normal
        if (action.payload && !action.payload.includes('unavailable')) {
          state.error = action.payload as string;
        }
      });

    // Get trip history
    builder
      .addCase(getTripHistory.pending, (state) => {
        // Don't set isLoading - we don't want to block UI
        // state.isLoading = true; // REMOVED - non-blocking
        state.error = null;
      })
      .addCase(getTripHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both object format { trips, total, current_page } and array format
        if (action.payload && typeof action.payload === 'object' && 'trips' in action.payload) {
          const payload = action.payload as { trips: Trip[]; total: number; current_page: number };
          state.tripHistory = payload.trips || [];
          state.totalTrips = payload.total || 0;
          state.currentPage = payload.current_page || 1;
        } else if (Array.isArray(action.payload)) {
          state.tripHistory = action.payload;
          state.totalTrips = action.payload.length;
          state.currentPage = 1;
        } else {
          state.tripHistory = [];
          state.totalTrips = 0;
          state.currentPage = 1;
        }
        state.error = null;
      })
      .addCase(getTripHistory.rejected, (state, action) => {
        state.isLoading = false;
        // Set empty array on error instead of crashing
        state.tripHistory = [];
        state.totalTrips = 0;
        state.error = action.payload as string;
      });

    // Get trip details
    builder
      .addCase(getTripDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTripDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tripDetails = action.payload;
      })
      .addCase(getTripDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentTrip, clearCurrentTrip } =
  tripSlice.actions;
export default tripSlice.reducer;

