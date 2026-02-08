// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Web LocalStorage adapter for browser environments.
 *
 * This adapter provides a standardized storage interface that abstracts
 * browser localStorage with fallbacks and validation for password generator
 * configuration persistence.
 *
 * @module WebLocalStorage
 */

/**
 * Storage keys used by the password generator.
 */
export const StorageKeys = {
  USER_PREFERENCES: 'pwd_gen_preferences',
  LAST_CONFIG: 'pwd_gen_last_config',
  AUDIT_HISTORY: 'pwd_gen_audit_history',
  THEME_SETTINGS: 'pwd_gen_theme',
};

/**
 * Default storage configuration.
 */
const DEFAULT_CONFIG = {
  prefix: 'pwd_gen_',
  maxHistoryEntries: 50,
  compressionThreshold: 1024, // bytes
  encryptSensitiveData: false,
};

/**
 * Web LocalStorage adapter class with enhanced features.
 */
export class WebLocalStorage {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.available = this._checkAvailability();
    this.fallbackStorage = new Map(); // In-memory fallback
  }

  /**
   * Checks if localStorage is available in the current environment.
   * @returns {boolean} True if localStorage is available.
   */
  _checkAvailability() {
    try {
      if (typeof localStorage === 'undefined') {
        return false;
      }

      const testKey = `${this.config.prefix}test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      // localStorage may be disabled or in private browsing mode
      return false;
    }
  }

  /**
   * Adds the configured prefix to a storage key.
   * @param {string} key The base key.
   * @returns {string} The prefixed key.
   */
  _prefixKey(key) {
    return `${this.config.prefix}${key}`;
  }

  /**
   * Safely serializes data to JSON with error handling.
   * Handles circular references gracefully by replacing them with a placeholder.
   * @param {any} data The data to serialize.
   * @returns {string|null} JSON string or null if serialization fails.
   */
  _serialize(data) {
    try {
      const seen = new WeakSet();
      let hasCircular = false;
      const result = JSON.stringify(data, (key, value) => {
        // Handle non-object values directly
        if (typeof value !== 'object' || value === null) {
          return value;
        }
        // Check for circular reference
        if (seen.has(value)) {
          hasCircular = true;
          return undefined; // Exclude circular references
        }
        seen.add(value);
        return value;
      });
      // Return null if circular references were detected
      if (hasCircular) {
        console.warn('Circular reference detected in data for storage');
        return null;
      }
      return result;
    } catch (error) {
      console.warn('Failed to serialize data for storage:', error);
      return null;
    }
  }

  /**
   * Safely deserializes JSON data with error handling.
   * @param {string} jsonString The JSON string to parse.
   * @returns {any|null} Parsed data or null if deserialization fails.
   */
  _deserialize(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Failed to deserialize data from storage:', error);
      return null;
    }
  }

  /**
   * Stores data with the given key.
   * @param {string} key The storage key.
   * @param {any} value The value to store.
   * @param {Object} options Storage options.
   * @returns {boolean} True if storage was successful.
   */
  setItem(key, value, options = {}) {
    const prefixedKey = this._prefixKey(key);
    const serializedValue = this._serialize(value);

    if (serializedValue === null) {
      return false;
    }

    try {
      if (this.available) {
        // Add metadata if specified
        const storageData = {
          value,
          timestamp: Date.now(),
          ...options.metadata,
        };

        localStorage.setItem(prefixedKey, this._serialize(storageData));
      } else {
        // Use fallback storage
        this.fallbackStorage.set(prefixedKey, { value, timestamp: Date.now() });
      }

      return true;
    } catch (error) {
      // Storage quota exceeded or other error
      console.warn('Failed to store data:', error);

      if (options.fallbackToMemory !== false) {
        this.fallbackStorage.set(prefixedKey, { value, timestamp: Date.now() });
        return true;
      }

      return false;
    }
  }

  /**
   * Retrieves data for the given key.
   * @param {string} key The storage key.
   * @param {any} defaultValue Default value if key doesn't exist.
   * @returns {any} The stored value or default value.
   */
  getItem(key, defaultValue = null) {
    const prefixedKey = this._prefixKey(key);

    try {
      if (this.available) {
        const item = localStorage.getItem(prefixedKey);
        if (item === null) {
          return defaultValue;
        }

        const storageData = this._deserialize(item);
        if (storageData && typeof storageData === 'object' && 'value' in storageData) {
          return storageData.value;
        }

        // Handle legacy data without metadata
        return storageData || defaultValue;
      } else {
        // Use fallback storage
        const fallbackData = this.fallbackStorage.get(prefixedKey);
        return fallbackData ? fallbackData.value : defaultValue;
      }
    } catch (error) {
      console.warn('Failed to retrieve data:', error);
      return defaultValue;
    }
  }

  /**
   * Removes data for the given key.
   * @param {string} key The storage key.
   * @returns {boolean} True if removal was successful.
   */
  removeItem(key) {
    const prefixedKey = this._prefixKey(key);

    try {
      if (this.available) {
        localStorage.removeItem(prefixedKey);
      } else {
        this.fallbackStorage.delete(prefixedKey);
      }
      return true;
    } catch (error) {
      console.warn('Failed to remove data:', error);
      return false;
    }
  }

  /**
   * Checks if a key exists in storage.
   * @param {string} key The storage key.
   * @returns {boolean} True if the key exists.
   */
  hasItem(key) {
    const prefixedKey = this._prefixKey(key);

    if (this.available) {
      return localStorage.getItem(prefixedKey) !== null;
    } else {
      return this.fallbackStorage.has(prefixedKey);
    }
  }

  /**
   * Clears all data with the configured prefix.
   * @returns {boolean} True if clearing was successful.
   */
  clear() {
    try {
      if (this.available) {
        // Remove only items with our prefix
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.config.prefix)) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key));
      } else {
        // Clear fallback storage items with our prefix
        for (const key of this.fallbackStorage.keys()) {
          if (key.startsWith(this.config.prefix)) {
            this.fallbackStorage.delete(key);
          }
        }
      }

      return true;
    } catch (error) {
      console.warn('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Gets all keys with the configured prefix.
   * @returns {string[]} Array of unprefixed keys.
   */
  getAllKeys() {
    const keys = [];

    try {
      if (this.available) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this.config.prefix)) {
            keys.push(key.substring(this.config.prefix.length));
          }
        }
      } else {
        for (const key of this.fallbackStorage.keys()) {
          if (key.startsWith(this.config.prefix)) {
            keys.push(key.substring(this.config.prefix.length));
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get keys:', error);
    }

    return keys;
  }

  /**
   * Gets storage usage information.
   * @returns {Object} Storage usage statistics.
   */
  getUsageInfo() {
    if (!this.available) {
      return {
        available: false,
        totalSize: 0,
        usedSize: this.fallbackStorage.size,
        itemCount: this.fallbackStorage.size,
        fallbackMode: true,
      };
    }

    try {
      let usedSize = 0;
      let itemCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.config.prefix)) {
          const value = localStorage.getItem(key);
          usedSize += key.length + (value ? value.length : 0);
          itemCount++;
        }
      }

      return {
        available: true,
        totalSize: 5 * 1024 * 1024, // 5MB typical localStorage limit
        usedSize,
        itemCount,
        fallbackMode: false,
      };
    } catch (error) {
      return { available: false, error: error.message, fallbackMode: false };
    }
  }
}

/**
 * Default storage instance for immediate use.
 */
export const storage = new WebLocalStorage();

/**
 * Simple storage adapter that provides a basic key-value interface.
 */
export const webStorage = {
  setItem: (key, value) => storage.setItem(key, value),
  getItem: (key, defaultValue) => storage.getItem(key, defaultValue),
  removeItem: (key) => storage.removeItem(key),
  hasItem: (key) => storage.hasItem(key),
  clear: () => storage.clear(),
  getAllKeys: () => storage.getAllKeys(),
};

export default WebLocalStorage;
