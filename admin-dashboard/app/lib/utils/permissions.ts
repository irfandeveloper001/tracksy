import { AdminRole } from '../api/authService';
import type { AdminUser } from '../api/authService';

// Permission constants
export const PERMISSIONS = {
  // User Management
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  
  // Bus Management
  BUSES_VIEW: 'buses:view',
  BUSES_CREATE: 'buses:create',
  BUSES_EDIT: 'buses:edit',
  BUSES_DELETE: 'buses:delete',
  
  // Route Management
  ROUTES_VIEW: 'routes:view',
  ROUTES_CREATE: 'routes:create',
  ROUTES_EDIT: 'routes:edit',
  ROUTES_DELETE: 'routes:delete',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_GENERATE: 'reports:generate',
  
  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  
  // Alerts
  ALERTS_VIEW: 'alerts:view',
  ALERTS_MANAGE: 'alerts:manage',
  
  // System
  SYSTEM_ADMIN: 'system:admin',
} as const;

// Default permissions for each role
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions
  [AdminRole.ADMIN]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.BUSES_VIEW,
    PERMISSIONS.BUSES_CREATE,
    PERMISSIONS.BUSES_EDIT,
    PERMISSIONS.BUSES_DELETE,
    PERMISSIONS.ROUTES_VIEW,
    PERMISSIONS.ROUTES_CREATE,
    PERMISSIONS.ROUTES_EDIT,
    PERMISSIONS.ROUTES_DELETE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.ALERTS_VIEW,
    PERMISSIONS.ALERTS_MANAGE,
  ],
  [AdminRole.MANAGER]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.BUSES_VIEW,
    PERMISSIONS.BUSES_EDIT,
    PERMISSIONS.ROUTES_VIEW,
    PERMISSIONS.ROUTES_EDIT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.ALERTS_VIEW,
    PERMISSIONS.ALERTS_MANAGE,
  ],
  [AdminRole.VIEWER]: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.BUSES_VIEW,
    PERMISSIONS.ROUTES_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ALERTS_VIEW,
  ],
};

// Check if user has permission
export function hasPermission(user: AdminUser | null, permission: string): boolean {
  if (!user) return false;
  
  // Super admin has all permissions
  if (user.role === AdminRole.SUPER_ADMIN) return true;
  
  if (user.permissions && user.permissions.length > 0) {
    return user.permissions.includes(permission);
  }

  // Fall back to role defaults when backend does not supply permissions.
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
}

// Check if user has any of the permissions
export function hasAnyPermission(user: AdminUser | null, permissions: string[]): boolean {
  if (!user) return false;
  if (user.role === AdminRole.SUPER_ADMIN) return true;
  
  return permissions.some(permission => hasPermission(user, permission));
}

// Check if user has all permissions
export function hasAllPermissions(user: AdminUser | null, permissions: string[]): boolean {
  if (!user) return false;
  if (user.role === AdminRole.SUPER_ADMIN) return true;
  
  return permissions.every(permission => hasPermission(user, permission));
}

// Get default permissions for a role
export function getRolePermissions(role: AdminRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Check if user has role
export function hasRole(user: AdminUser | null, role: AdminRole): boolean {
  if (!user) return false;
  return user.role === role;
}

// Check if user has minimum role level
export function hasMinimumRole(user: AdminUser | null, minimumRole: AdminRole): boolean {
  if (!user) return false;
  
  const roleHierarchy = {
    [AdminRole.SUPER_ADMIN]: 4,
    [AdminRole.ADMIN]: 3,
    [AdminRole.MANAGER]: 2,
    [AdminRole.VIEWER]: 1,
  };
  
  const userRoleLevel = roleHierarchy[user.role] || 0;
  const minimumRoleLevel = roleHierarchy[minimumRole] || 0;
  
  return userRoleLevel >= minimumRoleLevel;
}
