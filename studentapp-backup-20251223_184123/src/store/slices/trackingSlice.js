import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import trackingService from '../../services/trackingService';
import { busService } from '../../services/busService';
import { routeService } from '../../services/routeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';

// Async thunks
export const fetchBuses = createAsyncThunk(
  'tracking/fetchBuses',
  async (params, { rejectWithValue }) => {
    const result = await busService.getAllBuses(params);
    if (result.success) {
      return result.data;
    }
    return rejectWithValue(result.error);
  }
);

export const fetchBusDetails = createAsyncThunk(
  'tracking/fetchBusDetails',
  async (busId, { rejectWithValue }) => {
    const result = await busService.getBusDetails(busId);
    if (result.success) {
      return result.data;
    }
    return rejectWithValue(result.error);
  }
);

export const fetchBusLocation = createAsyncThunk(
  'tracking/fetchBusLocation',
  async (busId, { rejectWithValue }) => {
    const result = await busService.getBusLocation(busId);
    if (result.success) {
      return result.data;
    }
    return rejectWithValue(result.error);
  }
);

export const fetchRoutes = createAsyncThunk(
  'tracking/fetchRoutes',
  async (params, { rejectWithValue }) => {
    const result = await routeService.getAllRoutes(params);
    if (result.success) {
      return result.data;
    }
    return rejectWithValue(result.error);
  }
);

export const fetchRouteDetails = createAsyncThunk(
  'tracking/fetchRouteDetails',
  async (routeId, { rejectWithValue }) => {
    const result = await routeService.getRouteDetails(routeId);
    if (result.success) {
      return result.data;
    }
    return rejectWithValue(result.error);
  }
);

export const fetchRouteStops = createAsyncThunk(
  'tracking/fetchRouteStops',
  async (routeId, { rejectWithValue }) => {
    const result = await routeService.getRouteStops(routeId);
    if (result.success) {
      return result.data;
    }
    return rejectWithValue(result.error);
  }
);

export const connectWebSocket = createAsyncThunk(
  'tracking/connectWebSocket',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      await trackingService.connect(token);
      return { connected: true };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to connect to WebSocket');
    }
  }
);

export const disconnectWebSocket = createAsyncThunk(
  'tracking/disconnectWebSocket',
  async () => {
    trackingService.disconnect();
  }
);

// Initial state
const initialState = {
  buses: [],
  activeBuses: [],
  busLocations: {}, // { busId: { latitude, longitude, timestamp, ... } }
  routes: [],
  selectedRoute: null,
  routeStops: [],
  selectedBus: null,
  isLoading: false,
  isWebSocketConnected: false,
  error: null,
  userLocation: null,
  mapRegion: null,
};

// Tracking slice
const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    updateBusLocation: (state, action) => {
      const { busId, location } = action.payload;
      state.busLocations[busId] = {
        ...location,
        timestamp: new Date().toISOString(),
      };
      
      // Update active buses list
      const bus = state.activeBuses.find(b => b.id === busId);
      if (bus) {
        bus.location = location;
      }
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    setMapRegion: (state, action) => {
      state.mapRegion = action.payload;
    },
    setSelectedBus: (state, action) => {
      state.selectedBus = action.payload;
    },
    setSelectedRoute: (state, action) => {
      state.selectedRoute = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearBusLocations: (state) => {
      state.busLocations = {};
    },
  },
  extraReducers: (builder) => {
    // Fetch Buses
    builder
      .addCase(fetchBuses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBuses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.buses = Array.isArray(action.payload) ? action.payload : [];
        state.activeBuses = state.buses.filter(bus => bus.status === 'active');
      })
      .addCase(fetchBuses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Bus Details
    builder
      .addCase(fetchBusDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBus = action.payload;
      })
      .addCase(fetchBusDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Bus Location
    builder
      .addCase(fetchBusLocation.fulfilled, (state, action) => {
        const location = action.payload;
        if (location && location.bus_id) {
          state.busLocations[location.bus_id] = {
            ...location,
            timestamp: new Date().toISOString(),
          };
        }
      });

    // Fetch Routes
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.routes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Route Details
    builder
      .addCase(fetchRouteDetails.fulfilled, (state, action) => {
        state.selectedRoute = action.payload;
      });

    // Fetch Route Stops
    builder
      .addCase(fetchRouteStops.fulfilled, (state, action) => {
        state.routeStops = Array.isArray(action.payload) ? action.payload : [];
      });

    // Connect WebSocket
    builder
      .addCase(connectWebSocket.fulfilled, (state) => {
        state.isWebSocketConnected = true;
      })
      .addCase(connectWebSocket.rejected, (state, action) => {
        state.isWebSocketConnected = false;
        state.error = action.payload;
      });

    // Disconnect WebSocket
    builder
      .addCase(disconnectWebSocket.fulfilled, (state) => {
        state.isWebSocketConnected = false;
      });
  },
});

export const {
  updateBusLocation,
  setUserLocation,
  setMapRegion,
  setSelectedBus,
  setSelectedRoute,
  clearError,
  clearBusLocations,
} = trackingSlice.actions;

export default trackingSlice.reducer;

