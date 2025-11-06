import { supabase } from '../config/supabase';
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
  // Log an admin action
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

      // Insert into Supabase
      const { error } = await supabase.from('audit_logs').insert(logEntry);

      if (error) {
        console.error('Failed to log audit entry:', error);
        // Don't throw - audit logging should not break the app
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

  // Get audit logs for current admin
  async getMyAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return [];

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('admin_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  // Get all audit logs (admin only)
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

      let query = supabase.from('audit_logs').select('*');

      if (filters?.adminId) {
        query = query.eq('admin_id', filters.adminId);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }
}

export default new AuditLogService();
