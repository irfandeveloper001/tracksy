import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService, { AdminRole } from '../api/authService';
import type { AdminUser } from '../api/authService';

// Session type for Laravel API (compatible with Supabase session structure)
interface Session {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
      role: string;
    };
  };
}

interface AuthState {
  user: AdminUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: AdminRole) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: AdminRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string, rememberMe: boolean = false) => {
        set({ isLoading: true, error: null });
        try {
          const { user, session } = await authService.login(email, password, rememberMe);
          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      signup: async (email: string, password: string, name: string, role: AdminRole = AdminRole.ADMIN) => {
        set({ isLoading: true, error: null });
        try {
          const { user, session } = await authService.signup(email, password, name, role);
          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Signup failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Logout failed' });
          throw error;
        }
      },

      getCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          const session = await authService.getCurrentSession();
          set({
            user,
            session,
            isAuthenticated: !!user && !!session,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Failed to get user',
          });
        }
      },

      refreshSession: async () => {
        try {
          const session = await authService.refreshSession();
          set({ session, isAuthenticated: !!session });
        } catch (error: any) {
          console.error('Failed to refresh session:', error);
          // If refresh fails, logout user
          await get().logout();
        }
      },

      clearError: () => set({ error: null }),

      hasPermission: (permission: string) => {
        const { user } = get();
        return authService.hasPermission(user, permission);
      },

      hasRole: (role: AdminRole) => {
        const { user } = get();
        return authService.hasRole(user, role);
      },
    }),
    {
      name: 'tracksy-admin-auth',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
      skipHydration: true, // Skip hydration to avoid SSR issues
      onRehydrateStorage: () => (state) => {
        // Called after rehydration
        if (state) {
          console.log('Auth store rehydrated');
        }
      },
    }
  )
);

