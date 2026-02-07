// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Output Formatter Service - Structured Export Capabilities
 *
 * Provides formatting functions for JSON, YAML, and CSV output formats
 * to support bulk password generation and export operations.
 *
 * @module services/output-formatter
 */

/**
 * Converts a CSV value to a safe string representation
 * @param {any} value - The value to convert
 * @returns {string} CSV-safe string
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);

  // If value contains comma, newline, or quote, wrap in quotes and escape quotes
  if (str.includes(",") || str.includes("\n") || str.includes("\r") || str.includes("\"")) {
    return `"${str.replace(/"/g, "\"\"")}"`;
  }

  return str;
}

/**
 * Formats password data as JSON
 * @param {Array<Object>} passwordData - Array of password objects
 * @param {Object} options - Formatting options
 * @returns {string} JSON formatted string
 */
export function formatAsJSON(passwordData, options = {}) {
  const { pretty = true } = options;

  const output = {
    metadata: {
      count: passwordData.length,
      generatedAt: new Date().toISOString(),
      format: "json",
    },
    passwords: passwordData,
  };

  return JSON.stringify(output, null, pretty ? 2 : 0);
}

/**
 * Formats password data as YAML
 * @param {Array<Object>} passwordData - Array of password objects
 * @param {Object} options - Formatting options
 * @returns {string} YAML formatted string
 */
export function formatAsYAML(passwordData) {
  // Simple YAML formatter - handles basic data structures
  function toYAML(obj, indent = 0) {
    const spaces = "  ".repeat(indent);
    let result = "";

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === "object" && item !== null) {
          result += `${spaces}-\n${toYAML(item, indent + 1)}`;
        } else {
          result += `${spaces}- ${item}\n`;
        }
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          result += `${spaces}${key}:\n${toYAML(value, indent + 1)}`;
        } else if (Array.isArray(value)) {
          result += `${spaces}${key}:\n${toYAML(value, indent + 1)}`;
        } else {
          const valueStr =
            typeof value === "string" ?
              value.includes(":") || value.includes("\n") ?
                `"${value}"` :
                value :
              value;
          result += `${spaces}${key}: ${valueStr}\n`;
        }
      }
    }

    return result;
  }

  const output = {
    metadata: {
      count: passwordData.length,
      generatedAt: new Date().toISOString(),
      format: "yaml",
    },
    passwords: passwordData,
  };

  return toYAML(output);
}

/**
 * Formats password data as CSV
 * @param {Array<Object>} passwordData - Array of password objects
 * @param {Object} options - Formatting options
 * @returns {string} CSV formatted string
 */
export function formatAsCSV(passwordData, options = {}) {
  const { includeHeaders = true } = options;

  if (!passwordData.length) {
    return includeHeaders ? "password,type,length,iteration,separator,strength,entropy\n" : "";
  }

  // Define CSV headers
  const headers = ["password", "type", "length", "iteration", "separator", "strength", "entropy"];

  let csv = "";

  if (includeHeaders) {
    csv += headers.join(",") + "\n";
  }

  for (const item of passwordData) {
    const row = headers.map((header) => escapeCSVValue(item[header]));
    csv += row.join(",") + "\n";
  }

  return csv;
}

/**
 * Formats password data as plain text (default format)
 * @param {Array<Object>} passwordData - Array of password objects
 * @param {Object} options - Formatting options
 * @returns {string} Plain text formatted string
 */
export function formatAsText(passwordData, options = {}) {
  const { showMetadata = false } = options;

  if (passwordData.length === 1) {
    // Single password - just return the password
    return passwordData[0].password;
  }

  let output = "";

  if (showMetadata) {
    output += `Generated ${passwordData.length} passwords at ${new Date().toISOString()}\n\n`;
  }

  for (let i = 0; i < passwordData.length; i++) {
    const item = passwordData[i];
    output += item.password;
    if (i < passwordData.length - 1) {
      output += "\n";
    }
  }

  return output;
}

/**
 * Main formatting function that routes to appropriate formatter
 * @param {Array<Object>} passwordData - Array of password objects
 * @param {string} format - Output format (json, yaml, csv, text)
 * @param {Object} options - Formatting options
 * @returns {string} Formatted output string
 */
export function formatOutput(passwordData, format = "text", options = {}) {
  switch (format.toLowerCase()) {
    case "json":
      return formatAsJSON(passwordData, options);
    case "yaml":
    case "yml":
      return formatAsYAML(passwordData, options);
    case "csv":
      return formatAsCSV(passwordData, options);
    case "text":
    default:
      return formatAsText(passwordData, options);
  }
}

/**
 * Calculates password strength for inclusion in formatted output
 * @param {string} password - The password to analyze
 * @returns {Object} Strength analysis object
 */
export function calculatePasswordStrength(password) {
  let charsetSize = 0;

  if (/[a-z]/.test(password)) {
    charsetSize += 26;
  }
  if (/[A-Z]/.test(password)) {
    charsetSize += 26;
  }
  if (/[0-9]/.test(password)) {
    charsetSize += 10;
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    charsetSize += 32;
  }

  const entropy = Math.floor(password.length * Math.log2(charsetSize || 1));

  let strength = "weak";
  if (entropy >= 128) {
    strength = "maximum";
  } else if (entropy >= 80) {
    strength = "strong";
  } else if (entropy >= 50) {
    strength = "medium";
  }

  return { strength, entropy };
}

/**
 * Prepares password data for formatting by adding metadata
 * @param {Array<string>} passwords - Array of generated passwords
 * @param {Object} config - Password generation configuration
 * @returns {Array<Object>} Enhanced password data objects
 */
export function preparePasswordData(passwords, config) {
  return passwords.map((password) => {
    const analysis = calculatePasswordStrength(password);

    return {
      password,
      type: config.type,
      length: config.length || null,
      iteration: config.iteration,
      separator: config.separator,
      strength: analysis.strength,
      entropy: analysis.entropy,
    };
  });
}
