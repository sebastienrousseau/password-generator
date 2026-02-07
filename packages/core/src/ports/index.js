// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Port interfaces for the password generator core.
 *
 * Ports define the contracts for external dependencies using the
 * Ports and Adapters (Hexagonal Architecture) pattern.
 *
 * @module ports
 */

import { PORT_ERRORS } from "../errors.js";

// Port interfaces
export {
  RandomGeneratorPort,
  RANDOM_GENERATOR_REQUIRED_METHODS,
  RANDOM_GENERATOR_OPTIONAL_METHODS,
} from "./RandomGeneratorPort.js";

export {
  LoggerPort,
  LOGGER_REQUIRED_METHODS,
  LOGGER_OPTIONAL_METHODS,
  NoOpLogger,
} from "./LoggerPort.js";

export {
  StoragePort,
  STORAGE_REQUIRED_METHODS,
  STORAGE_OPTIONAL_METHODS,
  MemoryStorage,
} from "./StoragePort.js";

export {
  ClockPort,
  CLOCK_REQUIRED_METHODS,
  CLOCK_OPTIONAL_METHODS,
  FixedClock,
} from "./ClockPort.js";

export {
  DictionaryPort,
  DICTIONARY_REQUIRED_METHODS,
  MemoryDictionary,
  DEFAULT_WORD_LIST,
} from "./DictionaryPort.js";

/**
 * Port configuration schema for dependency injection.
 */
export const PORT_SCHEMA = {
  randomGenerator: {
    portClass: "RandomGeneratorPort",
    required: true,
    requiredMethods: ["generateRandomBytes", "generateRandomInt"],
  },
  logger: {
    portClass: "LoggerPort",
    required: false,
    requiredMethods: ["info", "error"],
  },
  storage: {
    portClass: "StoragePort",
    required: false,
    requiredMethods: ["read", "write"],
  },
  clock: {
    portClass: "ClockPort",
    required: false,
    requiredMethods: ["now", "performanceNow"],
  },
  dictionary: {
    portClass: "DictionaryPort",
    required: false,
    requiredMethods: ["loadDictionary", "getWordCount", "selectRandomWord"],
  },
};

/**
 * Validates that a port implementation has the required methods.
 *
 * @param {Object} port - The port implementation to validate.
 * @param {string[]} requiredMethods - Array of required method names.
 * @returns {boolean} True if all required methods are present.
 */
const hasRequiredMethods = (port, requiredMethods) => {
  return requiredMethods.every((method) => typeof port[method] === "function");
};

/**
 * Validates a complete port configuration.
 *
 * @param {Object} ports - Object containing port implementations.
 * @param {Object} ports.randomGenerator - RandomGeneratorPort implementation (required).
 * @param {Object} [ports.logger] - LoggerPort implementation (optional).
 * @param {Object} [ports.storage] - StoragePort implementation (optional).
 * @param {Object} [ports.clock] - ClockPort implementation (optional).
 * @param {Object} [ports.dictionary] - DictionaryPort implementation (optional).
 * @returns {Object} Validation result with isValid and errors.
 */
export const validatePorts = (ports) => {
  const errors = [];

  if (!ports || typeof ports !== "object") {
    return {
      isValid: false,
      errors: ["Ports configuration must be an object"],
    };
  }

  // Check required ports
  const requiredPorts = Object.entries(PORT_SCHEMA)
    .filter(([, schema]) => schema.required)
    .map(([name]) => name);

  const missingPorts = requiredPorts.filter((name) => !ports[name]);
  if (missingPorts.length > 0) {
    errors.push(PORT_ERRORS.MISSING_PORTS(missingPorts, requiredPorts));
  }

  // Validate each provided port
  for (const [portName, port] of Object.entries(ports)) {
    const schema = PORT_SCHEMA[portName];

    if (!schema) {
      // Unknown port, skip validation but could warn
      continue;
    }

    if (!port) {
      if (schema.required) {
        errors.push(`${portName}: Port is required but not provided`);
      }
      continue;
    }

    if (!hasRequiredMethods(port, schema.requiredMethods)) {
      errors.push(PORT_ERRORS.INVALID_PORT(portName, schema.portClass));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Creates a ports configuration with defaults for optional ports.
 *
 * @param {Object} ports - Partial port configuration.
 * @returns {Object} Complete port configuration with defaults.
 */
export const createPortsWithDefaults = (ports) => {
  return {
    randomGenerator: ports.randomGenerator, // Required, no default
    logger: ports.logger ?? new NoOpLogger(),
    storage: ports.storage ?? new MemoryStorage(),
    clock: ports.clock ?? new FixedClock(),
    dictionary: ports.dictionary ?? new MemoryDictionary(DEFAULT_WORD_LIST),
  };
};
