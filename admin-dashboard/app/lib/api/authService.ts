import { supabase } from '../config/supabase';
import type { User } from '@supabase/supabase-js';

// Admin user roles
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  VIEWER = 'viewer',
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: AdminRole;
  permissions?: string[];
  created_at?: string;
  last_login?: string;
}

// Transform Supabase user to AdminUser format
const transformUser = (user: User | null): AdminUser | null => {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.user_metadata?.full_name || '',
    role: (user.user_metadata?.role as AdminRole) || AdminRole.VIEWER,
    permissions: user.user_metadata?.permissions || [],
    created_at: user.created_at,
    last_login: user.user_metadata?.last_login,
  };
};

class AuthService {
  // Login admin
  async login(email: string, password: string, rememberMe: boolean = false): Promise<{ user: AdminUser; session: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
        }
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error('Login failed. Please check your credentials.');
      }

      // Check if user has admin role
      const adminUser = transformUser(data.user);
      if (!adminUser || !this.isAdminRole(adminUser.role)) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      // Update last login
      await this.updateLastLogin(data.user.id);

      // Ensure admin profile exists
      await this.ensureAdminProfile(data.user, adminUser);

      return {
        user: adminUser,
        session: data.session,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  // Logout admin
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Get current admin user
  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (!user || !this.isAdminRole(user.user_metadata?.role)) {
        return null;
      }

      return transformUser(user);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Refresh session
  async refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Refresh session error:', error);
      throw new Error('Failed to refresh session');
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  }

  // Check if user has admin role
  private isAdminRole(role: string): boolean {
    return Object.values(AdminRole).includes(role as AdminRole);
  }

  // Update last login timestamp
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await supabase
        .from('admin_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.warn('Failed to update last login:', error);
      // Non-critical error, don't throw
    }
  }

  // Ensure admin profile exists in database
  private async ensureAdminProfile(user: User, adminUser: AdminUser): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          name: adminUser.name,
          role: adminUser.role,
          permissions: adminUser.permissions || [],
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (error) {
        console.warn('Failed to ensure admin profile:', error);
        // Non-critical error, don't throw
      }
    } catch (error) {
      console.warn('Error ensuring admin profile:', error);
      // Non-critical error, don't throw
    }
  }

  // Auth state change listener
  onAuthStateChange(callback: (event: string, session: any, user: AdminUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ? transformUser(session.user) : null;
      callback(event, session, user);
    });
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return !!session;
  }

  // Check if user has permission
  hasPermission(user: AdminUser | null, permission: string): boolean {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === AdminRole.SUPER_ADMIN) return true;

    // Check if user has specific permission
    return user.permissions?.includes(permission) || false;
  }

  // Check if user has role
  hasRole(user: AdminUser | null, role: AdminRole): boolean {
    if (!user) return false;
    return user.role === role;
  }
}

export default new AuthService();
