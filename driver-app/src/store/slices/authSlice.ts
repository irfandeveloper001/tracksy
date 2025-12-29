import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';

export interface DriverUser {
  id: string;
  email: string;
  name: string;
  driver_id: string;
  phone?: string;
  license_number?: string;
  role: string;
  status?: string;
  assigned_bus?: any;
  assigned_route?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await authService.login(credentials);
      return {
        user: result.user,
        token: result.token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Signup driver
export const signupUser = createAsyncThunk(
  'auth/signup',
  async (signupData: {
    name: string;
    email: string;
    password: string;
    driver_id: string;
    phone?: string;
    license_number?: string;
  }, { rejectWithValue }) => {
    try {
      const result = await authService.signup(signupData);
      return {
        user: result.user,
        token: result.token,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Logout failed');
  }
});

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await authService.refreshToken();
      return token;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh token');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    profileData: {
      name?: string;
      email?: string;
      phone?: string;
      license_number?: string;
    },
    { rejectWithValue, getState }
  ) => {
    try {
      // Optimistic update - update user in state immediately
      const state: any = getState();
      const currentUser = state.auth.user;
      if (currentUser) {
        // Return optimistic update
        const optimisticUser = { ...currentUser, ...profileData };
      }
      const user = await authService.updateProfile(profileData);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    passwordData: {
      current_password: string;
      new_password: string;
      confirm_password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await authService.changePassword(passwordData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to change password');
    }
  }
);

interface AuthState {
  user: DriverUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<DriverUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
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
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
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

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        // Don't set isLoading to true - we don't want to block UI
        // state.isLoading = true; // REMOVED - don't block UI
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        // Don't change auth state if getCurrentUser fails - keep existing state
        // Only clear if we're sure user is not authenticated
        if (action.payload && action.payload.includes('not authenticated')) {
          state.isAuthenticated = false;
          state.user = null;
        }
        // Don't set error for "no user" - it's normal if not logged in
        if (action.payload && !action.payload.includes('Failed to get user')) {
          state.error = action.payload as string;
        }
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      });

    // Refresh token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload;
      });

    // Update profile - Optimistic update
    builder
      .addCase(updateProfile.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        // Optimistically update user
        if (state.user) {
          state.user = { ...state.user, ...action.meta.arg };
        }
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Note: In a real app, you'd want to reload the user to revert optimistic update
        // For now, the error message alerts the user to the issue
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUser, setToken, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;

