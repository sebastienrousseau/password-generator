// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Password Generation Web Worker
 *
 * This worker runs password generation in a separate thread to avoid blocking
 * the main thread during bulk generation operations.
 *
 * @module workers/password-worker
 */

// Import dependencies (will need bundling for production use)
import { createService } from '../../packages/core/src/index.js';
import { randomInt, bytesToBase64 } from '../adapters/web/webcrypto-random.js';

/**
 * Web Crypto Random Generator implementation for Web Worker context.
 * Implements the RandomGeneratorPort interface for the core service.
 */
class WebWorkerCryptoRandom {
  async generateRandomBytes(byteLength) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  async generateRandomInt(max) {
    return randomInt(max);
  }

  async generateRandomBase64(byteLength) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return bytesToBase64(bytes);
  }

  async generateRandomString(length, charset) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[randomInt(charset.length)];
    }
    return result;
  }
}

// Initialize the password service
const randomGenerator = new WebWorkerCryptoRandom();
const passwordService = createService({}, { randomGenerator });

/**
 * Message handler for the worker.
 * Processes generation requests from the main thread.
 */
self.onmessage = async function (event) {
  const { id, action, payload } = event.data;

  try {
    switch (action) {
      case 'generate': {
        const password = await passwordService.generate(payload.config);
        self.postMessage({
          id,
          success: true,
          result: password,
        });
        break;
      }

      case 'generateBatch': {
        const { configs, batchId } = payload;
        const passwords = [];

        for (let i = 0; i < configs.length; i++) {
          const password = await passwordService.generate(configs[i]);
          passwords.push(password);

          // Report progress for large batches
          if ((i + 1) % 100 === 0 || i === configs.length - 1) {
            self.postMessage({
              id,
              type: 'progress',
              batchId,
              completed: i + 1,
              total: configs.length,
            });
          }
        }

        self.postMessage({
          id,
          success: true,
          result: passwords,
          batchId,
        });
        break;
      }

      case 'generateMultiple': {
        const passwords = await passwordService.generateMultiple(payload.configs);
        self.postMessage({
          id,
          success: true,
          result: passwords,
        });
        break;
      }

      case 'validateConfig': {
        const validation = passwordService.validateConfig(payload.config);
        self.postMessage({
          id,
          success: true,
          result: validation,
        });
        break;
      }

      case 'calculateEntropy': {
        const entropy = passwordService.calculateEntropy(payload.config);
        self.postMessage({
          id,
          success: true,
          result: entropy,
        });
        break;
      }

      case 'getSupportedTypes': {
        const types = passwordService.getSupportedTypes();
        self.postMessage({
          id,
          success: true,
          result: types,
        });
        break;
      }

      case 'ping': {
        self.postMessage({
          id,
          success: true,
          result: 'pong',
        });
        break;
      }

      default:
        self.postMessage({
          id,
          success: false,
          error: `Unknown action: ${action}`,
        });
    }
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
};

// Signal that the worker is ready
self.postMessage({
  type: 'ready',
});
