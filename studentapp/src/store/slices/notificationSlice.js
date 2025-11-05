import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseNotificationService from '../../services/supabaseNotificationService';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const notifications = await supabaseNotificationService.getAllNotifications();
      return notifications;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const notifications = await supabaseNotificationService.markAsRead(notificationId);
      return { notifications, notificationId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const notifications = await supabaseNotificationService.markAllAsRead();
      return notifications;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark all as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const notifications = await supabaseNotificationService.deleteNotification(notificationId);
      return { notifications, notificationId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete notification');
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notification/clearAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await supabaseNotificationService.clearAll();
      return [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to clear notifications');
    }
  }
);

export const updateUnreadCount = createAsyncThunk(
  'notification/updateUnreadCount',
  async () => {
    const count = await supabaseNotificationService.updateUnreadCount();
    return count;
  }
);

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  selectedCategory: 'all',
  isLoading: false,
  error: null,
};

// Notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift({
        ...action.payload,
        id: action.payload.id || Date.now().toString(),
        read: false,
        created_at: action.payload.created_at || new Date().toISOString(),
      });
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = Array.isArray(action.payload) ? action.payload : [];
        state.unreadCount = state.notifications.filter((n) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Mark Notification As Read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadCount = state.notifications.filter((n) => !n.read).length;
      });

    // Mark All As Read
    builder
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = 0;
      });

    // Delete Notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications;
        state.unreadCount = state.notifications.filter((n) => !n.read).length;
      });

    // Clear All Notifications
    builder
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });

    // Update Unread Count
    builder
      .addCase(updateUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  },
});

export const { addNotification, setSelectedCategory, clearError } =
  notificationSlice.actions;
export default notificationSlice.reducer;


