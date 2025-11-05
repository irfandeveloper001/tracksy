import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tripService } from '../../services/tripService';

// Async thunks
export const fetchTripHistory = createAsyncThunk(
  'trip/fetchTripHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tripService.getTripHistory(params);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to fetch trip history');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch trip history');
    }
  }
);

export const fetchTripStatistics = createAsyncThunk(
  'trip/fetchTripStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tripService.getTripStatistics(params);
      if (response.success) {
        return response.data;
      }
      // If API fails, calculate from existing bookings
      return rejectWithValue(response.error || 'Failed to fetch trip statistics');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch trip statistics');
    }
  }
);

export const fetchMonthlySummary = createAsyncThunk(
  'trip/fetchMonthlySummary',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await tripService.getMonthlySummary(month, year);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to fetch monthly summary');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch monthly summary');
    }
  }
);

export const fetchUsageStatistics = createAsyncThunk(
  'trip/fetchUsageStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await tripService.getUsageStatistics(params);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to fetch usage statistics');
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch usage statistics');
    }
  }
);

// Initial state
const initialState = {
  trips: [],
  statistics: {
    totalTrips: 0,
    onTimePercentage: 0,
    averageWaitingTime: 0,
    totalDistance: 0,
    co2Saved: 0,
    completedTrips: 0,
    cancelledTrips: 0,
  },
  monthlySummary: {},
  usageStatistics: {},
  filters: {
    startDate: null,
    endDate: null,
    status: null,
  },
  isLoading: false,
  error: null,
};

// Trip slice
const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    calculateStatisticsFromTrips: (state) => {
      if (state.trips.length > 0) {
        state.statistics = tripService.calculateStatisticsFromBookings(state.trips);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Trip History
    builder
      .addCase(fetchTripHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTripHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips = Array.isArray(action.payload) ? action.payload : [];
        // Calculate statistics from trips
        state.statistics = tripService.calculateStatisticsFromBookings(state.trips);
      })
      .addCase(fetchTripHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Trip Statistics
    builder
      .addCase(fetchTripStatistics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTripStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = { ...state.statistics, ...action.payload };
      })
      .addCase(fetchTripStatistics.rejected, (state, action) => {
        state.isLoading = false;
        // Keep existing statistics
      });

    // Fetch Monthly Summary
    builder
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.monthlySummary = action.payload;
      });

    // Fetch Usage Statistics
    builder
      .addCase(fetchUsageStatistics.fulfilled, (state, action) => {
        state.usageStatistics = action.payload;
      });
  },
});

export const { setFilters, clearFilters, calculateStatisticsFromTrips, clearError } =
  tripSlice.actions;
export default tripSlice.reducer;

