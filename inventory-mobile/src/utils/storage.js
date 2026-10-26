import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// In-memory fallback for environments without SecureStore support (e.g. tests, web)
const memoryStore = new Map();

const isSecureStoreAvailable = async () => {
  if (Platform.OS === 'web' || typeof jest !== 'undefined' || process.env.NODE_ENV === 'test') {
    return false;
  }
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

export const storage = {
  /**
   * Save a secure string value (e.g., JWT token)
   */
  async setItem(key, value) {
    if (value === null || value === undefined) {
      await this.removeItem(key);
      return;
    }
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.setItemAsync(key, stringValue);
        return;
      }
    } catch (e) {
      // Fallback
    }
    memoryStore.set(key, stringValue);
  },

  /**
   * Retrieve a secure string value
   */
  async getItem(key) {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        const val = await SecureStore.getItemAsync(key);
        if (val !== null && val !== undefined) return val;
      }
    } catch (e) {
      // Fallback
    }
    return memoryStore.get(key) || null;
  },

  /**
   * Retrieve and JSON-parse an item
   */
  async getObject(key) {
    const val = await this.getItem(key);
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  },

  /**
   * Remove a stored key
   */
  async removeItem(key) {
    try {
      const available = await isSecureStoreAvailable();
      if (available) {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      // Fallback
    }
    memoryStore.delete(key);
  },

  /**
   * Clear all stored memory items
   */
  async clear() {
    memoryStore.clear();
  },
};

export default storage;
