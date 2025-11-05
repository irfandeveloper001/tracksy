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
    // Start trip
    builder
      .addCase(startTrip.pending, (state) => {
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

    // End trip
    builder
      .addCase(endTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(endTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTrip = null;
        // Add to history
        state.tripHistory.unshift(action.payload);
        state.error = null;
      })
      .addCase(endTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get current trip
    builder
      .addCase(getCurrentTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTrip = action.payload;
      })
      .addCase(getCurrentTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.currentTrip = null;
      });

    // Get trip history
    builder
      .addCase(getTripHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTripHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tripHistory = action.payload.trips;
        state.totalTrips = action.payload.total;
        state.currentPage = action.payload.current_page;
      })
      .addCase(getTripHistory.rejected, (state, action) => {
        state.isLoading = false;
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

