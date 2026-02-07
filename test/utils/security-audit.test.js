// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import {
  setAuditMode,
  resetAuditSession,
  recordEntropyUsage,
  recordAlgorithmUsage,
  calculateBase64Entropy,
  calculateBase64ChunkEntropy,
  calculateDictionaryEntropy,
  setDictionarySize,
  finishAuditSession,
  generateAuditReport,
} from "../../src/utils/security-audit.js";

describe("Security Audit Module", function () {
  beforeEach(function () {
    // Reset audit state before each test
    setAuditMode(false);
  });

  describe("setAuditMode", function () {
    it("should enable audit mode", function () {
      setAuditMode(true);
      const report = generateAuditReport();
      expect(report.auditEnabled).to.be.true;
    });

    it("should disable audit mode", function () {
      setAuditMode(true);
      setAuditMode(false);
      const report = generateAuditReport();
      expect(report.auditEnabled).to.be.false;
    });

    it("should reset session when enabling audit mode", function () {
      setAuditMode(true);
      recordEntropyUsage("test", 1, 8);
      setAuditMode(true); // Re-enable should reset
      finishAuditSession();
      const report = generateAuditReport();
      expect(report.summary.entropySourcesUsed).to.equal(0);
    });
  });

  describe("resetAuditSession", function () {
    it("should do nothing when audit is disabled", function () {
      resetAuditSession();
      const report = generateAuditReport();
      expect(report.auditEnabled).to.be.false;
    });

    it("should reset all tracking data when enabled", function () {
      setAuditMode(true);
      recordEntropyUsage("test", 1, 8);
      resetAuditSession();
      finishAuditSession();
      const report = generateAuditReport();
      expect(report.summary.entropySourcesUsed).to.equal(0);
    });
  });

  describe("recordEntropyUsage", function () {
    it("should do nothing when audit is disabled", function () {
      recordEntropyUsage("crypto.randomInt", 10, 60);
      const report = generateAuditReport();
      expect(report.auditEnabled).to.be.false;
    });

    it("should record entropy when enabled", function () {
      setAuditMode(true);
      recordEntropyUsage("crypto.randomInt", 10, 60, { charsetSize: 64 });
      finishAuditSession();
      const report = generateAuditReport();
      expect(report.summary.entropySourcesUsed).to.equal(1);
      expect(report.entropyDetails.sources[0].source).to.equal("crypto.randomInt");
      expect(report.entropyDetails.sources[0].entropyBits).to.equal(60);
    });

    it("should track multiple entropy sources", function () {
      setAuditMode(true);
      recordEntropyUsage("crypto.randomInt", 10, 60);
      recordEntropyUsage("crypto.randomBytes", 5, 40);
      finishAuditSession();
      const report = generateAuditReport();
      expect(report.summary.entropySourcesUsed).to.equal(2);
      expect(report.summary.totalEntropyBits).to.equal(100);
    });
  });

  describe("recordAlgorithmUsage", function () {
    it("should do nothing when audit is disabled", function () {
      recordAlgorithmUsage("base64-encoding", { length: 16 });
      const report = generateAuditReport();
      expect(report.auditEnabled).to.be.false;
    });

    it("should record algorithm usage when enabled", function () {
      setAuditMode(true);
      recordAlgorithmUsage("base64-encoding", { length: 16 });
      finishAuditSession();
      const report = generateAuditReport();
      expect(report.summary.algorithmsUsed).to.equal(1);
      expect(report.algorithms["base64-encoding"].usageCount).to.equal(1);
    });

    it("should increment count for repeated algorithm usage", function () {
      setAuditMode(true);
      recordAlgorithmUsage("base64-encoding", { length: 16 });
      recordAlgorithmUsage("base64-encoding", { length: 32 });
      finishAuditSession();
      const report = generateAuditReport();
      expect(report.algorithms["base64-encoding"].usageCount).to.equal(2);
      expect(report.algorithms["base64-encoding"].configurations).to.have.length(2);
    });
  });

  describe("Entropy Calculation Functions", function () {
    it("calculateBase64Entropy should calculate correctly", function () {
      expect(calculateBase64Entropy(16)).to.equal(128); // 16 bytes * 8 bits
      expect(calculateBase64Entropy(32)).to.equal(256);
      expect(calculateBase64Entropy(1)).to.equal(8);
    });

    it("calculateBase64ChunkEntropy should calculate correctly", function () {
      // 6 bits per base64 character
      expect(calculateBase64ChunkEntropy(16)).to.equal(96); // 16 * 6
      expect(calculateBase64ChunkEntropy(1)).to.equal(6);
    });

    it("calculateDictionaryEntropy should calculate correctly", function () {
      // 1000 words = ~9.97 bits per word
      const entropy = calculateDictionaryEntropy(1000, 4);
      expect(entropy).to.be.closeTo(39.86, 0.1); // 4 * log2(1000)
    });

    it("should handle edge cases in entropy calculations", function () {
      expect(calculateBase64Entropy(0)).to.equal(0);
      expect(calculateBase64ChunkEntropy(0)).to.equal(0);
      expect(calculateDictionaryEntropy(1, 1)).to.equal(0); // log2(1) = 0
    });
  });

  describe("setDictionarySize", function () {
    it("should set dictionary size for entropy calculations", function () {
      setDictionarySize(5000);
      // This is used internally for reference
      expect(true).to.be.true; // Just verify it doesn't throw
    });
  });

  describe("finishAuditSession", function () {
    it("should do nothing when audit is disabled", function () {
      finishAuditSession();
      // Should not throw
      expect(true).to.be.true;
    });

    it("should record end time when enabled", function () {
      setAuditMode(true);
      finishAuditSession();
      const report = generateAuditReport();
      expect(report.performance.totalGenerationTimeMs).to.be.a("number");
    });
  });

  describe("generateAuditReport", function () {
    it("should return disabled message when audit is off", function () {
      const report = generateAuditReport();
      expect(report.auditEnabled).to.be.false;
      expect(report.message).to.include("not enabled");
    });

    it("should return complete report when enabled", function () {
      setAuditMode(true);
      recordEntropyUsage("crypto.randomInt", 16, 96, { charsetSize: 64, outputLength: 16 });
      recordAlgorithmUsage("base64-chunk-generation", { charsetSize: 64 });
      finishAuditSession();

      const report = generateAuditReport();

      expect(report.auditEnabled).to.be.true;
      expect(report.summary).to.have.keys(["totalEntropyBits", "securityLevel", "algorithmsUsed", "entropySourcesUsed"]);
      expect(report.entropyDetails).to.have.keys(["sources", "breakdown"]);
      expect(report.algorithms).to.be.an("object");
      expect(report.performance).to.have.keys(["totalGenerationTimeMs", "auditOverheadMs", "auditOverheadPercent"]);
      expect(report.compliance).to.have.keys(["cryptographicStandard", "entropySource", "recommendation"]);
    });

    it("should classify security levels correctly", function () {
      setAuditMode(true);

      // EXCELLENT - 256+ bits
      recordEntropyUsage("test", 1, 300);
      finishAuditSession();
      let report = generateAuditReport();
      expect(report.summary.securityLevel).to.include("EXCELLENT");

      // STRONG - 128-255 bits
      setAuditMode(true);
      recordEntropyUsage("test", 1, 128);
      finishAuditSession();
      report = generateAuditReport();
      expect(report.summary.securityLevel).to.include("STRONG");

      // GOOD - 80-127 bits
      setAuditMode(true);
      recordEntropyUsage("test", 1, 80);
      finishAuditSession();
      report = generateAuditReport();
      expect(report.summary.securityLevel).to.include("GOOD");

      // MODERATE - 64-79 bits
      setAuditMode(true);
      recordEntropyUsage("test", 1, 64);
      finishAuditSession();
      report = generateAuditReport();
      expect(report.summary.securityLevel).to.include("MODERATE");

      // WEAK - <64 bits
      setAuditMode(true);
      recordEntropyUsage("test", 1, 32);
      finishAuditSession();
      report = generateAuditReport();
      expect(report.summary.securityLevel).to.include("WEAK");
    });

    it("should provide appropriate security recommendations", function () {
      setAuditMode(true);
      recordEntropyUsage("test", 1, 128);
      finishAuditSession();
      let report = generateAuditReport();
      expect(report.compliance.recommendation).to.include("Excellent");

      setAuditMode(true);
      recordEntropyUsage("test", 1, 80);
      finishAuditSession();
      report = generateAuditReport();
      expect(report.compliance.recommendation).to.include("Good");

      setAuditMode(true);
      recordEntropyUsage("test", 1, 32);
      finishAuditSession();
      report = generateAuditReport();
      expect(report.compliance.recommendation).to.include("Consider increasing");
    });

    it("should calculate entropy breakdown by source", function () {
      setAuditMode(true);
      recordEntropyUsage("crypto.randomInt", 10, 60);
      recordEntropyUsage("crypto.randomInt", 10, 60);
      recordEntropyUsage("crypto.randomBytes", 5, 40);
      finishAuditSession();

      const report = generateAuditReport();
      expect(report.entropyDetails.breakdown["crypto.randomInt"]).to.equal(120);
      expect(report.entropyDetails.breakdown["crypto.randomBytes"]).to.equal(40);
    });
  });
});
