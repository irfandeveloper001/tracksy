import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import routeService, { Route, Stop } from '../../services/routeService';

// Async thunks
export const getAssignedRoute = createAsyncThunk(
  'route/getAssigned',
  async (_, { rejectWithValue }) => {
    try {
      const route = await routeService.getAssignedRoute();
      return route;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get route');
    }
  }
);

export const getRouteStops = createAsyncThunk(
  'route/getStops',
  async (_, { rejectWithValue }) => {
    try {
      const stops = await routeService.getRouteStops();
      return stops;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get route stops');
    }
  }
);

export const markStopArrival = createAsyncThunk(
  'route/markStopArrival',
  async (stopId: number, { rejectWithValue }) => {
    try {
      const result = await routeService.markStopArrival(stopId);
      return { stopId, result };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark stop arrival');
    }
  }
);

interface RouteState {
  assignedRoute: Route | null;
  stops: Stop[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RouteState = {
  assignedRoute: null,
  stops: [],
  isLoading: false,
  error: null,
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setStops: (state, action: PayloadAction<Stop[]>) => {
      state.stops = action.payload;
    },
    updateStop: (state, action: PayloadAction<Stop>) => {
      const index = state.stops.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.stops[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Get assigned route
    builder
      .addCase(getAssignedRoute.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAssignedRoute.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignedRoute = action.payload;
        if (action.payload.stops) {
          state.stops = action.payload.stops;
        }
      })
      .addCase(getAssignedRoute.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get route stops
    builder
      .addCase(getRouteStops.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRouteStops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stops = action.payload;
      })
      .addCase(getRouteStops.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark stop arrival
    builder
      .addCase(markStopArrival.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markStopArrival.fulfilled, (state, action) => {
        state.isLoading = false;
        const { stopId, result } = action.payload;
        const index = state.stops.findIndex((s) => s.id === stopId);
        if (index !== -1) {
          state.stops[index] = {
            ...state.stops[index],
            arrived: true,
            actual_arrival_time: result.actual_time || new Date().toISOString(),
          };
        }
      })
      .addCase(markStopArrival.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setStops, updateStop } = routeSlice.actions;
export default routeSlice.reducer;

