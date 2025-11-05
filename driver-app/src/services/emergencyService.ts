import api from './api/api';
import { LocationData } from './location/locationService';
import offlineService from './offlineService';

export type EmergencyType = 'accident' | 'breakdown' | 'medical' | 'other';

export interface EmergencyAlert {
  type: EmergencyType;
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface IncidentReport {
  type: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  photo_url?: string;
}

class EmergencyService {
  // Send emergency alert
  async sendEmergency(alert: EmergencyAlert): Promise<any> {
    try {
      const response = await api.post('/driver/emergency', alert);
      const result = response.data.data || response.data;
      return result;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to send emergency alert';
      throw new Error(errorMessage);
    }
  }

  // Report incident
  async reportIncident(report: IncidentReport): Promise<any> {
    try {
      // Check if online
      const isOnline = await offlineService.isOnline();
      
      if (!isOnline) {
        // Queue for offline sync
        console.log('⚠️ Offline - queueing incident report');
        await offlineService.queueIncidentReport(report);
        return { queued: true, message: 'Incident report queued for sync' };
      }

      const response = await api.post('/driver/incidents', report);
      const result = response.data.data || response.data;
      return result;
    } catch (error: any) {
      // Network error - queue for offline sync
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.log('⚠️ Network error - queueing incident report');
        await offlineService.queueIncidentReport(report);
        return { queued: true, message: 'Incident report queued for sync' };
      }
      
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to report incident';
      throw new Error(errorMessage);
    }
  }
}

export default new EmergencyService();

