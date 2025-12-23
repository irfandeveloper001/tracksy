// Secure storage service using Expo SecureStore or react-native-keychain
import AsyncStorage from '@react-native-async-storage/async-storage';

// For production, use expo-secure-store or react-native-keychain
// For now, we'll use AsyncStorage with encryption (placeholder)
// In production, replace with actual secure storage

export const secureStorage = {
  // Store token securely
  async setToken(key, value) {
    try {
      // In production, use Expo SecureStore or react-native-keychain
      // await SecureStore.setItemAsync(key, value);
      
      // For now, use AsyncStorage (should be replaced in production)
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error storing token securely:', error);
      return false;
    }
  },

  // Get token securely
  async getToken(key) {
    try {
      // In production, use Expo SecureStore or react-native-keychain
      // return await SecureStore.getItemAsync(key);
      
      // For now, use AsyncStorage
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving token securely:', error);
      return null;
    }
  },

  // Delete token securely
  async deleteToken(key) {
    try {
      // In production, use Expo SecureStore or react-native-keychain
      // await SecureStore.deleteItemAsync(key);
      
      // For now, use AsyncStorage
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error deleting token securely:', error);
      return false;
    }
  },

  // Store sensitive data
  async setSecureItem(key, value) {
    return this.setToken(key, value);
  },

  // Get sensitive data
  async getSecureItem(key) {
    return this.getToken(key);
  },

  // Delete sensitive data
  async deleteSecureItem(key) {
    return this.deleteToken(key);
  },
};

// Note: For production, install and use:
// - expo-secure-store: npm install expo-secure-store
// - or react-native-keychain: npm install react-native-keychain

