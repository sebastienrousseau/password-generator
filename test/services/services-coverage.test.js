// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import sinon from "sinon";

// ============================================================================
// CLI Service Tests
// ============================================================================

describe("cli-service", () => {
  let cliService;
  let consoleLogStub;

  beforeEach(async () => {
    // Stub console.log to capture output
    consoleLogStub = sinon.stub(console, "log");

    // Import the module fresh for each test
    cliService = await import("../../src/services/cli-service.js");
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("generateEquivalentCommand", () => {
    it("should generate command with preset only", () => {
      const config = {
        type: "strong",
        length: 14,
        iteration: 4,
        separator: "-",
      };
      const opts = { clipboard: false, audit: false };

      const result = cliService.generateEquivalentCommand(config, "quick", opts);

      expect(result).to.equal("password-generator -p quick");
    });

    it("should generate command with preset and overridden type", () => {
      const config = {
        type: "base64", // Different from quick preset's "strong"
        length: 14,
        iteration: 4,
        separator: "-",
      };
      const opts = { clipboard: false, audit: false };

      const result = cliService.generateEquivalentCommand(config, "quick", opts);

      expect(result).to.equal("password-generator -p quick -t base64");
    });

    it("should generate command with preset and overridden length", () => {
      const config = {
        type: "strong",
        length: 20, // Different from quick preset's 14
        iteration: 4,
        separator: "-",
      };
      const opts = { clipboard: false, audit: false };

      const result = cliService.generateEquivalentCommand(config, "quick", opts);

      expect(result).to.equal("password-generator -p quick -l 20");
    });

    it("should generate command with preset and overridden iteration", () => {
      const config = {
        type: "strong",
        length: 14,
        iteration: 6, // Different from quick preset's 4
        separator: "-",
      };
      const opts = { clipboard: false, audit: false };

      const result = cliService.generateEquivalentCommand(config, "quick", opts);

      expect(result).to.equal("password-generator -p quick -i 6");
    });

    it("should generate command with preset and overridden separator", () => {
      const config = {
        type: "strong",
        length: 14,
        iteration: 4,
        separator: "_", // Different from quick preset's "-"
      };
      const opts = { clipboard: false, audit: false };

      const result = cliService.generateEquivalentCommand(config, "quick", opts);

      expect(result).to.equal('password-generator -p quick -s "_"');
    });

    it("should generate command without preset", () => {
      const config = {
        type: "strong",
        length: 16,
        iteration: 3,
        separator: "-",
      };
      const opts = { clipboard: false, audit: false };

      const result = cliService.generateEquivalentCommand(config, null, opts);

      expect(result).to.equal('password-generator -t strong -l 16 -i 3 -s "-"');
    });

    it("should generate command without preset and without length", () => {
      const config = {
        type: "memorable",
        iteration: 4,
        separator: "-",
      };
      const opts = { clipboard: false, audit: false };

      const result = cliService.generateEquivalentCommand(config, null, opts);

      expect(result).to.equal('password-generator -t memorable -i 4 -s "-"');
    });

    it("should add clipboard flag when enabled", () => {
      const config = {
        type: "strong",
        length: 14,
        iteration: 4,
        separator: "-",
      };
      const opts = { clipboard: true, audit: false };

      const result = cliService.generateEquivalentCommand(config, "quick", opts);

      expect(result).to.equal("password-generator -p quick -c");
    });

    it("should add audit flag when enabled", () => {
      const config = {
        type: "strong",
        length: 14,
        iteration: 4,
        separator: "-",
      };
      const opts = { clipboard: false, audit: true };

      const result = cliService.generateEquivalentCommand(config, "quick", opts);

      expect(result).to.equal("password-generator -p quick -a");
    });

    it("should add both clipboard and audit flags", () => {
      const config = {
        type: "strong",
        length: 14,
        iteration: 4,
        separator: "-",
      };
      const opts = { clipboard: true, audit: true };

      const result = cliService.generateEquivalentCommand(config, "quick", opts);

      expect(result).to.equal("password-generator -p quick -c -a");
    });

    it("should generate command with all overrides and flags", () => {
      const config = {
        type: "base64",
        length: 20,
        iteration: 6,
        separator: "_",
      };
      const opts = { clipboard: true, audit: true };

      const result = cliService.generateEquivalentCommand(config, "quick", opts);

      expect(result).to.equal('password-generator -p quick -t base64 -l 20 -i 6 -s "_" -c -a');
    });
  });

  describe("displayPasswordOutput", () => {
    it("should display password output without clipboard", () => {
      const password = "TestPassword123!";

      cliService.displayPasswordOutput(password, false, {});

      expect(consoleLogStub.called).to.be.true;
    });

    it("should handle empty password (edge case for charset fallback)", () => {
      const password = "";

      cliService.displayPasswordOutput(password, false, {});

      expect(consoleLogStub.called).to.be.true;
    });

    it("should display password output with clipboard", () => {
      const password = "TestPassword123!";

      cliService.displayPasswordOutput(password, true, {});

      expect(consoleLogStub.called).to.be.true;
    });

    it("should display security note for quantum-resistant passwords", () => {
      const password = "QuantumSecurePassword123!@#$%^";
      const config = { type: "quantum-resistant" };

      cliService.displayPasswordOutput(password, false, config);

      // Check that console.log was called multiple times (password + security note)
      expect(consoleLogStub.callCount).to.be.greaterThan(1);
      // Verify the security note was logged
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("security note");
    });

    it("should not display security note for non-quantum-resistant passwords", () => {
      const password = "RegularPassword123!";
      const config = { type: "strong" };

      cliService.displayPasswordOutput(password, false, config);

      // Only the password rendering should be logged
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.not.include("security note");
    });

    it("should use default config when not provided", () => {
      const password = "TestPassword";

      cliService.displayPasswordOutput(password);

      expect(consoleLogStub.called).to.be.true;
    });
  });

  describe("displayCommandLearningPanel", () => {
    it("should display command learning panel with shortcuts", () => {
      const command = "password-generator -p quick";

      cliService.displayCommandLearningPanel(command);

      expect(consoleLogStub.called).to.be.true;
    });
  });

  describe("displaySecurityAuditReport", () => {
    it("should display audit report with generation info", () => {
      const auditReport = {
        generation: {
          algorithm: "crypto.randomBytes",
          entropySource: "Node.js crypto module",
        },
      };

      cliService.displaySecurityAuditReport(auditReport);

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("security audit");
      expect(allCalls).to.include("generation");
    });

    it("should display audit report with default generation values", () => {
      const auditReport = {
        generation: {},
      };

      cliService.displaySecurityAuditReport(auditReport);

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("cryptographic");
      expect(allCalls).to.include("crypto.randomInt");
    });

    it("should display audit report with password analysis (weak entropy < 50)", () => {
      const auditReport = {
        password: {
          length: 8,
          entropy: 30,
        },
      };

      cliService.displaySecurityAuditReport(auditReport);

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("analysis");
      expect(allCalls).to.include("30 bits");
    });

    it("should display audit report with password analysis (medium entropy 50-79)", () => {
      const auditReport = {
        password: {
          length: 12,
          entropy: 60,
        },
      };

      cliService.displaySecurityAuditReport(auditReport);

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("60 bits");
    });

    it("should display audit report with password analysis (strong entropy 80-127)", () => {
      const auditReport = {
        password: {
          length: 16,
          entropy: 100,
        },
      };

      cliService.displaySecurityAuditReport(auditReport);

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("100 bits");
    });

    it("should display audit report with password analysis (maximum entropy >= 128)", () => {
      const auditReport = {
        password: {
          length: 32,
          entropy: 180,
        },
      };

      cliService.displaySecurityAuditReport(auditReport);

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("180 bits");
    });

    it("should display audit report with password length but no entropy", () => {
      const auditReport = {
        password: {
          length: 16,
        },
      };

      cliService.displaySecurityAuditReport(auditReport);

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("N/A bits");
    });

    it("should display audit report with no password length", () => {
      const auditReport = {
        password: {
          entropy: 100,
        },
      };

      cliService.displaySecurityAuditReport(auditReport);

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("N/A");
    });

    it("should display full audit report with generation and password", () => {
      const auditReport = {
        generation: {
          algorithm: "AES-256-GCM",
          entropySource: "hardware RNG",
        },
        password: {
          length: 24,
          entropy: 150,
        },
      };

      cliService.displaySecurityAuditReport(auditReport);

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("AES-256-GCM");
      expect(allCalls).to.include("hardware RNG");
      expect(allCalls).to.include("150 bits");
      expect(allCalls).to.include("NIST SP 800-63B compliant");
    });

    it("should display storage guidance for quantum-resistant passwords", () => {
      const auditReport = {
        generation: {
          algorithm: "quantum-safe",
        },
        password: {
          length: 43,
          entropy: 256,
        },
      };
      const config = { type: "quantum-resistant" };

      cliService.displaySecurityAuditReport(auditReport, config);

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("storage guidance");
      expect(allCalls).to.include("Argon2id");
      expect(allCalls).to.include("OWASP");
    });

    it("should not display storage guidance for non-quantum passwords", () => {
      const auditReport = {
        generation: {
          algorithm: "standard",
        },
        password: {
          length: 16,
          entropy: 100,
        },
      };
      const config = { type: "strong" };

      cliService.displaySecurityAuditReport(auditReport, config);

      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.not.include("storage guidance");
    });

    it("should display JSON stringified report when auditReport is null", () => {
      cliService.displaySecurityAuditReport(null);

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("null");
    });

    it("should display JSON stringified report when auditReport is undefined", () => {
      cliService.displaySecurityAuditReport(undefined);

      expect(consoleLogStub.called).to.be.true;
    });

    it("should display JSON stringified report when auditReport is empty object", () => {
      // An empty object is truthy, so it won't go to the else branch
      // This tests the case where generation and password are both undefined
      cliService.displaySecurityAuditReport({});

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("NIST SP 800-63B compliant");
    });

    it("should use default config when not provided", () => {
      const auditReport = {
        generation: { algorithm: "test" },
      };

      cliService.displaySecurityAuditReport(auditReport);

      expect(consoleLogStub.called).to.be.true;
    });
  });

  describe("displayNonTTYHelp", () => {
    it("should display non-TTY help message", () => {
      cliService.displayNonTTYHelp();

      expect(consoleLogStub.called).to.be.true;
      const allCalls = consoleLogStub.args.map((args) => args.join(" ")).join(" ");
      expect(allCalls).to.include("password-generator -p quick");
      expect(allCalls).to.include("password-generator -p secure");
      expect(allCalls).to.include("password-generator --help");
    });
  });
});

// ============================================================================
// Config Service Tests
// ============================================================================

describe("config-service", () => {
  let configService;

  beforeEach(async () => {
    configService = await import("../../src/services/config-service.js");
  });

  describe("mergePresetWithOptions", () => {
    it("should return user options when no preset is provided", () => {
      const userOptions = {
        type: "strong",
        length: 16,
        iteration: 3,
        separator: "-",
      };

      const result = configService.mergePresetWithOptions(undefined, userOptions);

      expect(result).to.deep.equal(userOptions);
    });

    it("should return user options when preset is null", () => {
      const userOptions = {
        type: "memorable",
        iteration: 4,
        separator: " ",
      };

      const result = configService.mergePresetWithOptions(null, userOptions);

      expect(result).to.deep.equal(userOptions);
    });

    it("should return user options when preset is empty string", () => {
      const userOptions = {
        type: "base64",
        length: 20,
        iteration: 2,
        separator: "+",
      };

      const result = configService.mergePresetWithOptions("", userOptions);

      expect(result).to.deep.equal(userOptions);
    });

    it("should filter out undefined values from user options", () => {
      const userOptions = {
        type: "strong",
        length: undefined,
        iteration: 5,
        separator: undefined,
      };

      const result = configService.mergePresetWithOptions(null, userOptions);

      expect(result).to.deep.equal({
        type: "strong",
        iteration: 5,
      });
    });

    it("should merge preset with user options for quick preset", () => {
      const userOptions = {
        length: 20,
      };

      const result = configService.mergePresetWithOptions("quick", userOptions);

      expect(result).to.deep.equal({
        type: "strong",
        length: 20, // User override
        iteration: 4,
        separator: "-",
      });
    });

    it("should merge preset with user options for secure preset", () => {
      const userOptions = {
        type: "base64",
      };

      const result = configService.mergePresetWithOptions("secure", userOptions);

      expect(result).to.deep.equal({
        type: "base64", // User override
        length: 16,
        iteration: 4,
        separator: "",
      });
    });

    it("should merge preset with user options for memorable preset", () => {
      const userOptions = {
        separator: " ",
      };

      const result = configService.mergePresetWithOptions("memorable", userOptions);

      expect(result).to.deep.equal({
        type: "memorable",
        iteration: 4,
        separator: " ", // User override
      });
    });

    it("should merge preset with user options for quantum preset", () => {
      const userOptions = {
        length: 64,
      };

      const result = configService.mergePresetWithOptions("quantum", userOptions);

      expect(result).to.deep.equal({
        type: "quantum-resistant",
        length: 64, // User override
        iteration: 1,
        separator: "",
      });
    });

    it("should throw error for invalid preset", () => {
      expect(() => {
        configService.mergePresetWithOptions("invalid", {});
      }).to.throw("Invalid preset 'invalid'. Valid presets: quick, secure, memorable, quantum");
    });

    it("should throw error for unknown preset", () => {
      expect(() => {
        configService.mergePresetWithOptions("unknown", { type: "strong" });
      }).to.throw("Invalid preset 'unknown'");
    });

    it("should allow user to override all preset values", () => {
      const userOptions = {
        type: "base64",
        length: 32,
        iteration: 8,
        separator: "_",
      };

      const result = configService.mergePresetWithOptions("quick", userOptions);

      expect(result).to.deep.equal(userOptions);
    });
  });

  describe("validateFinalConfig", () => {
    it("should not throw for valid configuration", () => {
      const config = {
        type: "strong",
        iteration: 3,
        separator: "-",
      };

      expect(() => {
        configService.validateFinalConfig(config, false);
      }).to.not.throw();
    });

    it("should not throw for valid configuration with length", () => {
      const config = {
        type: "base64",
        length: 20,
        iteration: 2,
        separator: "+",
      };

      expect(() => {
        configService.validateFinalConfig(config, true);
      }).to.not.throw();
    });

    it("should throw for missing type", () => {
      const config = {
        iteration: 3,
        separator: "-",
      };

      expect(() => {
        configService.validateFinalConfig(config, false);
      }).to.throw("Missing required options: type");
    });

    it("should throw for missing iteration", () => {
      const config = {
        type: "strong",
        separator: "-",
      };

      expect(() => {
        configService.validateFinalConfig(config, false);
      }).to.throw("Missing required options: iteration");
    });

    it("should throw for missing separator", () => {
      const config = {
        type: "strong",
        iteration: 3,
      };

      expect(() => {
        configService.validateFinalConfig(config, false);
      }).to.throw("Missing required options: separator");
    });

    it("should throw for multiple missing fields", () => {
      const config = {};

      expect(() => {
        configService.validateFinalConfig(config, false);
      }).to.throw("Missing required options: type, iteration, separator");
    });

    it("should throw for missing type and iteration", () => {
      const config = {
        separator: "-",
      };

      expect(() => {
        configService.validateFinalConfig(config, false);
      }).to.throw("Missing required options: type, iteration");
    });

    it("should throw with preset message when hasPreset is true", () => {
      const config = {
        length: 16,
      };

      expect(() => {
        configService.validateFinalConfig(config, true);
      }).to.throw("This should not happen with a valid preset");
    });

    it("should throw with suggestion when hasPreset is false", () => {
      const config = {
        length: 16,
      };

      expect(() => {
        configService.validateFinalConfig(config, false);
      }).to.throw("Either provide these options or use a preset (-p quick)");
    });

    it("should throw for invalid password type", () => {
      const config = {
        type: "invalid",
        iteration: 3,
        separator: "-",
      };

      expect(() => {
        configService.validateFinalConfig(config, false);
      }).to.throw("Invalid password type 'invalid'");
    });

    it("should throw for unknown password type", () => {
      const config = {
        type: "unknown-type",
        iteration: 3,
        separator: "-",
      };

      expect(() => {
        configService.validateFinalConfig(config, true);
      }).to.throw("Valid types: strong, base64, memorable, quantum-resistant");
    });

    it("should accept all valid password types", () => {
      const validTypes = ["strong", "base64", "memorable", "quantum-resistant"];

      validTypes.forEach((type) => {
        const config = {
          type,
          iteration: 3,
          separator: "-",
        };

        expect(() => {
          configService.validateFinalConfig(config, false);
        }).to.not.throw();
      });
    });

    it("should accept empty string as separator", () => {
      const config = {
        type: "strong",
        iteration: 3,
        separator: "",
      };

      expect(() => {
        configService.validateFinalConfig(config, false);
      }).to.not.throw();
    });

    it("should accept zero as iteration", () => {
      const config = {
        type: "strong",
        iteration: 0,
        separator: "-",
      };

      expect(() => {
        configService.validateFinalConfig(config, false);
      }).to.not.throw();
    });
  });

  describe("normalizeConfig", () => {
    it("should normalize config with all fields", () => {
      const config = {
        type: "strong",
        length: 16,
        iteration: 3,
        separator: "-",
        extraField: "should be included",
      };

      const result = configService.normalizeConfig(config);

      expect(result).to.deep.equal({
        type: "strong",
        length: 16,
        iteration: 3,
        separator: "-",
      });
    });

    it("should normalize config without length", () => {
      const config = {
        type: "memorable",
        iteration: 4,
        separator: "-",
      };

      const result = configService.normalizeConfig(config);

      expect(result).to.deep.equal({
        type: "memorable",
        length: undefined,
        iteration: 4,
        separator: "-",
      });
    });

    it("should normalize config with zero length", () => {
      const config = {
        type: "strong",
        length: 0,
        iteration: 3,
        separator: "-",
      };

      const result = configService.normalizeConfig(config);

      expect(result).to.deep.equal({
        type: "strong",
        length: 0,
        iteration: 3,
        separator: "-",
      });
    });

    it("should normalize config with empty separator", () => {
      const config = {
        type: "base64",
        length: 20,
        iteration: 2,
        separator: "",
      };

      const result = configService.normalizeConfig(config);

      expect(result).to.deep.equal({
        type: "base64",
        length: 20,
        iteration: 2,
        separator: "",
      });
    });
  });

  describe("processConfiguration", () => {
    it("should process valid configuration without preset", () => {
      const userOptions = {
        type: "strong",
        length: 16,
        iteration: 3,
        separator: "-",
      };

      const result = configService.processConfiguration(undefined, userOptions);

      expect(result).to.deep.equal({
        type: "strong",
        length: 16,
        iteration: 3,
        separator: "-",
      });
    });

    it("should process valid configuration with preset", () => {
      const userOptions = {
        length: 20,
      };

      const result = configService.processConfiguration("quick", userOptions);

      expect(result).to.deep.equal({
        type: "strong",
        length: 20,
        iteration: 4,
        separator: "-",
      });
    });

    it("should process configuration with secure preset", () => {
      const result = configService.processConfiguration("secure", {});

      expect(result).to.deep.equal({
        type: "strong",
        length: 16,
        iteration: 4,
        separator: "",
      });
    });

    it("should process configuration with memorable preset", () => {
      const result = configService.processConfiguration("memorable", {});

      expect(result).to.deep.equal({
        type: "memorable",
        length: undefined,
        iteration: 4,
        separator: "-",
      });
    });

    it("should process configuration with quantum preset", () => {
      const result = configService.processConfiguration("quantum", {});

      expect(result).to.deep.equal({
        type: "quantum-resistant",
        length: 43,
        iteration: 1,
        separator: "",
      });
    });

    it("should throw error for invalid preset", () => {
      expect(() => {
        configService.processConfiguration("invalid", {});
      }).to.throw("Invalid preset 'invalid'");
    });

    it("should throw error for missing required options without preset", () => {
      expect(() => {
        configService.processConfiguration(undefined, { type: "strong" });
      }).to.throw("Missing required options: iteration, separator");
    });

    it("should throw error for invalid type in user options", () => {
      expect(() => {
        configService.processConfiguration("quick", { type: "invalid" });
      }).to.throw("Invalid password type 'invalid'");
    });

    it("should filter undefined values and use preset defaults", () => {
      const userOptions = {
        type: undefined,
        length: undefined,
        iteration: undefined,
        separator: undefined,
      };

      const result = configService.processConfiguration("quick", userOptions);

      expect(result).to.deep.equal({
        type: "strong",
        length: 14,
        iteration: 4,
        separator: "-",
      });
    });
  });
});
