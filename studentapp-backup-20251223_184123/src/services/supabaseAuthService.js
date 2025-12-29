import supabase from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants';

const NATIVE_EMAIL_REDIRECT = 'tracksy://email-verified';

const resolveEmailRedirectTo = () => {
  if (process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL) {
    return process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL;
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin || 'http://localhost:19007';
  }

  return NATIVE_EMAIL_REDIRECT;
};

const formatSupabaseError = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;

  const normalizedMessage = error.message || error.error || fallbackMessage;

  if (error.status === 429 || /only request this after/i.test(normalizedMessage)) {
    return 'For security purposes you must wait about 30 seconds before sending another signup request. Please try again shortly.';
  }

  if (error.status === 500 || /database error saving new user/i.test(normalizedMessage)) {
    return 'Student ID or email already exists in Supabase. Please use unique credentials or remove the existing record before trying again.';
  }

  if (error.status === 400 && /email.*already/i.test(normalizedMessage)) {
    return 'This email is already registered. Please sign in or reset your password.';
  }

  return normalizedMessage;
};

export const supabaseAuthService = {
  // Register new user with email verification
  async register(email, password, userData = {}) {
    try {
      console.log('🔐 Registering user with Supabase:', email);

      // Sign up with Supabase (email verification is enabled by default)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData, // student_id, name, institution, etc.
          },
          emailRedirectTo: resolveEmailRedirectTo(), // Platform-aware verification redirect
        },
      });

      if (error) {
        console.error('❌ Supabase registration error:', error);
        return {
          success: false,
          error: formatSupabaseError(error, 'Registration failed'),
        };
      }

      console.log('✅ User registered successfully:', data.user?.id);

      // Ensure user profile is created (even before email verification)
      if (data.user) {
        await this.ensureUserProfile(data.user);
      }

      // Check if email verification is required
      if (data.user && !data.session) {
        // Email verification required
        return {
          success: true,
          requiresVerification: true,
          message: 'Please check your email to verify your account before logging in.',
          user: data.user,
        };
      }

      // If session exists, user is already verified (or email verification is disabled)
      if (data.session) {
        await this.saveSession(data.session, data.user);
        
        // Ensure user profile exists
        await this.ensureUserProfile(data.user);
        
        return {
          success: true,
          requiresVerification: false,
          data: {
            token: data.session.access_token,
            user: this.transformUser(data.user),
          },
        };
      }

      return {
        success: true,
        requiresVerification: true,
        message: 'Registration successful. Please verify your email.',
        user: data.user,
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        error: formatSupabaseError(error, 'Registration failed'),
      };
    }
  },

  // Login with email and password
  async login(email, password) {
    try {
      console.log('🔐 Logging in with Supabase:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase login error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Please verify your email before logging in. Check your inbox for the verification link.',
            requiresVerification: true,
          };
        }

        return {
          success: false,
          error: error.message || 'Login failed',
        };
      }

      if (data.session && data.user) {
        await this.saveSession(data.session, data.user);
        
        // Ensure user profile exists in database
        await this.ensureUserProfile(data.user);
        
        console.log('✅ User logged in successfully');

        return {
          success: true,
          data: {
            token: data.session.access_token,
            user: this.transformUser(data.user),
          },
        };
      }

      return {
        success: false,
        error: 'Login failed - invalid response',
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  },

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      console.log('📧 Resending verification email to:', email);

      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: resolveEmailRedirectTo(),
        },
      });

      if (error) {
        console.error('❌ Resend verification error:', error);
        return {
          success: false,
          error: formatSupabaseError(error, 'Failed to resend verification email'),
        };
      }

      return {
        success: true,
        message: 'Verification email sent. Please check your inbox.',
      };
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      return {
        success: false,
        error: formatSupabaseError(error, 'Failed to resend verification email'),
      };
    }
  },

  // Verify email with token (from URL hash)
  async verifyEmail(token) {
    try {
      console.log('✅ Verifying email with token');

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        console.error('❌ Email verification error:', error);
        return {
          success: false,
          error: error.message || 'Email verification failed',
        };
      }

      if (data.session && data.user) {
        await this.saveSession(data.session, data.user);
        
        // Ensure user profile exists in database
        await this.ensureUserProfile(data.user);
        
        return {
          success: true,
          data: {
            token: data.session.access_token,
            user: this.transformUser(data.user),
          },
        };
      }

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      console.error('❌ Email verification error:', error);
      return {
        success: false,
        error: error.message || 'Email verification failed',
      };
    }
  },

  // Verify email from URL (handles hash fragments)
  async verifyEmailFromURL(url) {
    try {
      console.log('✅ Verifying email from URL:', url);
      
      // Extract token from URL hash
      const urlObj = new URL(url);
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      if (type === 'email' && accessToken) {
        // Set session from URL tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('❌ Error setting session from URL:', error);
          return {
            success: false,
            error: error.message || 'Email verification failed',
          };
        }

        if (data.session && data.user) {
          await this.saveSession(data.session, data.user);
          
          // Ensure user profile exists in database
          await this.ensureUserProfile(data.user);
          
          return {
            success: true,
            data: {
              token: data.session.access_token,
              user: this.transformUser(data.user),
            },
          };
        }
      }
      
      return {
        success: false,
        error: 'Invalid verification link',
      };
    } catch (error) {
      console.error('❌ Email verification from URL error:', error);
      return {
        success: false,
        error: error.message || 'Email verification failed',
      };
    }
  },

  // Ensure user profile exists in database
  async ensureUserProfile(user) {
    try {
      if (!user) return;

      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create it
      if (!existingProfile && fetchError?.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            student_id: user.user_metadata?.student_id || null,
            name: user.user_metadata?.name || user.email?.split('@')[0] || '',
            institution: user.user_metadata?.institution || null,
            role: user.user_metadata?.role || 'student',
          });

        if (insertError) {
          console.error('❌ Error creating user profile:', insertError);
        } else {
          console.log('✅ User profile created in database');
        }
      } else if (existingProfile) {
        // Update profile if metadata changed
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            student_id: user.user_metadata?.student_id || existingProfile.student_id,
            name: user.user_metadata?.name || existingProfile.name,
            institution: user.user_metadata?.institution || existingProfile.institution,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('❌ Error updating user profile:', updateError);
        }
      }
    } catch (error) {
      console.error('❌ Error ensuring user profile:', error);
    }
  },

  // Logout
  async logout() {
    try {
      console.log('👋 Logging out from Supabase');

      const { error } = await supabase.auth.signOut();

      // Clear local storage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      if (error) {
        console.error('❌ Logout error:', error);
        return {
          success: false,
          error: error.message || 'Logout failed',
        };
      }

      console.log('✅ User logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear storage even if logout fails
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('❌ Get current user error:', error);
        return null;
      }

      return user ? this.transformUser(user) : null;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  },

  // Get current session
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Get session error:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('❌ Get session error:', error);
      return null;
    }
  },

  // Refresh session
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('❌ Refresh session error:', error);
        return null;
      }

      if (data.session) {
        await this.saveSession(data.session, data.user);
        return data.session;
      }

      return null;
    } catch (error) {
      console.error('❌ Refresh session error:', error);
      return null;
    }
  },

  // Save session to storage
  async saveSession(session, user) {
    try {
      if (session?.access_token) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.access_token);
      }
      if (session?.refresh_token) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.refresh_token);
      }
      if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(this.transformUser(user)));
      }
    } catch (error) {
      console.error('❌ Error saving session:', error);
    }
  },

  // Transform Supabase user to app format
  transformUser(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.full_name || '',
      student_id: user.user_metadata?.student_id || '',
      institution: user.user_metadata?.institution || '',
      role: user.user_metadata?.role || 'student',
      email_verified: user.email_confirmed_at ? true : false,
      created_at: user.created_at,
      metadata: user.user_metadata || {},
    };
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email);
      callback(event, session);
    });
  },

  // Reset password
  async resetPassword(email) {
    try {
      console.log('🔑 Resetting password for:', email);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'tracksy://reset-password',
      });

      if (error) {
        console.error('❌ Reset password error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send password reset email',
        };
      }

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      };
    } catch (error) {
      console.error('❌ Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send password reset email',
      };
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      console.log('🔑 Updating password');

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('❌ Update password error:', error);
        return {
          success: false,
          error: error.message || 'Failed to update password',
        };
      }

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      console.error('❌ Update password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update password',
      };
    }
  },
};

export default supabaseAuthService;

