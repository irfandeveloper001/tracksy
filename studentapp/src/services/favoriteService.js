import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITE_ROUTES_KEY = '@tracksy_student:favorite_routes';
const FAVORITE_STOPS_KEY = '@tracksy_student:favorite_stops';

export const favoriteService = {
  // Favorite Routes
  async getFavoriteRoutes() {
    try {
      const data = await AsyncStorage.getItem(FAVORITE_ROUTES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting favorite routes:', error);
      return [];
    }
  },

  async addFavoriteRoute(routeId) {
    try {
      const favorites = await this.getFavoriteRoutes();
      if (!favorites.includes(routeId)) {
        favorites.push(routeId);
        await AsyncStorage.setItem(FAVORITE_ROUTES_KEY, JSON.stringify(favorites));
      }
      return favorites;
    } catch (error) {
      console.error('Error adding favorite route:', error);
      return [];
    }
  },

  async removeFavoriteRoute(routeId) {
    try {
      const favorites = await this.getFavoriteRoutes();
      const updated = favorites.filter((id) => id !== routeId);
      await AsyncStorage.setItem(FAVORITE_ROUTES_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error removing favorite route:', error);
      return [];
    }
  },

  async isFavoriteRoute(routeId) {
    try {
      const favorites = await this.getFavoriteRoutes();
      return favorites.includes(routeId);
    } catch (error) {
      return false;
    }
  },

  // Favorite Stops
  async getFavoriteStops() {
    try {
      const data = await AsyncStorage.getItem(FAVORITE_STOPS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting favorite stops:', error);
      return [];
    }
  },

  async addFavoriteStop(stopId) {
    try {
      const favorites = await this.getFavoriteStops();
      if (!favorites.includes(stopId)) {
        favorites.push(stopId);
        await AsyncStorage.setItem(FAVORITE_STOPS_KEY, JSON.stringify(favorites));
      }
      return favorites;
    } catch (error) {
      console.error('Error adding favorite stop:', error);
      return [];
    }
  },

  async removeFavoriteStop(stopId) {
    try {
      const favorites = await this.getFavoriteStops();
      const updated = favorites.filter((id) => id !== stopId);
      await AsyncStorage.setItem(FAVORITE_STOPS_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error removing favorite stop:', error);
      return [];
    }
  },

  async isFavoriteStop(stopId) {
    try {
      const favorites = await this.getFavoriteStops();
      return favorites.includes(stopId);
    } catch (error) {
      return false;
    }
  },
};

