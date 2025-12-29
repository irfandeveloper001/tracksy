import api from './client';

export interface Country {
  id: number;
  name: string;
  iso2?: string;
  iso3?: string;
  phone_code?: string;
  capital?: string;
  currency?: string;
  currency_name?: string;
  currency_symbol?: string;
  region?: string;
  subregion?: string;
}

export interface State {
  id: number;
  name: string;
  country_id: number;
  country_code?: string;
  state_code?: string;
  type?: string;
  latitude?: string;
  longitude?: string;
  cities?: City[];
}

export interface City {
  id: number;
  name: string;
  state_id: number;
  state_code?: string;
  country_id: number;
  country_code?: string;
  latitude?: string;
  longitude?: string;
}

export interface University {
  id: number;
  name: string;
  city_id: number;
  address?: string;
  latitude?: number;
  longitude?: number;
}

class LocationService {
  async getCountries(): Promise<Country[]> {
    try {
      const response = await api.get('/admin/locations/countries');
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Failed to fetch countries:', error);
      return [];
    }
  }

  async getStates(countryId: number): Promise<State[]> {
    try {
      const response = await api.get(`/admin/locations/states/${countryId}`);
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Failed to fetch states:', error);
      return [];
    }
  }

  async getCities(stateId: number): Promise<City[]> {
    try {
      const response = await api.get(`/admin/locations/cities/${stateId}`);
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Failed to fetch cities:', error);
      return [];
    }
  }

  async searchLocations(query: string, type: 'country' | 'state' | 'city' | 'all' = 'all'): Promise<any> {
    try {
      const response = await api.get('/admin/locations/search', {
        params: { q: query, type },
      });
      return response.data.data || response.data || {};
    } catch (error: any) {
      console.error('Failed to search locations:', error);
      return {};
    }
  }

  async getUniversities(cityId: number): Promise<University[]>;
  async getUniversities(country: string, state?: string, city?: string): Promise<University[]>;
  async getUniversities(
    cityIdOrCountry: number | string,
    state?: string,
    city?: string
  ): Promise<University[]> {
    try {
      // If first param is a number, use old endpoint (for backward compatibility)
      if (typeof cityIdOrCountry === 'number') {
        const response = await api.get(`/admin/locations/universities/${cityIdOrCountry}`);
        return response.data.data || response.data || [];
      }
      
      // New endpoint: filter by country and state
      const params: any = { country: cityIdOrCountry };
      if (state) params.state = state;
      if (city) params.city = city;
      
      const response = await api.get('/admin/locations/universities', { params });
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error('Failed to fetch universities:', error);
      return [];
    }
  }
  
  /**
   * Get universities by country and state (reusable function)
   */
  async getUniversitiesByCountryAndState(country: string, state: string): Promise<University[]> {
    return this.getUniversities(country, state);
  }
}

export default new LocationService();
