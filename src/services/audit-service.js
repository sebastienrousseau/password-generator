// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Audit Service - Handles security audit functionality
 *
 * This module provides services for managing security audit sessions,
 * collecting audit data, and generating audit reports.
 *
 * @module services/audit-service
 */

import {
  setAuditMode,
  resetAuditSession,
  finishAuditSession,
  generateAuditReport
} from "../utils/security-audit.js";

/**
 * Starts a new audit session and enables audit mode.
 */
export const startAuditSession = () => {
  setAuditMode(true);
  resetAuditSession();
};

/**
 * Completes the current audit session and returns the audit report.
 *
 * @returns {Object} The complete audit report.
 */
export const completeAuditSession = () => {
  finishAuditSession();
  return generateAuditReport();
};

/**
 * Executes a function with audit tracking enabled.
 *
 * @param {Function} operation - The operation to execute with audit tracking.
 * @returns {Promise<{result: any, auditReport: Object}>} The operation result and audit report.
 */
export const executeWithAudit = async(operation) => {
  startAuditSession();

  try {
    const result = await operation();
    const auditReport = completeAuditSession();

    return {
      result,
      auditReport
    };
  } catch (error) {
    // Complete audit session even if operation fails
    const auditReport = completeAuditSession();
    throw new Error(`Operation failed: ${error.message}. Audit Report: ${JSON.stringify(auditReport)}`);
  }
};

/**
 * Checks if audit mode is currently enabled.
 *
 * @returns {boolean} True if audit mode is enabled.
 */
export const isAuditEnabled = () => {
  // This would require exposing the audit state from security-audit.js
  // For now, we'll return false as a placeholder
  return false;
};
