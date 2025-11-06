import api from './client';

export interface MaintenanceRecord {
  id: string;
  bus_id: string;
  bus_number?: string;
  maintenance_type: 'routine' | 'repair' | 'inspection' | 'emergency';
  scheduled_date: string;
  completed_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  cost?: number;
  service_provider?: string;
  technician?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceFilters {
  status?: string;
  type?: string;
  bus_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface MaintenanceListResponse {
  records: MaintenanceRecord[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

class MaintenanceService {
  // Get all maintenance records
  async getMaintenanceRecords(
    page: number = 1,
    perPage: number = 20,
    filters?: MaintenanceFilters
  ): Promise<MaintenanceListResponse> {
    try {
      const params: any = {
        page,
        per_page: perPage,
        ...filters,
      };

      const response = await api.get('/admin/maintenance', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning empty maintenance list');
        return {
          records: [],
          total: 0,
          current_page: 1,
          per_page: perPage,
          last_page: 1,
        };
      }
      throw error;
    }
  }

  // Get single maintenance record
  async getMaintenanceRecordById(recordId: string): Promise<MaintenanceRecord> {
    try {
      const response = await api.get(`/admin/maintenance/${recordId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        throw new Error('Backend unavailable');
      }
      throw error;
    }
  }

  // Create maintenance record
  async createMaintenanceRecord(
    recordData: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> {
    try {
      const response = await api.post('/admin/maintenance', recordData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to create maintenance record'
      );
    }
  }

  // Update maintenance record
  async updateMaintenanceRecord(
    recordId: string,
    recordData: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> {
    try {
      const response = await api.put(`/admin/maintenance/${recordId}`, recordData);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update maintenance record'
      );
    }
  }

  // Delete maintenance record
  async deleteMaintenanceRecord(recordId: string): Promise<void> {
    try {
      await api.delete(`/admin/maintenance/${recordId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete maintenance record'
      );
    }
  }

  // Get maintenance schedule
  async getMaintenanceSchedule(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/admin/maintenance/schedule', { params });
      return response.data.data || response.data || [];
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return [];
      }
      return [];
    }
  }

  // Get maintenance costs
  async getMaintenanceCosts(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/admin/maintenance/costs', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        return { total_cost: 0, records: [] };
      }
      return { total_cost: 0, records: [] };
    }
  }
}

export default new MaintenanceService();

