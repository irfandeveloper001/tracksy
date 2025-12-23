import api from './client';

export interface Stop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateStopData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

class StopService {
  async createStop(stopData: CreateStopData): Promise<Stop> {
    try {
      const response = await api.post('/admin/stops', stopData);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Failed to create stop:', error);
      throw new Error(error.response?.data?.message || 'Failed to create stop');
    }
  }

  async getStops(): Promise<Stop[]> {
    try {
      const response = await api.get('/admin/stops');
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Failed to fetch stops:', error);
      return [];
    }
  }
}

export default new StopService();
