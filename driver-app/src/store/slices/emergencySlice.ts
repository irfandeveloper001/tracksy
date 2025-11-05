import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import emergencyService, {
  EmergencyAlert,
  IncidentReport,
} from '../../services/emergencyService';

// Async thunks
export const sendEmergency = createAsyncThunk(
  'emergency/send',
  async (alert: EmergencyAlert, { rejectWithValue }) => {
    try {
      const result = await emergencyService.sendEmergency(alert);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send emergency alert');
    }
  }
);

export const reportIncident = createAsyncThunk(
  'emergency/reportIncident',
  async (report: IncidentReport, { rejectWithValue }) => {
    try {
      const result = await emergencyService.reportIncident(report);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to report incident');
    }
  }
);

interface EmergencyState {
  isLoading: boolean;
  error: string | null;
  lastEmergencySent: string | null;
}

const initialState: EmergencyState = {
  isLoading: false,
  error: null,
  lastEmergencySent: null,
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastEmergency: (state) => {
      state.lastEmergencySent = null;
    },
  },
  extraReducers: (builder) => {
    // Send emergency
    builder
      .addCase(sendEmergency.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendEmergency.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastEmergencySent = new Date().toISOString();
        state.error = null;
      })
      .addCase(sendEmergency.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Report incident
    builder
      .addCase(reportIncident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reportIncident.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(reportIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearLastEmergency } = emergencySlice.actions;
export default emergencySlice.reducer;

