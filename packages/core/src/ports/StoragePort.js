// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Port interface for persistent storage operations.
 *
 * This port abstracts storage functionality to enable different implementations
 * (file system, localStorage, IndexedDB, memory, etc.).
 *
 * @interface StoragePort
 */
export class StoragePort {
  /**
   * Reads the contents of a file/key.
   *
   * @param {string} key - The storage key or file path.
   * @returns {Promise<string|null>} The contents or null if not found.
   * @abstract
   */
  async read(_key) {
    throw new Error('StoragePort.read() must be implemented');
  }

  /**
   * Writes content to a file/key.
   *
   * @param {string} key - The storage key or file path.
   * @param {string} content - The content to write.
   * @returns {Promise<void>}
   * @abstract
   */
  async write(_key, _content) {
    throw new Error('StoragePort.write() must be implemented');
  }

  /**
   * Checks if a file/key exists.
   *
   * @param {string} key - The storage key or file path.
   * @returns {Promise<boolean>} True if the key exists.
   * @abstract
   */
  async exists(_key) {
    throw new Error('StoragePort.exists() must be implemented');
  }

  /**
   * Deletes a file/key.
   *
   * @param {string} key - The storage key or file path.
   * @returns {Promise<boolean>} True if the key was deleted.
   * @abstract
   */
  async delete(_key) {
    throw new Error('StoragePort.delete() must be implemented');
  }
}

/**
 * Required methods for StoragePort implementations.
 */
export const STORAGE_REQUIRED_METHODS = ['read', 'write'];

/**
 * Optional methods for StoragePort implementations.
 */
export const STORAGE_OPTIONAL_METHODS = ['exists', 'delete'];

/**
 * In-memory storage implementation for testing.
 */
export class MemoryStorage extends StoragePort {
  constructor() {
    super();
    this.store = new Map();
  }

  async read(key) {
    return this.store.get(key) ?? null;
  }

  async write(key, content) {
    this.store.set(key, content);
  }

  async exists(key) {
    return this.store.has(key);
  }

  async delete(key) {
    return this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}
