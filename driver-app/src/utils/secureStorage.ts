// Secure storage utility for sensitive data
// Uses AsyncStorage for now, but can be upgraded to expo-secure-store or react-native-keychain

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// Simple encryption/decryption (for production, use proper encryption library)
const ENCRYPTION_KEY = 'tracksy_driver_secret_key'; // In production, use secure key management

class SecureStorage {
  // Encrypt data (simple base64 encoding - upgrade to AES in production)
  private encrypt(data: string): string {
    // Simple encoding for demo - use proper encryption in production
    // Using btoa for base64 encoding (works in React Native)
    if (typeof btoa !== 'undefined') {
      return btoa(data);
    }
    // Fallback for Node.js environment
    return Buffer.from(data).toString('base64');
  }

  // Decrypt data
  private decrypt(encryptedData: string): string {
    try {
      // Using atob for base64 decoding (works in React Native)
      if (typeof atob !== 'undefined') {
        return atob(encryptedData);
      }
      // Fallback for Node.js environment
      return Buffer.from(encryptedData, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Store secure token
  async setToken(token: string): Promise<void> {
    try {
      const encrypted = this.encrypt(token);
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, encrypted);
    } catch (error) {
      console.error('Error storing token:', error);
      throw error;
    }
  }

  // Get secure token
  async getToken(): Promise<string | null> {
    try {
      const encrypted = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!encrypted) return null;
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  // Remove token
  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  }

  // Store sensitive user data
  async setSecureData(key: string, data: any): Promise<void> {
    try {
      const encrypted = this.encrypt(JSON.stringify(data));
      await AsyncStorage.setItem(`@secure:${key}`, encrypted);
    } catch (error) {
      console.error('Error storing secure data:', error);
      throw error;
    }
  }

  // Get sensitive user data
  async getSecureData(key: string): Promise<any | null> {
    try {
      const encrypted = await AsyncStorage.getItem(`@secure:${key}`);
      if (!encrypted) return null;
      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  // Remove sensitive data
  async removeSecureData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`@secure:${key}`);
    } catch (error) {
      console.error('Error removing secure data:', error);
      throw error;
    }
  }

  // Clear all secure data
  async clearAll(): Promise<void> {
    try {
      await this.removeToken();
      // Remove other secure keys as needed
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter((key) => key.startsWith('@secure:'));
      await AsyncStorage.multiRemove(secureKeys);
    } catch (error) {
      console.error('Error clearing secure data:', error);
      throw error;
    }
  }
}

export default new SecureStorage();

