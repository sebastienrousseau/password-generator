// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Port interface for storage operations.
 *
 * This port abstracts storage operations to enable different implementations
 * (file system, in-memory, remote storage, database, etc.).
 *
 * Used for reading configuration files, storing user preferences,
 * and managing persistent state.
 *
 * @interface StoragePort
 */
export class StoragePort {
  /**
   * Reads a file and returns its contents as a string.
   *
   * @param {string} filePath - The path to the file to read.
   * @param {Object} [options] - Optional read options.
   * @param {string} [options.encoding='utf8'] - The file encoding.
   * @returns {Promise<string>} A promise resolving to the file contents.
   * @throws {Error} If the file cannot be read or does not exist.
   * @abstract
   */
  async readFile(filePath, options = { encoding: 'utf8' }) {
    throw new Error("StoragePort.readFile() must be implemented");
  }

  /**
   * Writes content to a file.
   *
   * @param {string} filePath - The path to the file to write.
   * @param {string} content - The content to write.
   * @param {Object} [options] - Optional write options.
   * @param {string} [options.encoding='utf8'] - The file encoding.
   * @param {boolean} [options.createDirectories=false] - Whether to create parent directories.
   * @returns {Promise<void>} A promise that resolves when writing completes.
   * @throws {Error} If the file cannot be written.
   * @abstract
   */
  async writeFile(filePath, content, options = { encoding: 'utf8', createDirectories: false }) {
    throw new Error("StoragePort.writeFile() must be implemented");
  }

  /**
   * Checks if a file or directory exists.
   *
   * @param {string} path - The path to check.
   * @returns {Promise<boolean>} A promise resolving to true if the path exists.
   * @abstract
   */
  async exists(path) {
    throw new Error("StoragePort.exists() must be implemented");
  }

  /**
   * Lists the contents of a directory.
   *
   * @param {string} directoryPath - The path to the directory.
   * @param {Object} [options] - Optional listing options.
   * @param {boolean} [options.recursive=false] - Whether to list recursively.
   * @returns {Promise<string[]>} A promise resolving to an array of file/directory names.
   * @throws {Error} If the directory cannot be read.
   * @abstract
   */
  async listDirectory(directoryPath, options = { recursive: false }) {
    throw new Error("StoragePort.listDirectory() must be implemented");
  }

  /**
   * Creates a directory (and parent directories if needed).
   *
   * @param {string} directoryPath - The path to the directory to create.
   * @param {Object} [options] - Optional creation options.
   * @param {boolean} [options.recursive=true] - Whether to create parent directories.
   * @returns {Promise<void>} A promise that resolves when creation completes.
   * @throws {Error} If the directory cannot be created.
   * @abstract
   */
  async createDirectory(directoryPath, options = { recursive: true }) {
    throw new Error("StoragePort.createDirectory() must be implemented");
  }

  /**
   * Deletes a file.
   *
   * @param {string} filePath - The path to the file to delete.
   * @returns {Promise<void>} A promise that resolves when deletion completes.
   * @throws {Error} If the file cannot be deleted or does not exist.
   * @abstract
   */
  async deleteFile(filePath) {
    throw new Error("StoragePort.deleteFile() must be implemented");
  }

  /**
   * Gets file metadata (size, modification time, etc.).
   *
   * @param {string} filePath - The path to the file.
   * @returns {Promise<Object>} A promise resolving to file metadata.
   * @throws {Error} If the file metadata cannot be retrieved.
   * @abstract
   */
  async getFileMetadata(filePath) {
    throw new Error("StoragePort.getFileMetadata() must be implemented");
  }

  /**
   * Reads and parses a JSON file.
   *
   * @param {string} filePath - The path to the JSON file.
   * @returns {Promise<Object>} A promise resolving to the parsed JSON object.
   * @throws {Error} If the file cannot be read or is not valid JSON.
   * @abstract
   */
  async readJsonFile(filePath) {
    throw new Error("StoragePort.readJsonFile() must be implemented");
  }

  /**
   * Writes an object as JSON to a file.
   *
   * @param {string} filePath - The path to the JSON file.
   * @param {Object} data - The object to serialize as JSON.
   * @param {Object} [options] - Optional write options.
   * @param {boolean} [options.pretty=false] - Whether to format JSON with indentation.
   * @returns {Promise<void>} A promise that resolves when writing completes.
   * @throws {Error} If the data cannot be serialized or written.
   * @abstract
   */
  async writeJsonFile(filePath, data, options = { pretty: false }) {
    throw new Error("StoragePort.writeJsonFile() must be implemented");
  }

  /**
   * Appends content to an existing file.
   *
   * @param {string} filePath - The path to the file to append to.
   * @param {string} content - The content to append.
   * @param {Object} [options] - Optional append options.
   * @param {string} [options.encoding='utf8'] - The file encoding.
   * @returns {Promise<void>} A promise that resolves when appending completes.
   * @throws {Error} If the content cannot be appended.
   * @abstract
   */
  async appendFile(filePath, content, options = { encoding: 'utf8' }) {
    throw new Error("StoragePort.appendFile() must be implemented");
  }
}