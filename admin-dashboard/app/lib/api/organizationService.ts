import api from './client';

export interface Organization {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationFilters {
  status?: string;
  search?: string;
}

export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

class OrganizationService {
  // Get all organizations
  async getOrganizations(
    page: number = 1,
    perPage: number = 20,
    filters?: OrganizationFilters
  ): Promise<OrganizationListResponse> {
    try {
      const params: any = {
        page,
        per_page: perPage,
        ...filters,
      };

      const response = await api.get('/admin/organizations', { params });
      return response.data.data || response.data;
    } catch (error: any) {
      if (!error.response || error.response.status === 500) {
        console.warn('⚠️ Backend unavailable, returning empty organizations list');
        return {
          organizations: [],
          total: 0,
          current_page: 1,
          per_page: perPage,
          last_page: 1,
        };
      }
      throw error;
    }
  }

  // Get single organization
  async getOrganizationById(organizationId: string): Promise<Organization> {
    try {
      const response = await api.get(`/admin/organizations/${organizationId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch organization'
      );
    }
  }

  // Delete organization
  async deleteOrganization(organizationId: string): Promise<void> {
    try {
      await api.delete(`/admin/organizations/${organizationId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete organization'
      );
    }
  }

  // Delete multiple organizations
  async deleteOrganizations(organizationIds: string[]): Promise<void> {
    try {
      await api.post('/admin/organizations/bulk-delete', {
        organization_ids: organizationIds,
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete organizations'
      );
    }
  }

  // Update organization status
  async updateOrganizationStatus(
    organizationId: string,
    status: 'active' | 'inactive' | 'pending'
  ): Promise<Organization> {
    try {
      const response = await api.patch(
        `/admin/organizations/${organizationId}/status`,
        { status }
      );
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update organization status'
      );
    }
  }

  // Bulk update organization status
  async bulkUpdateOrganizationStatus(
    organizationIds: string[],
    status: 'active' | 'inactive' | 'pending'
  ): Promise<void> {
    try {
      await api.post('/admin/organizations/bulk-status', {
        organization_ids: organizationIds,
        status,
      });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          'Failed to update organizations status'
      );
    }
  }

  // Create organization
  async createOrganization(
    data: Partial<Organization>
  ): Promise<Organization> {
    try {
      const response = await api.post('/admin/organizations', data);
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to create organization'
      );
    }
  }

  // Update organization
  async updateOrganization(
    organizationId: string,
    data: Partial<Organization>
  ): Promise<Organization> {
    try {
      const response = await api.put(
        `/admin/organizations/${organizationId}`,
        data
      );
      return response.data.data || response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update organization'
      );
    }
  }
}

const organizationService = new OrganizationService();
export default organizationService;



