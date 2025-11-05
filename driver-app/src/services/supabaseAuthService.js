import { supabase } from '../config/supabase';
import { Platform } from 'react-native';

// Transform Supabase user to app user format
const transformUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.user_metadata?.full_name || '',
    driver_id: user.user_metadata?.driver_id || '',
    phone: user.user_metadata?.phone || '',
    license_number: user.user_metadata?.license_number || '',
    role: user.user_metadata?.role || 'driver',
    status: user.user_metadata?.status || 'active',
    assigned_bus: user.user_metadata?.assigned_bus || null,
    assigned_route: user.user_metadata?.assigned_route || null,
    email_verified: user.email_confirmed_at ? true : false,
    created_at: user.created_at,
  };
};

class SupabaseAuthService {
  // Register driver
  async register(email, password, userData) {
    try {
      console.log('📝 Registering driver with Supabase:', email);
      
      // Set email redirect URL based on platform
      let emailRedirectTo = 'tracksydriver://email-verified';
      if (Platform.OS === 'web') {
        emailRedirectTo = typeof window !== 'undefined' 
          ? `${window.location.origin}/email-verified` 
          : 'http://localhost:8081/email-verified';
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            driver_id: userData.driver_id,
            phone: userData.phone,
            license_number: userData.license_number,
            role: 'driver',
            status: 'active',
          },
          emailRedirectTo,
        },
      });

      if (error) {
        console.error('❌ Supabase signup error:', error);
        throw error;
      }

      console.log('✅ Supabase signup successful:', data.user?.id);

      // Create user profile in database (non-blocking - don't wait for it)
      if (data.user) {
        this.ensureUserProfile(data.user, userData).catch((err) => {
          console.warn('⚠️ Profile creation error (non-critical):', err);
        });
      }

      return {
        success: true,
        user: transformUser(data.user),
        session: data.session,
        requiresVerification: !data.session, // Email verification required
        message: data.session 
          ? 'Registration successful! You can now log in.' 
          : 'Registration successful! Please check your email to verify your account before logging in.',
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        error: error.message || error.error || 'Registration failed',
      };
    }
  }

  // Login
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Please verify your email before logging in. Check your inbox for the verification link.',
            requiresVerification: true,
          };
        }
        throw error;
      }

      // Ensure user profile exists
      if (data.user) {
        await this.ensureUserProfile(data.user);
      }

      return {
        success: true,
        user: transformUser(data.user),
        session: data.session,
        data: {
          token: data.session?.access_token,
          user: transformUser(data.user),
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  // Logout
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return transformUser(user);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      // Add timeout to prevent hanging
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve({ data: { session: null }, error: null }), 2000)
      );
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
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
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Refresh session error:', error);
      return null;
    }
  }

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: 'tracksydriver://email-verified',
        },
      });
      if (error) throw error;
      return { success: true, message: 'Verification email sent. Please check your inbox.' };
    } catch (error) {
      console.error('Resend verification error:', error);
      throw new Error(error.message || 'Failed to resend verification email');
    }
  }

  // Verify email from URL (for deep linking)
  async verifyEmailFromURL(url) {
    try {
      console.log('🔐 Verifying email from URL:', url.substring(0, 100) + '...');
      
      // For web, Supabase automatically handles the session from URL hash
      // We just need to get the session
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Get session from Supabase (it should have been set automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (session && session.user) {
          console.log('✅ Session found, user:', session.user.email);
          await this.ensureUserProfile(session.user);
          return {
            user: transformUser(session.user),
            session: session,
          };
        }
      }

      // For native platforms or fallback: Extract tokens from URL hash
      const hashParams = new URLSearchParams(url.split('#')[1] || '');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (type === 'email' && accessToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) throw error;

        if (data.session && data.user) {
          await this.ensureUserProfile(data.user);
          return {
            user: transformUser(data.user),
            session: data.session,
          };
        }
      }

      throw new Error('Invalid verification link');
    } catch (error) {
      console.error('Email verification error:', error);
      throw new Error(error.message || 'Email verification failed');
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'tracksydriver://reset-password',
      });
      if (error) throw error;
      return { success: true, message: 'Password reset email sent. Please check your inbox.' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  }

  // Update profile
  async updateProfile(updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...updates,
        },
      });

      if (error) throw error;

      // Update profile in database
      await this.ensureUserProfile(data.user, updates);

      return transformUser(data.user);
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // Ensure user profile exists in database
  async ensureUserProfile(user, additionalData = {}) {
    try {
      const { error } = await supabase.from('driver_profiles').upsert({
        id: user.id,
        email: user.email,
        name: additionalData.name || user.user_metadata?.name || '',
        driver_id: additionalData.driver_id || user.user_metadata?.driver_id || '',
        phone: additionalData.phone || user.user_metadata?.phone || '',
        license_number: additionalData.license_number || user.user_metadata?.license_number || '',
        status: 'active',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

      if (error) {
        console.error('Error ensuring user profile:', error);
        // Don't throw - profile creation is not critical for auth
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
      // Don't throw - profile creation is not critical for auth
    }
  }

  // Auth state change listener
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session, transformUser(session?.user));
    });
  }
}

export default new SupabaseAuthService();
