import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import passengerService, {
  Passenger,
  CheckInRequest,
} from '../../services/passengerService';

// Async thunks
export const getPassengers = createAsyncThunk(
  'passenger/getPassengers',
  async (tripId: number, { rejectWithValue }) => {
    try {
      const passengers = await passengerService.getPassengers(tripId);
      return passengers;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get passengers');
    }
  }
);

export const checkInPassenger = createAsyncThunk(
  'passenger/checkIn',
  async (data: CheckInRequest, { rejectWithValue }) => {
    try {
      const result = await passengerService.checkIn(data);
      return { studentId: data.student_id, result };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check-in passenger');
    }
  }
);

interface PassengerState {
  passengers: Passenger[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PassengerState = {
  passengers: [],
  isLoading: false,
  error: null,
};

const passengerSlice = createSlice({
  name: 'passenger',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPassengers: (state, action: PayloadAction<Passenger[]>) => {
      state.passengers = action.payload;
    },
    updatePassenger: (state, action: PayloadAction<Passenger>) => {
      const index = state.passengers.findIndex(
        (p) => p.id === action.payload.id
      );
      if (index !== -1) {
        state.passengers[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Get passengers
    builder
      .addCase(getPassengers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPassengers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passengers = action.payload;
      })
      .addCase(getPassengers.rejected, (state, action) => {
        state.isLoading = false;
        // Set empty array on error instead of crashing
        state.passengers = [];
        // Don't set error for backend unavailable - it's expected
        if (action.payload && !action.payload.includes('unavailable')) {
          state.error = action.payload as string;
        }
      });

    // Check-in passenger
    builder
      .addCase(checkInPassenger.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkInPassenger.fulfilled, (state, action) => {
        state.isLoading = false;
        const { studentId } = action.payload;
        const index = state.passengers.findIndex(
          (p) => p.id === studentId
        );
        if (index !== -1) {
          state.passengers[index] = {
            ...state.passengers[index],
            status: 'checked_in',
          };
        }
      })
      .addCase(checkInPassenger.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setPassengers, updatePassenger } =
  passengerSlice.actions;
export default passengerSlice.reducer;

