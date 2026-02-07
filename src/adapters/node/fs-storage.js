// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Node.js File System Storage adapter.
 *
 * This adapter provides persistent storage using the Node.js file system.
 *
 * @module NodeFsStorage
 */

import { readFile, writeFile, unlink, mkdir, access } from "fs/promises";
import { dirname, join } from "path";
import { StoragePort } from "../../../packages/core/src/ports/index.js";

/**
 * Node.js implementation of StoragePort using the file system.
 */
export class NodeFsStorage extends StoragePort {
  /**
   * Creates a new NodeFsStorage instance.
   *
   * @param {Object} options - Storage options.
   * @param {string} options.basePath - Base directory for storage files.
   * @param {string} options.encoding - File encoding (default: utf8).
   */
  constructor(options = {}) {
    super();
    this.basePath = options.basePath ?? process.cwd();
    this.encoding = options.encoding ?? "utf8";
  }

  /**
   * Resolves a key to a file path.
   *
   * @param {string} key - The storage key.
   * @returns {string} The resolved file path.
   * @private
   */
  _resolvePath(key) {
    // Sanitize key to prevent path traversal
    // First replace ".." to prevent directory traversal, then sanitize other chars
    const sanitized = key
      .replace(/\.\./g, "__") // Replace ".." with "__" to prevent traversal
      .replace(/[^\w.-]/g, "_");
    return join(this.basePath, sanitized);
  }

  /**
   * Ensures the directory exists for the given file path.
   *
   * @param {string} filePath - The file path.
   * @private
   */
  async _ensureDir(filePath) {
    const dir = dirname(filePath);
    try {
      await access(dir);
    } catch {
      await mkdir(dir, { recursive: true });
    }
  }

  /**
   * Reads the contents of a file.
   *
   * @param {string} path - The file path or key.
   * @returns {Promise<string|null>} The file contents or null if not found.
   */
  async readFile(path) {
    try {
      const filePath = this._resolvePath(path);
      return await readFile(filePath, this.encoding);
    } catch (error) {
      if (error.code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  /**
   * Writes content to a file.
   *
   * @param {string} path - The file path or key.
   * @param {string} content - The content to write.
   * @returns {Promise<void>}
   */
  async writeFile(path, content) {
    const filePath = this._resolvePath(path);
    await this._ensureDir(filePath);
    await writeFile(filePath, content, this.encoding);
  }

  /**
   * Checks if a file exists.
   *
   * @param {string} path - The file path or key.
   * @returns {Promise<boolean>} True if the file exists.
   */
  async exists(path) {
    try {
      const filePath = this._resolvePath(path);
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Deletes a file.
   *
   * @param {string} path - The file path or key.
   * @returns {Promise<boolean>} True if the file was deleted.
   */
  async delete(path) {
    try {
      const filePath = this._resolvePath(path);
      await unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Sets the base path for storage operations.
   *
   * @param {string} basePath - The new base path.
   */
  setBasePath(basePath) {
    this.basePath = basePath;
  }
}

export default NodeFsStorage;
