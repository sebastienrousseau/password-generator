// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Application service for audit operations.
 * Provides a high-level interface for audit functionality without exposing infrastructure details.
 * Acts as a bridge between the domain orchestrator and audit infrastructure.
 */
export class AuditApplicationService {
  /**
   * Executes an operation with audit tracking.
   * Manages the complete audit lifecycle for a given operation.
   *
   * @param {Function} operation - The operation to execute with audit tracking.
   * @returns {Promise<Object>} The operation result with optional audit report.
   */
  static async executeWithAudit(operation) {
    const { executeWithAudit } = await import("../../services/audit-service.js");

    try {
      const { result, auditReport } = await executeWithAudit(operation);
      return {
        result,
        auditReport
      };
    } catch (error) {
      // Re-throw with simplified error message, hiding infrastructure details
      throw new Error(`Audit operation failed: ${error.message}`);
    }
  }

  /**
   * Executes an operation without audit tracking.
   *
   * @param {Function} operation - The operation to execute.
   * @returns {Promise<any>} The operation result.
   */
  static async executeWithoutAudit(operation) {
    return await operation();
  }

  /**
   * Determines if an operation should be executed with audit based on options.
   *
   * @param {Object} options - Options containing audit preference.
   * @param {boolean} [options.audit] - Whether audit is enabled.
   * @param {Function} operation - The operation to execute.
   * @returns {Promise<Object>} Result object with operation result and optional audit report.
   */
  static async executeOperation(options, operation) {
    if (options.audit) {
      return await this.executeWithAudit(operation);
    } else {
      const result = await this.executeWithoutAudit(operation);
      return { result };
    }
  }
}