import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import notificationService, { Notification } from '../../services/notificationService';

// Async thunks
export const getNotifications = createAsyncThunk(
  'notification/getNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const notifications = await notificationService.getNotifications();
      return notifications;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all as read');
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'notification/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await notificationService.getUnreadCount();
      return count;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get unread count');
    }
  }
);

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
  },
  extraReducers: (builder) => {
    // Get notifications
    builder
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = Array.isArray(action.payload) ? action.payload : [];
        state.unreadCount = state.notifications.filter((n) => !n.read).length;
        state.error = null;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        // Set empty array on error instead of crashing
        state.notifications = [];
        state.unreadCount = 0;
        // Don't set error for backend unavailable - it's expected
        if (action.payload && !action.payload.includes('unavailable')) {
          state.error = action.payload as string;
        }
      });

    // Mark as read - Optimistic update
    builder
      .addCase(markNotificationAsRead.pending, (state, action) => {
        // Optimistically mark as read
        const notificationId = action.meta.arg;
        const index = state.notifications.findIndex((n) => n.id === notificationId);
        if (index !== -1 && !state.notifications[index].read) {
          state.notifications[index].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        // Already updated optimistically, just ensure consistency
        const notificationId = action.payload;
        const index = state.notifications.findIndex((n) => n.id === notificationId);
        if (index !== -1) {
          state.notifications[index].read = true;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        // Revert optimistic update on error
        const notificationId = action.meta.arg;
        const index = state.notifications.findIndex((n) => n.id === notificationId);
        if (index !== -1) {
          state.notifications[index].read = false;
          state.unreadCount += 1;
        }
      });

    // Mark all as read - Optimistic update
    builder
      .addCase(markAllAsRead.pending, (state) => {
        // Optimistically mark all as read
        state.notifications.forEach((n) => {
          n.read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        // Already updated optimistically
        state.notifications.forEach((n) => {
          n.read = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state) => {
        // Revert optimistic update on error
        state.notifications.forEach((n) => {
          if (!n.read) {
            state.unreadCount += 1;
          }
        });
      });

    // Get unread count
    builder
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = typeof action.payload === 'number' ? action.payload : 0;
      })
      .addCase(getUnreadCount.rejected, (state) => {
        // Set to 0 on error - don't crash
        state.unreadCount = 0;
      });
  },
});

export const { clearError, addNotification, setNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;

