import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { useAuthStore } from '../../lib/store/authStore';
import { AdminRole } from '../../lib/api/authService';

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
        // Try to get current user
        await getCurrentUser();
      }
    };

    checkAuth();
  }, [isAuthenticated, getCurrentUser]);

  useEffect(() => {
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

  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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

