// Network connectivity service
import { Platform } from 'react-native';

let NetInfo;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  // Fallback for web or if NetInfo is not available
  NetInfo = null;
}

class NetworkService {
  constructor() {
    this.isConnected = true;
    this.listeners = new Set();
    this.subscription = null;
    this.isWeb = Platform.OS === 'web';
  }

  // Initialize network monitoring
  init() {
    // For web, use browser's navigator.onLine
    if (this.isWeb || !NetInfo) {
      this.isConnected = typeof navigator !== 'undefined' ? navigator.onLine : true;
      this.notifyListeners();
      
      // Listen to browser online/offline events
      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
          this.isConnected = true;
          this.notifyListeners();
        });
        window.addEventListener('offline', () => {
          this.isConnected = false;
          this.notifyListeners();
        });
      }
      return;
    }

    // For native platforms, use NetInfo
    try {
      // Check initial connection state
      NetInfo.fetch().then(state => {
        this.isConnected = state.isConnected ?? false;
        this.notifyListeners();
      }).catch(() => {
        // If NetInfo fails, assume connected
        this.isConnected = true;
        this.notifyListeners();
      });

      // Subscribe to network state changes
      this.subscription = NetInfo.addEventListener(state => {
        const wasConnected = this.isConnected;
        this.isConnected = state.isConnected ?? false;
        
        if (wasConnected !== this.isConnected) {
          this.notifyListeners();
        }
      });
    } catch (error) {
      console.warn('NetworkService init error:', error);
      this.isConnected = true;
      this.notifyListeners();
    }
  }

  // Check if connected
  async checkConnection() {
    if (this.isWeb || !NetInfo) {
      return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }

    try {
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected ?? false;
      return this.isConnected;
    } catch (error) {
      console.warn('NetworkService checkConnection error:', error);
      return true; // Default to connected
    }
  }

  // Add listener for network changes
  onNetworkChange(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.isConnected);
    });
  }

  // Cleanup
  cleanup() {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
    this.listeners.clear();
  }

  // Get connection type
  async getConnectionType() {
    if (this.isWeb || !NetInfo) {
      return 'unknown';
    }

    try {
      const state = await NetInfo.fetch();
      return state.type || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  // Check if connection is slow (mobile data)
  async isSlowConnection() {
    if (this.isWeb || !NetInfo) {
      return false;
    }

    try {
      const state = await NetInfo.fetch();
      return state.type === 'cellular' && state.details?.cellularGeneration !== '4g';
    } catch (error) {
      return false;
    }
  }
}

export default new NetworkService();

