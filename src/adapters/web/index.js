// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Web adapters for browser environments.
 *
 * This module provides browser-compatible alternatives to Node.js-specific
 * functionality, enabling the password generator to work in web environments.
 *
 * @module WebAdapters
 */

export {
  WebCryptoRandom,
  WebCryptoRandomAdapter,
  randomBytes,
  randomInt,
  bytesToBase64,
} from './WebCryptoRandom.js';

export { WebConsoleLogger, LogLevel, logger, webConsole } from './WebConsoleLogger.js';

export { WebLocalStorage, StorageKeys, storage, webStorage } from './WebLocalStorage.js';

/**
 * Complete web adapter suite for drop-in Node.js replacement.
 */
export const WebAdapters = {
  crypto: {
    randomBytes: async (size) => {
      const { randomBytes } = await import('./WebCryptoRandom.js');
      return randomBytes(size);
    },
    randomInt: async (max) => {
      const { randomInt } = await import('./WebCryptoRandom.js');
      return randomInt(max);
    },
  },
  console: {
    log: async (...args) => {
      const { webConsole } = await import('./WebConsoleLogger.js');
      return webConsole.log(...args);
    },
    info: async (...args) => {
      const { webConsole } = await import('./WebConsoleLogger.js');
      return webConsole.info(...args);
    },
    warn: async (...args) => {
      const { webConsole } = await import('./WebConsoleLogger.js');
      return webConsole.warn(...args);
    },
    error: async (...args) => {
      const { webConsole } = await import('./WebConsoleLogger.js');
      return webConsole.error(...args);
    },
  },
  storage: {
    setItem: async (key, value) => {
      const { webStorage } = await import('./WebLocalStorage.js');
      return webStorage.setItem(key, value);
    },
    getItem: async (key, defaultValue) => {
      const { webStorage } = await import('./WebLocalStorage.js');
      return webStorage.getItem(key, defaultValue);
    },
    removeItem: async (key) => {
      const { webStorage } = await import('./WebLocalStorage.js');
      return webStorage.removeItem(key);
    },
    clear: async () => {
      const { webStorage } = await import('./WebLocalStorage.js');
      return webStorage.clear();
    },
  },
};

export default WebAdapters;
