import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export interface AuditLogEntry {
  id?: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

class AuditLogService {
  // Log an admin action - Laravel API only
  async logAction(
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) {
        console.warn('Cannot log audit entry: No authenticated user');
        return;
      }

      // Get IP address and user agent
      const ipAddress = await this.getClientIP();
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;

      const logEntry: AuditLogEntry = {
        admin_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || {},
        ip_address: ipAddress,
        user_agent: userAgent,
      };

      // Insert into Laravel API (if endpoint exists)
      try {
        await api.post('/admin/audit-logs', logEntry);
      } catch (error: any) {
        // If endpoint doesn't exist, just log to console (non-critical)
        if (import.meta.env.DEV) {
          console.log('Audit log (Laravel endpoint may not exist):', logEntry);
        }
      }
    } catch (error) {
      console.error('Error logging audit entry:', error);
      // Don't throw - audit logging should not break the app
    }
  }

  // Get client IP address (simplified - in production, use server-side)
  private async getClientIP(): Promise<string | undefined> {
    try {
      // In a real app, you'd get this from the server
      // For now, return undefined
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  // Get audit logs for current admin - Laravel API only
  async getMyAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return [];

      try {
        const response = await api.get(`/admin/audit-logs?limit=${limit}`);
        return response.data.data || response.data || [];
      } catch (error: any) {
        // If endpoint doesn't exist, return empty array (non-critical)
        if (import.meta.env.DEV) {
          console.warn('Audit logs endpoint may not exist:', error);
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  // Get all audit logs (admin only) - Laravel API only
  async getAllAuditLogs(
    filters?: {
      adminId?: string;
      action?: string;
      resourceType?: string;
      startDate?: string;
      endDate?: string;
    },
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return [];

      // Check if user has permission to view all logs
      // Only super admin and admin can view all logs
      if (user.role !== 'super_admin' && user.role !== 'admin') {
        return await this.getMyAuditLogs(limit);
      }

      try {
        const params = new URLSearchParams();
        if (filters?.adminId) params.append('admin_id', filters.adminId);
        if (filters?.action) params.append('action', filters.action);
        if (filters?.resourceType) params.append('resource_type', filters.resourceType);
        if (filters?.startDate) params.append('start_date', filters.startDate);
        if (filters?.endDate) params.append('end_date', filters.endDate);
        params.append('limit', limit.toString());

        const response = await api.get(`/admin/audit-logs?${params.toString()}`);
        return response.data.data || response.data || [];
      } catch (error: any) {
        // If endpoint doesn't exist, return empty array (non-critical)
        if (import.meta.env.DEV) {
          console.warn('Audit logs endpoint may not exist:', error);
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }
}

export default new AuditLogService();
