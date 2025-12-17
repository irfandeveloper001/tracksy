import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { useAuthStore } from '../../lib/store/authStore';
import { AdminRole } from '../../lib/api/authService';
import { supabase } from '../../lib/config/supabase';

interface ProtectedRouteProps {
  requiredRole?: AdminRole;
  requiredPermission?: string;
  redirectTo?: string;
}

export default function ProtectedRoute({
  requiredRole,
  requiredPermission,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, getCurrentUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        // Try to get current user with timeout
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth check timeout')), 5000)
          );
          await Promise.race([getCurrentUser(), timeoutPromise]);
        } catch (error) {
          console.warn('Auth check failed or timed out:', error);
          // If auth check fails, still allow navigation (will redirect if not authenticated)
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, getCurrentUser]);

  useEffect(() => {
    // Only redirect if we've finished loading and still not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  // Check role-based access
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (requiredRole && !user.role) {
        navigate('/dashboard', { replace: true });
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        // Check if user has sufficient role
        const roleHierarchy = {
          [AdminRole.SUPER_ADMIN]: 4,
          [AdminRole.ADMIN]: 3,
          [AdminRole.MANAGER]: 2,
          [AdminRole.VIEWER]: 1,
        };

        const userRoleLevel = roleHierarchy[user.role] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

        if (userRoleLevel < requiredRoleLevel) {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, navigate]);

  // Show loading state only if we're actively loading and haven't timed out
  // Add a timeout to prevent infinite loading - reduced to 1 second
  const [hasTimedOut, setHasTimedOut] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setHasTimedOut(true);
      }, 1000); // 1 second timeout - very aggressive
      
      return () => clearTimeout(timeout);
    } else {
      setHasTimedOut(false);
    }
  }, [isLoading]);

  // Show loading only if loading and not timed out - but allow render if we have a session
  // Check for session in URL or localStorage to bypass loading
  const [hasSession, setHasSession] = useState(false);
  
  useEffect(() => {
    // Check if we have a session token in URL or can get one quickly
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasSession(true);
        }
      } catch (error) {
        // Ignore
      }
    };
    checkSession();
  }, []);

  // Show loading only if loading and not timed out AND no session detected
  if ((isLoading && !hasTimedOut && !hasSession) || (!isAuthenticated && !hasTimedOut && isLoading && !hasSession)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If timed out or not authenticated after loading, redirect
  if (!isLoading && !isAuthenticated) {
    // Small delay to prevent flash
    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 100);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission && !user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return <Outlet />;
}

