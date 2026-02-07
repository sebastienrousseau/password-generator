// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Browser implementation of StoragePort using Web Storage API.
 *
 * This adapter provides persistent storage for browser environments
 * using localStorage or sessionStorage.
 */

import { StoragePort } from "../../../../packages/core/src/ports/StoragePort.js";

/**
 * Browser-based storage adapter using Web Storage API.
 * Implements StoragePort for localStorage/sessionStorage.
 */
export class BrowserStorage extends StoragePort {
  /**
   * Creates a BrowserStorage instance.
   *
   * @param {Object} options - Configuration options.
   * @param {boolean} [options.sessionOnly=false] - Use sessionStorage instead of localStorage.
   * @param {string} [options.prefix="pwdgen_"] - Key prefix for namespacing.
   */
  constructor(options = {}) {
    super();
    this.prefix = options.prefix ?? "pwdgen_";

    // Determine which storage to use
    if (options.sessionOnly) {
      this.storage = typeof sessionStorage !== "undefined" ? sessionStorage : null;
    } else {
      this.storage = typeof localStorage !== "undefined" ? localStorage : null;
    }
  }

  /**
   * Prefixes a key with the namespace.
   *
   * @param {string} key - The key to prefix.
   * @returns {string} Prefixed key.
   * @private
   */
  _key(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Checks if storage is available.
   *
   * @returns {boolean} True if storage is available.
   * @private
   */
  _isAvailable() {
    if (!this.storage) {
      return false;
    }

    try {
      const testKey = "__storage_test__";
      this.storage.setItem(testKey, testKey);
      this.storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reads a value from storage.
   *
   * @param {string} key - The key to read.
   * @returns {Promise<string|null>} The stored value or null.
   */
  async read(key) {
    if (!this._isAvailable()) {
      return null;
    }

    try {
      return this.storage.getItem(this._key(key));
    } catch {
      return null;
    }
  }

  /**
   * Writes a value to storage.
   *
   * @param {string} key - The key to write.
   * @param {string} content - The content to store.
   * @returns {Promise<void>}
   * @throws {Error} If storage is not available or quota exceeded.
   */
  async write(key, content) {
    if (!this._isAvailable()) {
      throw new Error("Browser storage is not available");
    }

    try {
      this.storage.setItem(this._key(key), content);
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        throw new Error("Storage quota exceeded");
      }
      throw error;
    }
  }

  /**
   * Checks if a key exists in storage.
   *
   * @param {string} key - The key to check.
   * @returns {Promise<boolean>} True if key exists.
   */
  async exists(key) {
    if (!this._isAvailable()) {
      return false;
    }

    return this.storage.getItem(this._key(key)) !== null;
  }

  /**
   * Deletes a key from storage.
   *
   * @param {string} key - The key to delete.
   * @returns {Promise<boolean>} True if key was deleted.
   */
  async delete(key) {
    if (!this._isAvailable()) {
      return false;
    }

    const existed = await this.exists(key);
    this.storage.removeItem(this._key(key));
    return existed;
  }

  /**
   * Clears all keys with the configured prefix.
   *
   * @returns {Promise<void>}
   */
  async clear() {
    if (!this._isAvailable()) {
      return;
    }

    const keysToRemove = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      this.storage.removeItem(key);
    }
  }
}
