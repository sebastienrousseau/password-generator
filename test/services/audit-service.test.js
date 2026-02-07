// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import {
  startAuditSession,
  completeAuditSession,
  executeWithAudit,
  isAuditEnabled,
} from '../../src/services/audit-service.js';

describe('Audit Service', function () {
  describe('startAuditSession', function () {
    it('should start an audit session', function () {
      expect(() => startAuditSession()).to.not.throw();
    });
  });

  describe('completeAuditSession', function () {
    it('should complete an audit session and return a report', function () {
      startAuditSession();
      const report = completeAuditSession();
      expect(report).to.be.an('object');
    });
  });

  describe('executeWithAudit', function () {
    it('should execute an operation with audit tracking', async function () {
      const result = await executeWithAudit(async () => {
        return 'test result';
      });

      expect(result).to.have.property('result', 'test result');
      expect(result).to.have.property('auditReport');
      expect(result.auditReport).to.be.an('object');
    });

    it('should handle async operations', async function () {
      const result = await executeWithAudit(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { data: 'async data' };
      });

      expect(result.result).to.deep.equal({ data: 'async data' });
      expect(result.auditReport).to.be.an('object');
    });

    it('should throw error with audit report when operation fails', async function () {
      try {
        await executeWithAudit(async () => {
          throw new Error('Test operation failure');
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Operation failed');
        expect(error.message).to.include('Test operation failure');
        expect(error.message).to.include('Audit Report');
      }
    });

    it('should include audit report in error for sync failures', async function () {
      try {
        await executeWithAudit(async () => {
          throw new TypeError('Invalid type');
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('Invalid type');
        expect(error.message).to.include('Audit Report');
      }
    });
  });

  describe('isAuditEnabled', function () {
    it('should return a boolean value', function () {
      const result = isAuditEnabled();
      expect(result).to.be.a('boolean');
    });

    it('should return false by default', function () {
      expect(isAuditEnabled()).to.be.false;
    });
  });
});
