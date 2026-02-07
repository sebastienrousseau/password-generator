// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Core ports index - exports all port interfaces for the password generator.
 *
 * These ports define the contracts for external dependencies using the
 * Ports and Adapters (Hexagonal Architecture) pattern. This enables:
 *
 * - Testability through dependency injection
 * - Implementation flexibility (file vs memory, real vs mock)
 * - Clear separation between business logic and infrastructure
 * - Compliance with SOLID principles
 *
 * @module core/ports
 */

export { RandomGeneratorPort } from './RandomGeneratorPort.js';
export { LoggerPort } from './LoggerPort.js';
export { StoragePort } from './StoragePort.js';
export { ClockPort } from './ClockPort.js';
export { DictionaryPort } from './DictionaryPort.js';

/**
 * Port configuration schema for dependency injection.
 * This object defines the expected structure for port implementations.
 */
export const PORT_CONFIGURATION_SCHEMA = {
  randomGenerator: 'RandomGeneratorPort',
  logger: 'LoggerPort',
  storage: 'StoragePort',
  clock: 'ClockPort',
  dictionary: 'DictionaryPort'
};

/**
 * Validates that all required ports are implemented.
 *
 * @param {Object} portConfiguration - The configuration object containing port implementations.
 * @returns {boolean} True if all required ports are present and implement their interfaces.
 * @throws {Error} If any required ports are missing or invalid.
 */
export const validatePortConfiguration = (portConfiguration) => {
  const requiredPorts = Object.keys(PORT_CONFIGURATION_SCHEMA);
  const providedPorts = Object.keys(portConfiguration || {});

  // Check for missing ports
  const missingPorts = requiredPorts.filter(port => !providedPorts.includes(port));
  if (missingPorts.length > 0) {
    throw new Error(
      `Missing required ports: ${missingPorts.join(', ')}. ` +
      `Required ports: ${requiredPorts.join(', ')}`
    );
  }

  // Check for extra ports (warning, not error)
  const extraPorts = providedPorts.filter(port => !requiredPorts.includes(port));
  if (extraPorts.length > 0) {
    console.warn(`Unknown ports provided: ${extraPorts.join(', ')}`);
  }

  // Validate each port has required methods (basic duck typing)
  const validationResults = [];

  for (const [portName, expectedClass] of Object.entries(PORT_CONFIGURATION_SCHEMA)) {
    const portInstance = portConfiguration[portName];

    if (!portInstance) {
      validationResults.push(`${portName}: Missing implementation`);
      continue;
    }

    // Check if it's an instance or has the expected methods
    let hasRequiredMethods = false;

    switch (expectedClass) {
      case 'RandomGeneratorPort':
        hasRequiredMethods = typeof portInstance.generateRandomBytes === 'function' &&
                            typeof portInstance.generateRandomInt === 'function';
        break;
      case 'LoggerPort':
        hasRequiredMethods = typeof portInstance.info === 'function' &&
                            typeof portInstance.error === 'function';
        break;
      case 'StoragePort':
        hasRequiredMethods = typeof portInstance.readFile === 'function' &&
                            typeof portInstance.writeFile === 'function';
        break;
      case 'ClockPort':
        hasRequiredMethods = typeof portInstance.now === 'function' &&
                            typeof portInstance.performanceNow === 'function';
        break;
      case 'DictionaryPort':
        hasRequiredMethods = typeof portInstance.loadDictionary === 'function' &&
                            typeof portInstance.selectRandomWord === 'function';
        break;
      default:
        validationResults.push(`${portName}: Unknown port type ${expectedClass}`);
        continue;
    }

    if (!hasRequiredMethods) {
      validationResults.push(`${portName}: Missing required methods for ${expectedClass}`);
    }
  }

  if (validationResults.length > 0) {
    throw new Error(`Port validation failed:\n${validationResults.join('\n')}`);
  }

  return true;
};