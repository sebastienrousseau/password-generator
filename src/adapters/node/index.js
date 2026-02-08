// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Node.js adapters index - exports all Node.js-specific port implementations.
 *
 * @module adapters/node
 */

export { NodeCryptoRandom } from './crypto-random.js';
export { NodeConsoleLogger, LogLevel } from './console-logger.js';
export { NodeFsStorage } from './fs-storage.js';
export { NodeSystemClock } from './system-clock.js';

/**
 * Creates a complete set of Node.js adapters for dependency injection.
 *
 * @param {Object} options - Configuration options for adapters.
 * @param {Object} options.logger - Logger options.
 * @param {Object} options.storage - Storage options.
 * @returns {Object} An object containing all adapter instances.
 */
export function createNodeAdapters(options = {}) {
  const { NodeCryptoRandom } = require('./crypto-random.js');
  const { NodeConsoleLogger } = require('./console-logger.js');
  const { NodeFsStorage } = require('./fs-storage.js');
  const { NodeSystemClock } = require('./system-clock.js');

  return {
    randomGenerator: new NodeCryptoRandom(),
    logger: new NodeConsoleLogger(options.logger),
    storage: new NodeFsStorage(options.storage),
    clock: new NodeSystemClock(),
  };
}
