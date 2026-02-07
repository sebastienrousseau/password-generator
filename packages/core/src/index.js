// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Password Generator Core Package
 *
 * This package provides platform-agnostic password generation logic.
 * It has zero dependencies on Node.js, browser, or any platform-specific APIs.
 *
 * All I/O is abstracted through ports (dependency injection).
 *
 * @module @password-generator/core
 *
 * @example
 * import { createService } from '@password-generator/core';
 * import { NodeCryptoRandom } from './adapters/node/crypto-random.js';
 *
 * const service = createService({}, {
 *   randomGenerator: new NodeCryptoRandom(),
 * });
 *
 * const password = await service.generate({
 *   type: 'strong',
 *   length: 16,
 *   iteration: 4,
 *   separator: '-',
 * });
 */

// Main service factory
export { createService, createQuickService } from './service.js';

// Error messages
export { CRYPTO_ERRORS, PASSWORD_ERRORS, PORT_ERRORS } from './errors.js';

// Domain exports
export * from './domain/index.js';

// Port interfaces
export {
  RandomGeneratorPort,
  LoggerPort,
  StoragePort,
  ClockPort,
  DictionaryPort,
  NoOpLogger,
  MemoryStorage,
  FixedClock,
  MemoryDictionary,
  DEFAULT_WORD_LIST,
  validatePorts,
  PORT_SCHEMA,
} from './ports/index.js';

// Generator exports
export {
  generate,
  getGenerator,
  GENERATOR_REGISTRY,
  generateStrongPassword,
  generateBase64Password,
  generateMemorablePassword,
  generatePassphrase,
  generateQuantumPassword,
  generateHoneywordSet,
  generateHoneywordPassword,
  calculateStrongPasswordEntropy,
  calculateBase64PasswordEntropy,
  calculateMemorablePasswordEntropy,
  calculateQuantumPasswordEntropy,
  calculateHoneywordPasswordEntropy,
  validateQuantumSecurity,
} from './generators/index.js';
