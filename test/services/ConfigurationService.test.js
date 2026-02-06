// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { ConfigurationService } from "../../src/services/ConfigurationService.js";

describe("ConfigurationService", function () {
  describe("mergePresetWithOptions", function () {
    it("should merge preset with user options, giving priority to user options", function () {
      const userOptions = {
        type: "base64",
        length: 20,
        iteration: undefined, // Should be filtered out
        separator: "|",
      };

      const result = ConfigurationService.mergePresetWithOptions("quick", userOptions);

      expect(result).to.deep.equal({
        type: "base64", // Overridden by user
        length: 20, // Overridden by user
        iteration: 3, // From quick preset
        separator: "|", // Overridden by user
      });
    });

    it("should return user options when no preset is provided", function () {
      const userOptions = {
        type: "strong",
        length: 16,
        iteration: 2,
        separator: "-",
      };

      const result = ConfigurationService.mergePresetWithOptions(undefined, userOptions);

      expect(result).to.deep.equal({
        type: "strong",
        length: 16,
        iteration: 2,
        separator: "-",
      });
    });

    it("should filter out undefined values from user options", function () {
      const userOptions = {
        type: "strong",
        length: undefined,
        iteration: 5,
        separator: undefined,
      };

      const result = ConfigurationService.mergePresetWithOptions("secure", userOptions);

      expect(result).to.deep.equal({
        type: "strong", // Overridden by user
        length: 16, // From secure preset (user undefined filtered out)
        iteration: 5, // Overridden by user
        separator: "", // From secure preset (user undefined filtered out)
      });
    });

    it("should throw error for invalid preset", function () {
      expect(() => {
        ConfigurationService.mergePresetWithOptions("invalid", {});
      }).to.throw("Invalid preset 'invalid'. Valid presets: quick, secure, memorable");
    });

    it("should handle empty user options object", function () {
      const result = ConfigurationService.mergePresetWithOptions("memorable", {});

      expect(result).to.deep.equal({
        type: "memorable",
        iteration: 4,
        separator: "-",
      });
    });
  });

  describe("validateFinalConfig", function () {
    it("should not throw for valid configuration", function () {
      const config = {
        type: "strong",
        length: 16,
        iteration: 3,
        separator: "-",
      };

      expect(() => {
        ConfigurationService.validateFinalConfig(config, false);
      }).to.not.throw();
    });

    it("should throw for missing type", function () {
      const config = {
        iteration: 3,
        separator: "-",
      };

      expect(() => {
        ConfigurationService.validateFinalConfig(config, false);
      }).to.throw("Missing required options: type");
    });

    it("should throw for missing iteration", function () {
      const config = {
        type: "strong",
        separator: "-",
      };

      expect(() => {
        ConfigurationService.validateFinalConfig(config, false);
      }).to.throw("Missing required options: iteration");
    });

    it("should throw for missing separator", function () {
      const config = {
        type: "strong",
        iteration: 3,
      };

      expect(() => {
        ConfigurationService.validateFinalConfig(config, false);
      }).to.throw("Missing required options: separator");
    });

    it("should throw for multiple missing fields", function () {
      const config = {
        length: 16,
      };

      expect(() => {
        ConfigurationService.validateFinalConfig(config, false);
      }).to.throw("Missing required options: type, iteration, separator");
    });

    it("should throw for invalid password type", function () {
      const config = {
        type: "invalid",
        iteration: 3,
        separator: "-",
      };

      expect(() => {
        ConfigurationService.validateFinalConfig(config, false);
      }).to.throw("Invalid password type 'invalid'. Valid types: strong, base64, memorable");
    });

    it("should handle missing required with preset flag", function () {
      const config = {
        length: 16,
      };

      expect(() => {
        ConfigurationService.validateFinalConfig(config, true);
      }).to.throw("Missing required options: type, iteration, separator. This should not happen with a valid preset.");
    });

    it("should suggest preset when no preset was used", function () {
      const config = {
        length: 16,
      };

      expect(() => {
        ConfigurationService.validateFinalConfig(config, false);
      }).to.throw("Either provide these options or use a preset (-p quick)");
    });

    it("should validate memorable type without length", function () {
      const config = {
        type: "memorable",
        iteration: 4,
        separator: "-",
      };

      expect(() => {
        ConfigurationService.validateFinalConfig(config, false);
      }).to.not.throw();
    });
  });

  describe("resolveConfiguration", function () {
    it("should merge and validate configuration in one step", function () {
      const userOptions = {
        type: "base64",
        length: 20,
      };

      const result = ConfigurationService.resolveConfiguration("quick", userOptions);

      expect(result).to.deep.equal({
        type: "base64",
        length: 20,
        iteration: 3,
        separator: "-",
      });
    });

    it("should throw validation error after merging", function () {
      const userOptions = {
        type: "invalid",
      };

      expect(() => {
        ConfigurationService.resolveConfiguration("quick", userOptions);
      }).to.throw("Invalid password type 'invalid'");
    });

    it("should throw preset error during merging", function () {
      expect(() => {
        ConfigurationService.resolveConfiguration("invalid", {});
      }).to.throw("Invalid preset 'invalid'");
    });

    it("should work without preset", function () {
      const userOptions = {
        type: "strong",
        iteration: 2,
        separator: "|",
      };

      const result = ConfigurationService.resolveConfiguration(undefined, userOptions);

      expect(result).to.deep.equal({
        type: "strong",
        iteration: 2,
        separator: "|",
      });
    });
  });

  describe("createGenerationConfig", function () {
    it("should create clean config with all properties", function () {
      const config = {
        type: "strong",
        length: 16,
        iteration: 3,
        separator: "-",
        extraProp: "should be filtered",
      };

      const result = ConfigurationService.createGenerationConfig(config);

      expect(result).to.deep.equal({
        type: "strong",
        length: 16,
        iteration: 3,
        separator: "-",
      });
    });

    it("should exclude length when undefined", function () {
      const config = {
        type: "memorable",
        iteration: 4,
        separator: "-",
        extraProp: "should be filtered",
      };

      const result = ConfigurationService.createGenerationConfig(config);

      expect(result).to.deep.equal({
        type: "memorable",
        iteration: 4,
        separator: "-",
      });
    });

    it("should include length when zero", function () {
      const config = {
        type: "strong",
        length: 0,
        iteration: 3,
        separator: "-",
      };

      const result = ConfigurationService.createGenerationConfig(config);

      expect(result).to.deep.equal({
        type: "strong",
        length: 0,
        iteration: 3,
        separator: "-",
      });
    });

    it("should handle minimal configuration", function () {
      const config = {
        type: "memorable",
        iteration: 2,
        separator: " ",
      };

      const result = ConfigurationService.createGenerationConfig(config);

      expect(result).to.deep.equal({
        type: "memorable",
        iteration: 2,
        separator: " ",
      });
    });
  });
});