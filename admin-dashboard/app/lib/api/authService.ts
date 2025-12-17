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

  // Get role from metadata, default to VIEWER if not set
  const metadataRole = user.user_metadata?.role;
  let role = AdminRole.VIEWER;
  
  if (metadataRole && Object.values(AdminRole).includes(metadataRole as AdminRole)) {
    role = metadataRole as AdminRole;
  }

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.user_metadata?.full_name || '',
    role: role,
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
        console.error('❌ Supabase login error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
        }
        
        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid password')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        
        // Handle rate limiting
        if (error.status === 429 || /only request this after/i.test(error.message)) {
          throw new Error('Too many login attempts. Please wait a moment and try again.');
        }
        
        throw new Error(error.message || 'Login failed. Please check your credentials.');
      }

      if (!data.user || !data.session) {
        throw new Error('Login failed. Please check your credentials.');
      }

      // Check if admin profile exists in database
      let adminProfile = null;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors if not found

        if (!profileError && profileData) {
          adminProfile = profileData;
        } else if (profileError && profileError.code !== 'PGRST116') {
          // Only log if it's not a "not found" error
          console.warn('⚠️ Could not fetch admin profile:', profileError);
        }
      } catch (profileErr) {
        console.warn('⚠️ Could not fetch admin profile:', profileErr);
        // Continue - we'll try to create it
      }

      // Transform user and check/assign admin role
      let adminUser = transformUser(data.user);
      
      // If user doesn't have admin role in metadata but has admin profile, use profile role
      if (adminProfile && (!adminUser || !this.isAdminRole(adminUser.role))) {
        adminUser = {
          id: data.user.id,
          email: data.user.email || '',
          name: adminProfile.name || data.user.user_metadata?.name || '',
          role: (adminProfile.role as AdminRole) || AdminRole.VIEWER,
          permissions: adminProfile.permissions || [],
          created_at: data.user.created_at,
          last_login: adminProfile.last_login,
        };
      }

      // If still no admin role, check if we should assign default
      if (!adminUser || !this.isAdminRole(adminUser.role)) {
        // If admin_profiles table exists and user is in it, they're an admin
        if (adminProfile) {
          adminUser = {
            id: data.user.id,
            email: data.user.email || '',
            name: adminProfile.name || data.user.user_metadata?.name || '',
            role: (adminProfile.role as AdminRole) || AdminRole.VIEWER,
            permissions: adminProfile.permissions || [],
            created_at: data.user.created_at,
            last_login: adminProfile.last_login,
          };
        } else {
          // No admin profile found - deny access
        await supabase.auth.signOut();
          throw new Error('Access denied. This account does not have admin privileges. Please contact your administrator.');
        }
      }

      // Update last login
      await this.updateLastLogin(data.user.id);

      // Ensure admin profile exists in database
      await this.ensureAdminProfile(data.user, adminUser);

      return {
        user: adminUser,
        session: data.session,
      };
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  }

  // Signup admin
  async signup(
    email: string,
    password: string,
    name: string,
    role: AdminRole = AdminRole.ADMIN
  ): Promise<{ user: AdminUser; session: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error('❌ Supabase signup error:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        
        if (error.message.includes('Password')) {
          throw new Error('Password does not meet requirements. Please use a stronger password.');
        }
        
        throw new Error(error.message || 'Signup failed. Please try again.');
      }

      if (!data.user) {
        throw new Error('Signup failed. Please try again.');
      }

      // Transform user
      let adminUser = transformUser(data.user);
      
      // Set role if not already set
      if (!adminUser || !this.isAdminRole(adminUser.role)) {
        adminUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: name,
          role: role,
          permissions: [],
          created_at: data.user.created_at,
        };
      }

      // Create admin profile in database
      try {
        const { error: profileError } = await supabase
          .from('admin_profiles')
          .insert({
            id: data.user.id,
            email: email,
            name: name,
            role: role,
            permissions: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.warn('⚠️ Failed to create admin profile:', profileError);
          // If it's a permission error, the table might not exist or RLS is blocking
          if (profileError.code === 'PGRST116' || profileError.message.includes('permission denied')) {
            console.warn('⚠️ Admin profiles table might not exist. Please run SUPABASE_DATABASE_SETUP.sql in Supabase SQL Editor.');
          }
          // Non-critical error, don't throw - profile might be created by trigger
        } else {
          console.log('✅ Admin profile created successfully');
        }
      } catch (profileErr) {
        console.warn('⚠️ Error creating admin profile:', profileErr);
        // Non-critical error, profile might be created by trigger
      }

      // Update user metadata with role
      if (data.session) {
        await supabase.auth.updateUser({
          data: {
            name,
            role,
            full_name: name,
          },
        });
      }

      return {
        user: adminUser,
        session: data.session,
      };
    } catch (error: any) {
      console.error('❌ Admin signup error:', error);
      throw new Error(error.message || 'Signup failed. Please try again.');
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
      if (error) {
        console.warn('⚠️ Error getting user:', error);
        return null;
      }
      
      if (!user) {
        return null;
      }

      // Check if admin profile exists in database
      let adminProfile = null;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', user.id)
                 .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors if not found
      
        if (!profileError && profileData) {
          adminProfile = profileData;
               } else if (profileError && profileError.code !== 'PGRST116') {
                 // Only log if it's not a "not found" error
                 console.warn('⚠️ Could not fetch admin profile:', profileError);
        }
      } catch (profileErr) {
        console.warn('⚠️ Could not fetch admin profile:', profileErr);
      }

      // Transform user
      let adminUser = transformUser(user);
      
      // If user doesn't have admin role in metadata but has admin profile, use profile role
      if (adminProfile) {
        if (!adminUser || !this.isAdminRole(adminUser.role)) {
          adminUser = {
            id: user.id,
            email: user.email || '',
            name: adminProfile.name || user.user_metadata?.name || '',
            role: (adminProfile.role as AdminRole) || AdminRole.VIEWER,
            permissions: adminProfile.permissions || [],
            created_at: user.created_at,
            last_login: adminProfile.last_login,
          };
        }
      } else if (!adminUser || !this.isAdminRole(adminUser.role)) {
        // No admin profile and no admin role in metadata
        return null;
      }

      return adminUser;
    } catch (error) {
      console.error('❌ Get current user error:', error);
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
      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() to avoid errors if not found
      
      // If table doesn't exist, skip profile creation
      if (checkError && checkError.code === 'PGRST116') {
        console.warn('⚠️ Admin profiles table does not exist. Please run SUPABASE_COMPLETE_SETUP.sql');
        return;
      }

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('admin_profiles')
          .update({
            email: user.email,
            name: adminUser.name || existingProfile.name,
            role: adminUser.role,
            permissions: adminUser.permissions || [],
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          console.warn('⚠️ Failed to update admin profile:', error);
          // Non-critical error, don't throw
        }
      } else {
        // Create new profile
        const { error } = await supabase
          .from('admin_profiles')
          .insert({
          id: user.id,
          email: user.email,
          name: adminUser.name,
          role: adminUser.role,
          permissions: adminUser.permissions || [],
            created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
          console.warn('⚠️ Failed to create admin profile:', error);
          // If it's a permission error, the table might not exist or RLS is blocking
          if (error.code === 'PGRST116' || error.message.includes('permission denied')) {
            console.warn('⚠️ Admin profiles table might not exist. Please run SUPABASE_DATABASE_SETUP.sql in Supabase SQL Editor.');
          }
        // Non-critical error, don't throw
        } else {
          console.log('✅ Admin profile created/updated successfully');
        }
      }
    } catch (error) {
      console.warn('⚠️ Error ensuring admin profile:', error);
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
