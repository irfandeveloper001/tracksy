import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseAuthService from '../../services/supabaseAuthService';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    const result = await supabaseAuthService.login(email, password);
    if (result.success) {
      return result.data;
    }
    return rejectWithValue(result.error || 'Login failed');
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    const { email, password, student_id, name, institution } = userData;
    const result = await supabaseAuthService.register(email, password, {
      student_id,
      name,
      institution,
      role: 'student',
    });
    if (result.success) {
      // If email verification is required, return special flag
      if (result.requiresVerification) {
        return { requiresVerification: true, message: result.message, user: result.user };
      }
      return result.data;
    }
    return rejectWithValue(result.error || 'Registration failed');
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    const user = await supabaseAuthService.getCurrentUser();
    if (user) {
      return { user };
    }
    return rejectWithValue('No user found');
  }
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    const result = await supabaseAuthService.resendVerificationEmail(email);
    if (result.success) {
      return result.message;
    }
    return rejectWithValue(result.error);
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await supabaseAuthService.logout();
});

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requiresVerification: false,
  verificationMessage: null,
  pendingUser: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearVerificationState: (state) => {
      state.requiresVerification = false;
      state.verificationMessage = null;
      state.pendingUser = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Check if email verification is required
        if (action.payload.requiresVerification) {
          state.isAuthenticated = false;
          state.requiresVerification = true;
          state.verificationMessage = action.payload.message;
          state.pendingUser = action.payload.user;
        } else {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.requiresVerification = false;
        }
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      });

    // Resend Verification Email
    builder
      .addCase(resendVerificationEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.verificationMessage = action.payload;
        state.error = null;
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser, clearVerificationState } = authSlice.actions;
export default authSlice.reducer;

