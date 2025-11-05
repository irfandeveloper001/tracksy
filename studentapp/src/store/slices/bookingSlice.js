import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingService } from '../../services/bookingService';
import { busService } from '../../services/busService';

// Async thunks
export const fetchUserBookings = createAsyncThunk(
  'booking/fetchUserBookings',
  async (params, { rejectWithValue }) => {
    const result = await bookingService.getUserBookings(params);
    if (result.success) {
      return result.data;
    }
    return rejectWithValue(result.error);
  }
);

export const fetchBookingDetails = createAsyncThunk(
  'booking/fetchBookingDetails',
  async (bookingId, { rejectWithValue }) => {
    const result = await bookingService.getBookingDetails(bookingId);
    if (result.success) {
      return result.data;
    }
    return rejectWithValue(result.error);
  }
);

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    const result = await bookingService.createBooking(bookingData);
    if (result.success) {
      return result.data;
    }
    return rejectWithValue(result.error);
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async (bookingId, { rejectWithValue }) => {
    const result = await bookingService.cancelBooking(bookingId);
    if (result.success) {
      return bookingId;
    }
    return rejectWithValue(result.error);
  }
);

export const fetchSeatAvailability = createAsyncThunk(
  'booking/fetchSeatAvailability',
  async ({ busId, tripDate }, { rejectWithValue }) => {
    const result = await busService.getSeatAvailability(busId, tripDate);
    if (result.success) {
      return result.data;
    }
    return rejectWithValue(result.error);
  }
);

// Initial state
const initialState = {
  bookings: [],
  selectedBooking: null,
  seatAvailability: null,
  selectedBus: null,
  selectedSeat: null,
  selectedDate: null,
  isLoading: false,
  error: null,
};

// Booking slice
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedBus: (state, action) => {
      state.selectedBus = action.payload;
    },
    setSelectedSeat: (state, action) => {
      state.selectedSeat = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    clearSeatAvailability: (state) => {
      state.seatAvailability = null;
      state.selectedSeat = null;
    },
    clearBooking: (state) => {
      state.selectedBus = null;
      state.selectedSeat = null;
      state.selectedDate = null;
      state.seatAvailability = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch User Bookings
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Booking Details
    builder
      .addCase(fetchBookingDetails.fulfilled, (state, action) => {
        state.selectedBooking = action.payload;
      });

    // Create Booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings.unshift(action.payload);
        state.selectedBooking = action.payload;
        // Clear booking form
        state.selectedBus = null;
        state.selectedSeat = null;
        state.selectedDate = null;
        state.seatAvailability = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Cancel Booking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = state.bookings.filter(
          (booking) => booking.id !== action.payload
        );
        if (state.selectedBooking?.id === action.payload) {
          state.selectedBooking = null;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Seat Availability
    builder
      .addCase(fetchSeatAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSeatAvailability.fulfilled, (state, action) => {
        state.isLoading = false;
        state.seatAvailability = action.payload;
      })
      .addCase(fetchSeatAvailability.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedBus,
  setSelectedSeat,
  setSelectedDate,
  clearSeatAvailability,
  clearBooking,
  clearError,
} = bookingSlice.actions;

export default bookingSlice.reducer;

