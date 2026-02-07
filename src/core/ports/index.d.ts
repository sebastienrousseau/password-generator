// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * TypeScript definitions for the core ports module.
 * Defines contracts for external dependencies using Ports and Adapters pattern.
 */

// RandomGeneratorPort interface
export declare class RandomGeneratorPort {
  generateRandomBytes(byteLength: number): Promise<Uint8Array>;
  generateRandomInt(max: number): Promise<number>;
  generateRandomBase64(byteLength: number): Promise<string>;
  generateRandomString(length: number, charset: string): Promise<string>;
  validateRandomnessQuality(): Promise<boolean>;
}

// LoggerPort interface
export declare class LoggerPort {
  info(message: string, metadata?: Record<string, any>): Promise<void>;
  warn(message: string, metadata?: Record<string, any>): Promise<void>;
  error(message: string, error?: Error | Record<string, any>): Promise<void>;
  debug(message: string, metadata?: Record<string, any>): Promise<void>;
  recordEntropyUsage(source: string, calls: number, totalEntropy: number, metadata?: Record<string, any>): Promise<void>;
  recordAlgorithmUsage(algorithm: string, metadata?: Record<string, any>): Promise<void>;
  setAuditMode(enabled: boolean): Promise<void>;
  resetAuditSession(): Promise<void>;
  finishAuditSession(): Promise<void>;
  generateAuditReport(): Promise<Record<string, any>>;
  recordPerformanceMetric(operation: string, durationMs: number, metadata?: Record<string, any>): Promise<void>;
}

// StoragePort interface
export declare class StoragePort {
  readFile(filePath: string, options?: { encoding?: string }): Promise<string>;
  writeFile(filePath: string, content: string, options?: { encoding?: string; createDirectories?: boolean }): Promise<void>;
  exists(path: string): Promise<boolean>;
  listDirectory(directoryPath: string, options?: { recursive?: boolean }): Promise<string[]>;
  createDirectory(directoryPath: string, options?: { recursive?: boolean }): Promise<void>;
  deleteFile(filePath: string): Promise<void>;
  getFileMetadata(filePath: string): Promise<Record<string, any>>;
  readJsonFile(filePath: string): Promise<Record<string, any>>;
  writeJsonFile(filePath: string, data: Record<string, any>, options?: { pretty?: boolean }): Promise<void>;
  appendFile(filePath: string, content: string, options?: { encoding?: string }): Promise<void>;
}

// ClockPort interface
export declare class ClockPort {
  now(): Promise<number>;
  nowISO(): Promise<string>;
  performanceNow(): Promise<number>;
  createTimer(): Promise<{
    start(): void;
    end(): number;
  }>;
  formatTimestamp(timestamp: number, options?: { format?: string; locale?: string }): Promise<string>;
  calculateDuration(startTimestamp: number, endTimestamp: number): Promise<{
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
  }>;
  delay(milliseconds: number): Promise<void>;
  setTimeout(callback: () => void, milliseconds: number): Promise<{
    cancel(): void;
  }>;
  createStopwatch(): Promise<{
    start(): void;
    stop(): number;
    reset(): void;
    elapsed(): number;
  }>;
  getTimezoneOffset(): Promise<number>;
  validateTimestamp(timestamp: number, options?: { minTimestamp?: number; maxTimestamp?: number }): Promise<boolean>;
}

// DictionaryPort interface
export declare class DictionaryPort {
  loadDictionary(dictionaryName: string): Promise<string[]>;
  getAvailableDictionaries(): Promise<string[]>;
  getDictionaryMetadata(dictionaryName: string): Promise<{
    name: string;
    wordCount: number;
    description?: string;
    category?: string;
  }>;
  selectRandomWord(dictionaryName: string, options?: {
    minLength?: number;
    maxLength?: number;
    excludeWords?: string[];
  }): Promise<string>;
  selectRandomWords(dictionaryName: string, count: number, options?: {
    minLength?: number;
    maxLength?: number;
    unique?: boolean;
    excludeWords?: string[];
  }): Promise<string[]>;
  filterWords(dictionaryName: string, criteria: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    excludeWords?: string[];
  }): Promise<string[]>;
  validateDictionary(dictionaryName: string, requirements: {
    minWordCount: number;
    minUniqueWords?: number;
  }): Promise<boolean>;
  calculateDictionaryEntropy(dictionaryName: string, options?: {
    minLength?: number;
    maxLength?: number;
  }): Promise<{
    totalWords: number;
    entropy: number;
    entropyPerWord: number;
  }>;
  preloadDictionaries(dictionaryNames: string[]): Promise<void>;
  clearDictionaryCache(dictionaryNames?: string[]): Promise<void>;
  isDictionaryLoaded(dictionaryName: string): Promise<boolean>;
}

// Port configuration types
export declare const PORT_CONFIGURATION_SCHEMA: {
  readonly randomGenerator: 'RandomGeneratorPort';
  readonly logger: 'LoggerPort';
  readonly storage: 'StoragePort';
  readonly clock: 'ClockPort';
  readonly dictionary: 'DictionaryPort';
};

export interface PortConfiguration {
  randomGenerator: RandomGeneratorPort;
  logger: LoggerPort;
  storage: StoragePort;
  clock: ClockPort;
  dictionary: DictionaryPort;
}

export declare function validatePortConfiguration(portConfiguration: Partial<PortConfiguration>): boolean;