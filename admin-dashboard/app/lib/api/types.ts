// Centralized type exports to avoid Vite HMR cache issues
// This file ensures types are always available

export interface Bus {
  id: string;
  bus_number: string;
  license_plate: string;
  bus_type: 'standard' | 'premium' | 'luxury';
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance' | 'emergency';
  route_id?: string;
  route_name?: string;
  driver_id?: string;
  driver_name?: string;
  current_latitude?: number;
  current_longitude?: number;
  last_location_update?: string;
  created_at: string;
  updated_at: string;
}

export interface BusFilters {
  status?: string;
  route_id?: string;
  driver_id?: string;
  search?: string;
}

export interface BusListResponse {
  buses: Bus[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}
