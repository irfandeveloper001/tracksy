import api from './client';

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

// transformUser removed - Admin Dashboard now uses Laravel API only

class AuthService {
  // Login to Laravel backend (for API access) - REQUIRED for admin dashboard
  async loginToLaravel(email: string, password: string): Promise<string> {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      console.log('🔐 Attempting Laravel login to:', `${apiUrl}/admin/login`);
      
      const response = await fetch(`${apiUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.data?.message || `Laravel login failed with status ${response.status}`;
        console.error('❌ Laravel login failed:', errorMessage);
        
        // Throw error - Laravel login is required for admin dashboard
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const token = data.data?.token || data.token;
      
      if (!token) {
        console.error('❌ Laravel login succeeded but no token received');
        throw new Error('No authentication token received from server. Please try again.');
      }
      
      // Store token in localStorage
      localStorage.setItem('laravel_token', token);
      localStorage.setItem('tracksy_admin:auth_token', token);
      console.log('✅ Laravel token stored successfully');
      return token;
    } catch (error: any) {
      console.error('❌ Laravel login error:', error.message);
      
      // Re-throw with helpful message
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('Cannot connect to backend server. Please ensure Laravel backend is running on http://localhost:8000');
      }
      
      throw error;
    }
  }

  // Login admin - Laravel API only
  async login(email: string, password: string, rememberMe: boolean = false): Promise<{ user: AdminUser; session: any }> {
    try {
      // Login to Laravel backend - REQUIRED
      const laravelToken = await this.loginToLaravel(email, password);
      console.log('✅ Laravel authentication successful');
      
      // Get user info from Laravel API
      const response = await api.get('/admin/me');
      const userData = response.data.data || response.data;
      
      if (!userData) {
        throw new Error('Failed to retrieve user information from backend.');
      }

      // Create admin user object from Laravel response
      const adminUser: AdminUser = {
        id: userData.id?.toString() || '',
        email: userData.email || email,
        name: userData.name || '',
        role: this.mapRoleToAdminRole(userData.role || 'admin'),
        permissions: userData.permissions || [],
        created_at: userData.created_at || new Date().toISOString(),
        last_login: userData.last_login || null,
      };

      // Create session object
      const session = {
        access_token: laravelToken,
        refresh_token: laravelToken,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          user_metadata: {
            name: adminUser.name,
            role: adminUser.role,
          },
        },
      };

      return {
        user: adminUser,
        session: session,
      };
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  }
  
  // Map Laravel role to AdminRole enum
  private mapRoleToAdminRole(role: string): AdminRole {
    switch (role?.toLowerCase()) {
      case 'super_admin':
        return AdminRole.SUPER_ADMIN;
      case 'admin':
        return AdminRole.ADMIN;
      case 'manager':
        return AdminRole.MANAGER;
      case 'viewer':
        return AdminRole.VIEWER;
      default:
        return AdminRole.ADMIN;
    }
  }

  // Signup admin - Laravel API only
  async signup(
    email: string,
    password: string,
    name: string,
    role: AdminRole = AdminRole.ADMIN
  ): Promise<{ user: AdminUser; session: any }> {
    try {
      // First, create user in Laravel backend
      console.log('🔐 Creating user in Laravel backend...');
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      
      try {
        const laravelResponse = await fetch(`${apiUrl}/admin/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            password_confirmation: password,
          }),
        });

        if (!laravelResponse.ok) {
          const errorData = await laravelResponse.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.data?.message || `Laravel signup failed with status ${laravelResponse.status}`;
          
          // Handle specific errors
          if (errorData.errors) {
            const validationErrors = Object.entries(errorData.errors)
              .map(([field, messages]: [string, any]) => {
                const msg = Array.isArray(messages) ? messages[0] : messages;
                // Provide user-friendly message for email already taken
                if (field === 'email' && (msg.includes('taken') || msg.includes('already'))) {
                  return 'email: An account with this email already exists. Please sign in instead or use a different email address.';
                }
                return `${field}: ${msg}`;
              })
              .join(', ');
            throw new Error(validationErrors);
          }
          
          // Handle email already taken in general error message
          if (errorMessage.toLowerCase().includes('email') && 
              (errorMessage.toLowerCase().includes('taken') || 
               errorMessage.toLowerCase().includes('already') ||
               errorMessage.toLowerCase().includes('exists'))) {
            throw new Error('An account with this email already exists. Please sign in instead or use a different email address.');
          }
          
          throw new Error(errorMessage);
        }

        const laravelData = await laravelResponse.json();
        const laravelToken = laravelData.data?.token || laravelData.token;
        const laravelUser = laravelData.data?.user || laravelData.user;
        
        if (laravelToken) {
          localStorage.setItem('laravel_token', laravelToken);
          localStorage.setItem('tracksy_admin:auth_token', laravelToken);
          console.log('✅ Laravel user created and token stored');
        }

        // Create admin user object from Laravel response
        const adminUser: AdminUser = {
          id: laravelUser?.id?.toString() || '',
          email: laravelUser?.email || email,
          name: laravelUser?.name || name,
          role: role,
          permissions: [],
          created_at: laravelUser?.created_at || new Date().toISOString(),
        };

        // Try to create in Supabase (optional, for UI state)
        // Don't fail if this doesn't work
        let session: any = null;
        try {
          console.log('🔐 Creating user in Supabase (optional)...');
          const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
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

          if (supabaseError) {
            console.warn('⚠️ Supabase signup failed (non-critical):', supabaseError.message);
          } else if (supabaseData?.session) {
            session = supabaseData.session;
            console.log('✅ Supabase user also created');
          }
        } catch (supabaseErr: any) {
          console.warn('⚠️ Supabase signup error (non-critical):', supabaseErr.message);
        }

        // If no Supabase session, create a minimal one for compatibility
        if (!session) {
          session = {
            access_token: laravelToken || '',
            refresh_token: laravelToken || '',
            user: {
              id: adminUser.id,
              email: adminUser.email,
              user_metadata: {
                name: adminUser.name,
                role: adminUser.role,
              },
            },
          } as any;
        }

        // Signup succeeded - user is created in Laravel database
        console.log('✅ Admin account created successfully in Laravel backend');
        return {
          user: adminUser,
          session: session,
        };
      } catch (laravelError: any) {
        console.error('❌ Laravel signup error:', laravelError);
        // Laravel signup is required - throw error
        if (laravelError.message) {
          throw laravelError;
        }
        throw new Error('Failed to create account in backend. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Admin signup error:', error);
      
      // Only throw errors for actual signup failures, not profile creation issues
      // The trigger handles profile creation with SECURITY DEFINER permissions
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  }

  // Logout admin - Laravel API only
  async logout(): Promise<void> {
    try {
      // Clear Laravel tokens
      localStorage.removeItem('laravel_token');
      localStorage.removeItem('tracksy_admin:auth_token');
      console.log('✅ Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Clear tokens even if there's an error
      localStorage.removeItem('laravel_token');
      localStorage.removeItem('tracksy_admin:auth_token');
    }
  }

  // Get current admin user - Laravel API only
  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      // Check if Laravel token exists
      const token = localStorage.getItem('laravel_token') || localStorage.getItem('tracksy_admin:auth_token');
      if (!token) {
        return null;
      }

      // Fetch user from Laravel API
      const response = await api.get('/admin/me');
      const userData = response.data.data || response.data;
      
      if (!userData) {
        return null;
      }

      // Create admin user object from Laravel response
      const adminUser: AdminUser = {
        id: userData.id?.toString() || '',
        email: userData.email || '',
        name: userData.name || '',
        role: this.mapRoleToAdminRole(userData.role || 'admin'),
        permissions: userData.permissions || [],
        created_at: userData.created_at || new Date().toISOString(),
        last_login: userData.last_login || null,
      };

      return adminUser;
    } catch (error: any) {
      console.error('❌ Get current user error:', error);
      // If 401, clear tokens
      if (error.response?.status === 401) {
        localStorage.removeItem('laravel_token');
        localStorage.removeItem('tracksy_admin:auth_token');
      }
      return null;
    }
  }

  // Get current session - Laravel API only
  async getCurrentSession() {
    try {
      const token = localStorage.getItem('laravel_token') || localStorage.getItem('tracksy_admin:auth_token');
      if (!token) {
        return null;
      }

      // Verify token is still valid by checking user
      const user = await this.getCurrentUser();
      if (!user) {
        return null;
      }

      return {
        access_token: token,
        refresh_token: token,
        user: {
          id: user.id,
          email: user.email,
          user_metadata: {
            name: user.name,
            role: user.role,
          },
        },
      };
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Refresh session - Laravel API only
  async refreshSession() {
    try {
      // For Laravel JWT, we just verify the token is still valid
      // If it's expired, user needs to login again
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('Session expired. Please login again.');
      }

      const token = localStorage.getItem('laravel_token') || localStorage.getItem('tracksy_admin:auth_token');
      return {
        access_token: token,
        refresh_token: token,
        user: {
          id: user.id,
          email: user.email,
          user_metadata: {
            name: user.name,
            role: user.role,
          },
        },
      };
    } catch (error) {
      console.error('Refresh session error:', error);
      throw new Error('Failed to refresh session. Please login again.');
    }
  }

  // Reset password - Laravel API only
  async resetPassword(email: string): Promise<void> {
    try {
      // Use Laravel password reset endpoint if available
      // For now, throw error indicating feature not implemented
      throw new Error('Password reset via Laravel API is not yet implemented. Please contact administrator.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  // Update password - Laravel API only
  async updatePassword(newPassword: string): Promise<void> {
    try {
      // Use Laravel password update endpoint if available
      // For now, throw error indicating feature not implemented
      throw new Error('Password update via Laravel API is not yet implemented. Please contact administrator.');
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  }

  // Check if user has admin role
  private isAdminRole(role: string): boolean {
    return Object.values(AdminRole).includes(role as AdminRole);
  }

  // Update last login timestamp - Laravel API only
  // Note: This is handled by Laravel backend automatically
  private async updateLastLogin(userId: string): Promise<void> {
    // Laravel backend handles last login tracking
    // No action needed on frontend
  }

  // Ensure admin profile exists - Laravel API only
  // Note: User profiles are managed by Laravel backend
  private async ensureAdminProfile(user: any, adminUser: AdminUser): Promise<void> {
    // Laravel backend manages user profiles
    // No action needed on frontend
  }

  // Auth state change listener - Laravel API only
  // Note: For Laravel JWT, we don't have real-time auth state changes
  // This is a minimal implementation for compatibility
  onAuthStateChange(callback: (event: string, session: any, user: AdminUser | null) => void) {
    // Check auth state periodically (every 5 minutes)
    const interval = setInterval(async () => {
      const token = localStorage.getItem('laravel_token') || localStorage.getItem('tracksy_admin:auth_token');
      if (token) {
        const user = await this.getCurrentUser();
        const session = await this.getCurrentSession();
        if (user && session) {
          callback('SIGNED_IN', session, user);
        } else {
          callback('SIGNED_OUT', null, null);
        }
      } else {
        callback('SIGNED_OUT', null, null);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => clearInterval(interval),
        },
      },
    };
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
