// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it } from "mocha";

// Import view models
import {
  EntropyViewModel,
  PasswordViewModel,
  ValidationViewModel,
} from "../../../src/ui/web/view-models/index.js";

describe("View Models", () => {
  describe("EntropyViewModel", () => {
    describe("constructor", () => {
      it("should create view model with all properties from entropyInfo", () => {
        const entropyInfo = {
          totalBits: 128,
          perUnit: 10.5,
          securityLevel: "strong",
          recommendation: "Good for most purposes",
        };

        const vm = new EntropyViewModel(entropyInfo);

        expect(vm.totalBits).to.equal(128);
        expect(vm.perUnit).to.equal(10.5);
        expect(vm.securityLevel).to.equal("strong");
        expect(vm.recommendation).to.equal("Good for most purposes");
      });

      it("should use default values when properties are missing", () => {
        const vm = new EntropyViewModel({});

        expect(vm.totalBits).to.equal(0);
        expect(vm.perUnit).to.equal(0);
        expect(vm.securityLevel).to.equal("unknown");
        expect(vm.recommendation).to.equal("");
      });

      it("should calculate displayBits as rounded value", () => {
        const vm = new EntropyViewModel({ totalBits: 128.7 });
        expect(vm.displayBits).to.equal(129);
      });

      it("should calculate strengthPercentage correctly", () => {
        // 128 bits = 50% of 256
        const vm = new EntropyViewModel({ totalBits: 128 });
        expect(vm.strengthPercentage).to.equal(50);
      });

      it("should cap strengthPercentage at 100%", () => {
        const vm = new EntropyViewModel({ totalBits: 300 });
        expect(vm.strengthPercentage).to.equal(100);
      });

      it("should set progressBarWidth based on percentage", () => {
        const vm = new EntropyViewModel({ totalBits: 128 });
        expect(vm.progressBarWidth).to.equal("50%");
      });
    });

    describe("_calculatePercentage", () => {
      it("should return 0 for 0 bits", () => {
        const vm = new EntropyViewModel({ totalBits: 0 });
        expect(vm.strengthPercentage).to.equal(0);
      });

      it("should return 100 for 256 bits", () => {
        const vm = new EntropyViewModel({ totalBits: 256 });
        expect(vm.strengthPercentage).to.equal(100);
      });

      it("should return 100 for bits exceeding 256", () => {
        const vm = new EntropyViewModel({ totalBits: 512 });
        expect(vm.strengthPercentage).to.equal(100);
      });
    });

    describe("_getStrengthLabel", () => {
      it("should return 'Excellent' for 256+ bits", () => {
        const vm = new EntropyViewModel({ totalBits: 256 });
        expect(vm.strengthLabel).to.equal("Excellent");
      });

      it("should return 'Strong' for 128-255 bits", () => {
        const vm = new EntropyViewModel({ totalBits: 128 });
        expect(vm.strengthLabel).to.equal("Strong");

        const vm2 = new EntropyViewModel({ totalBits: 255 });
        expect(vm2.strengthLabel).to.equal("Strong");
      });

      it("should return 'Good' for 80-127 bits", () => {
        const vm = new EntropyViewModel({ totalBits: 80 });
        expect(vm.strengthLabel).to.equal("Good");

        const vm2 = new EntropyViewModel({ totalBits: 127 });
        expect(vm2.strengthLabel).to.equal("Good");
      });

      it("should return 'Moderate' for 64-79 bits", () => {
        const vm = new EntropyViewModel({ totalBits: 64 });
        expect(vm.strengthLabel).to.equal("Moderate");

        const vm2 = new EntropyViewModel({ totalBits: 79 });
        expect(vm2.strengthLabel).to.equal("Moderate");
      });

      it("should return 'Weak' for 40-63 bits", () => {
        const vm = new EntropyViewModel({ totalBits: 40 });
        expect(vm.strengthLabel).to.equal("Weak");

        const vm2 = new EntropyViewModel({ totalBits: 63 });
        expect(vm2.strengthLabel).to.equal("Weak");
      });

      it("should return 'Very Weak' for less than 40 bits", () => {
        const vm = new EntropyViewModel({ totalBits: 39 });
        expect(vm.strengthLabel).to.equal("Very Weak");

        const vm2 = new EntropyViewModel({ totalBits: 0 });
        expect(vm2.strengthLabel).to.equal("Very Weak");
      });
    });

    describe("_getStrengthColor", () => {
      it("should return 'green' for 128+ bits", () => {
        const vm = new EntropyViewModel({ totalBits: 128 });
        expect(vm.strengthColor).to.equal("green");

        const vm2 = new EntropyViewModel({ totalBits: 256 });
        expect(vm2.strengthColor).to.equal("green");
      });

      it("should return 'blue' for 80-127 bits", () => {
        const vm = new EntropyViewModel({ totalBits: 80 });
        expect(vm.strengthColor).to.equal("blue");

        const vm2 = new EntropyViewModel({ totalBits: 127 });
        expect(vm2.strengthColor).to.equal("blue");
      });

      it("should return 'yellow' for 64-79 bits", () => {
        const vm = new EntropyViewModel({ totalBits: 64 });
        expect(vm.strengthColor).to.equal("yellow");

        const vm2 = new EntropyViewModel({ totalBits: 79 });
        expect(vm2.strengthColor).to.equal("yellow");
      });

      it("should return 'orange' for 40-63 bits", () => {
        const vm = new EntropyViewModel({ totalBits: 40 });
        expect(vm.strengthColor).to.equal("orange");

        const vm2 = new EntropyViewModel({ totalBits: 63 });
        expect(vm2.strengthColor).to.equal("orange");
      });

      it("should return 'red' for less than 40 bits", () => {
        const vm = new EntropyViewModel({ totalBits: 39 });
        expect(vm.strengthColor).to.equal("red");

        const vm2 = new EntropyViewModel({ totalBits: 0 });
        expect(vm2.strengthColor).to.equal("red");
      });
    });

    describe("fromEntropyInfo", () => {
      it("should create view model using factory method", () => {
        const entropyInfo = {
          totalBits: 100,
          perUnit: 12.5,
          securityLevel: "good",
          recommendation: "Recommended",
        };

        const vm = EntropyViewModel.fromEntropyInfo(entropyInfo);

        expect(vm).to.be.instanceOf(EntropyViewModel);
        expect(vm.totalBits).to.equal(100);
      });
    });

    describe("getDisplayString", () => {
      it("should return formatted display string", () => {
        const vm = new EntropyViewModel({ totalBits: 128 });
        expect(vm.getDisplayString()).to.equal("128-bit · Strong");
      });

      it("should handle decimal bits with rounding", () => {
        const vm = new EntropyViewModel({ totalBits: 128.7 });
        expect(vm.getDisplayString()).to.equal("129-bit · Strong");
      });
    });

    describe("getAriaLabel", () => {
      it("should return accessible description", () => {
        const vm = new EntropyViewModel({ totalBits: 128 });
        expect(vm.getAriaLabel()).to.equal(
          "Password strength: Strong with 128 bits of entropy"
        );
      });
    });

    describe("toJSON", () => {
      it("should return plain object representation", () => {
        const entropyInfo = {
          totalBits: 128,
          securityLevel: "strong",
          recommendation: "Good password",
        };

        const vm = new EntropyViewModel(entropyInfo);
        const json = vm.toJSON();

        expect(json).to.deep.equal({
          totalBits: 128,
          displayBits: 128,
          securityLevel: "strong",
          strengthLabel: "Strong",
          strengthColor: "green",
          strengthPercentage: 50,
          recommendation: "Good password",
        });
      });
    });
  });

  describe("PasswordViewModel", () => {
    describe("constructor", () => {
      it("should create view model with all properties from data", () => {
        const data = {
          password: "TestPassword123!",
          entropyInfo: {
            totalBits: 80,
            securityLevel: "good",
            recommendation: "Use for most purposes",
          },
          config: {
            type: "strong",
            length: 16,
            iteration: 1,
            separator: "-",
          },
        };

        const vm = new PasswordViewModel(data);

        expect(vm.password).to.equal("TestPassword123!");
        expect(vm.length).to.equal(16);
        expect(vm.entropyBits).to.equal(80);
        expect(vm.securityLevel).to.equal("good");
        expect(vm.securityRecommendation).to.equal("Use for most purposes");
        expect(vm.type).to.equal("strong");
        expect(vm.generatedAt).to.be.a("string");
      });

      it("should handle missing entropyInfo", () => {
        const data = {
          password: "TestPassword",
          config: { type: "strong" },
        };

        const vm = new PasswordViewModel(data);

        expect(vm.entropyBits).to.equal(0);
        expect(vm.securityLevel).to.equal("unknown");
        expect(vm.securityRecommendation).to.equal("");
      });

      it("should handle missing config", () => {
        const data = {
          password: "TestPassword",
          entropyInfo: { totalBits: 80 },
        };

        const vm = new PasswordViewModel(data);

        expect(vm.type).to.equal("");
        expect(vm.configSummary).to.equal("");
      });

      it("should handle null password", () => {
        const data = {
          password: null,
          entropyInfo: { totalBits: 0 },
          config: {},
        };

        const vm = new PasswordViewModel(data);

        expect(vm.password).to.equal(null);
        expect(vm.maskedPassword).to.equal("");
        expect(vm.length).to.equal(0);
      });

      it("should handle undefined password", () => {
        const data = {
          entropyInfo: { totalBits: 0 },
          config: {},
        };

        const vm = new PasswordViewModel(data);

        expect(vm.password).to.be.undefined;
        expect(vm.maskedPassword).to.equal("");
        expect(vm.length).to.equal(0);
      });
    });

    describe("_maskPassword", () => {
      it("should mask password showing first and last 2 chars", () => {
        const data = { password: "Password123!", config: {} };
        const vm = new PasswordViewModel(data);

        expect(vm.maskedPassword).to.equal("Pa********3!");
      });

      it("should fully mask passwords of 4 or fewer chars", () => {
        const data = { password: "test", config: {} };
        const vm = new PasswordViewModel(data);
        expect(vm.maskedPassword).to.equal("****");

        const data2 = { password: "abc", config: {} };
        const vm2 = new PasswordViewModel(data2);
        expect(vm2.maskedPassword).to.equal("***");

        const data3 = { password: "ab", config: {} };
        const vm3 = new PasswordViewModel(data3);
        expect(vm3.maskedPassword).to.equal("**");

        const data4 = { password: "a", config: {} };
        const vm4 = new PasswordViewModel(data4);
        expect(vm4.maskedPassword).to.equal("*");
      });

      it("should return empty string for empty password", () => {
        const data = { password: "", config: {} };
        const vm = new PasswordViewModel(data);
        expect(vm.maskedPassword).to.equal("");
      });

      it("should return empty string for null password", () => {
        const data = { password: null, config: {} };
        const vm = new PasswordViewModel(data);
        expect(vm.maskedPassword).to.equal("");
      });

      it("should return empty string for undefined password", () => {
        const data = { config: {} };
        const vm = new PasswordViewModel(data);
        expect(vm.maskedPassword).to.equal("");
      });
    });

    describe("_mapToStrengthIndicator", () => {
      it("should return maximum for 128+ bits", () => {
        const data = {
          password: "test",
          entropyInfo: { totalBits: 128 },
          config: {},
        };
        const vm = new PasswordViewModel(data);

        expect(vm.strengthIndicator).to.deep.equal({
          level: "maximum",
          label: "Maximum",
          dots: 4,
          color: "success",
        });
      });

      it("should return strong for 80-127 bits", () => {
        const data = {
          password: "test",
          entropyInfo: { totalBits: 80 },
          config: {},
        };
        const vm = new PasswordViewModel(data);

        expect(vm.strengthIndicator).to.deep.equal({
          level: "strong",
          label: "Strong",
          dots: 3,
          color: "success",
        });

        const data2 = {
          password: "test",
          entropyInfo: { totalBits: 127 },
          config: {},
        };
        const vm2 = new PasswordViewModel(data2);
        expect(vm2.strengthIndicator.level).to.equal("strong");
      });

      it("should return medium for 64-79 bits", () => {
        const data = {
          password: "test",
          entropyInfo: { totalBits: 64 },
          config: {},
        };
        const vm = new PasswordViewModel(data);

        expect(vm.strengthIndicator).to.deep.equal({
          level: "medium",
          label: "Medium",
          dots: 2,
          color: "warning",
        });

        const data2 = {
          password: "test",
          entropyInfo: { totalBits: 79 },
          config: {},
        };
        const vm2 = new PasswordViewModel(data2);
        expect(vm2.strengthIndicator.level).to.equal("medium");
      });

      it("should return weak for less than 64 bits", () => {
        const data = {
          password: "test",
          entropyInfo: { totalBits: 63 },
          config: {},
        };
        const vm = new PasswordViewModel(data);

        expect(vm.strengthIndicator).to.deep.equal({
          level: "weak",
          label: "Weak",
          dots: 1,
          color: "error",
        });

        const data2 = {
          password: "test",
          entropyInfo: { totalBits: 0 },
          config: {},
        };
        const vm2 = new PasswordViewModel(data2);
        expect(vm2.strengthIndicator.level).to.equal("weak");
      });

      it("should handle null entropyInfo", () => {
        const data = {
          password: "test",
          entropyInfo: null,
          config: {},
        };
        const vm = new PasswordViewModel(data);
        expect(vm.strengthIndicator.level).to.equal("weak");
      });

      it("should handle undefined entropyInfo", () => {
        const data = {
          password: "test",
          config: {},
        };
        const vm = new PasswordViewModel(data);
        expect(vm.strengthIndicator.level).to.equal("weak");
      });

      it("should handle entropyInfo with missing totalBits", () => {
        const data = {
          password: "test",
          entropyInfo: {},
          config: {},
        };
        const vm = new PasswordViewModel(data);
        expect(vm.strengthIndicator.level).to.equal("weak");
      });
    });

    describe("_formatConfigSummary", () => {
      it("should format full config summary", () => {
        const data = {
          password: "test",
          config: {
            type: "strong",
            length: 16,
            iteration: 3,
            separator: "-",
          },
        };
        const vm = new PasswordViewModel(data);

        expect(vm.configSummary).to.equal(
          'Type: strong | Length: 16 | Iterations: 3 | Separator: "-"'
        );
      });

      it("should format partial config summary", () => {
        const data = {
          password: "test",
          config: {
            type: "memorable",
            iteration: 5,
          },
        };
        const vm = new PasswordViewModel(data);

        expect(vm.configSummary).to.equal("Type: memorable | Iterations: 5");
      });

      it("should handle config with only type", () => {
        const data = {
          password: "test",
          config: { type: "strong" },
        };
        const vm = new PasswordViewModel(data);
        expect(vm.configSummary).to.equal("Type: strong");
      });

      it("should handle empty config", () => {
        const data = {
          password: "test",
          config: {},
        };
        const vm = new PasswordViewModel(data);
        expect(vm.configSummary).to.equal("");
      });

      it("should handle null config", () => {
        const data = {
          password: "test",
          config: null,
        };
        const vm = new PasswordViewModel(data);
        expect(vm.configSummary).to.equal("");
      });

      it("should handle undefined config", () => {
        const data = {
          password: "test",
        };
        const vm = new PasswordViewModel(data);
        expect(vm.configSummary).to.equal("");
      });

      it("should handle empty string separator", () => {
        const data = {
          password: "test",
          config: {
            type: "base64",
            separator: "",
          },
        };
        const vm = new PasswordViewModel(data);
        // Empty string separator should not be included
        expect(vm.configSummary).to.equal("Type: base64");
      });
    });

    describe("fromGenerationResult", () => {
      it("should create view model using factory method", () => {
        const result = {
          password: "GeneratedPassword123",
          entropyInfo: { totalBits: 100 },
          config: { type: "strong" },
        };

        const vm = PasswordViewModel.fromGenerationResult(result);

        expect(vm).to.be.instanceOf(PasswordViewModel);
        expect(vm.password).to.equal("GeneratedPassword123");
      });
    });

    describe("getDisplayPassword", () => {
      it("should return password when showPassword is true", () => {
        const data = {
          password: "MyPassword123",
          config: {},
        };
        const vm = new PasswordViewModel(data);

        expect(vm.getDisplayPassword(true)).to.equal("MyPassword123");
      });

      it("should return masked password when showPassword is false", () => {
        const data = {
          password: "MyPassword123",
          config: {},
        };
        const vm = new PasswordViewModel(data);

        expect(vm.getDisplayPassword(false)).to.equal("My*********23");
      });

      it("should default to showing password", () => {
        const data = {
          password: "MyPassword123",
          config: {},
        };
        const vm = new PasswordViewModel(data);

        expect(vm.getDisplayPassword()).to.equal("MyPassword123");
      });
    });

    describe("getStrengthDots", () => {
      it("should return 4 filled dots for maximum strength", () => {
        const data = {
          password: "test",
          entropyInfo: { totalBits: 128 },
          config: {},
        };
        const vm = new PasswordViewModel(data);
        expect(vm.getStrengthDots()).to.equal("●●●●");
      });

      it("should return 3 filled dots for strong", () => {
        const data = {
          password: "test",
          entropyInfo: { totalBits: 80 },
          config: {},
        };
        const vm = new PasswordViewModel(data);
        expect(vm.getStrengthDots()).to.equal("●●●○");
      });

      it("should return 2 filled dots for medium", () => {
        const data = {
          password: "test",
          entropyInfo: { totalBits: 64 },
          config: {},
        };
        const vm = new PasswordViewModel(data);
        expect(vm.getStrengthDots()).to.equal("●●○○");
      });

      it("should return 1 filled dot for weak", () => {
        const data = {
          password: "test",
          entropyInfo: { totalBits: 40 },
          config: {},
        };
        const vm = new PasswordViewModel(data);
        expect(vm.getStrengthDots()).to.equal("●○○○");
      });
    });

    describe("toJSON", () => {
      it("should return plain object representation", () => {
        const data = {
          password: "TestPassword",
          entropyInfo: { totalBits: 80, securityLevel: "good" },
          config: { type: "strong", length: 12 },
        };
        const vm = new PasswordViewModel(data);
        const json = vm.toJSON();

        expect(json.password).to.equal("TestPassword");
        expect(json.maskedPassword).to.equal("Te********rd");
        expect(json.length).to.equal(12);
        expect(json.entropyBits).to.equal(80);
        expect(json.securityLevel).to.equal("good");
        expect(json.strengthIndicator).to.deep.equal({
          level: "strong",
          label: "Strong",
          dots: 3,
          color: "success",
        });
        expect(json.type).to.equal("strong");
        expect(json.configSummary).to.equal("Type: strong | Length: 12");
        expect(json.generatedAt).to.be.a("string");
      });
    });
  });

  describe("ValidationViewModel", () => {
    describe("constructor", () => {
      it("should create view model with all properties", () => {
        const data = {
          isValid: false,
          errors: ["Type error", "Length error"],
          fieldErrors: {
            type: "Type error",
            length: "Length error",
            iteration: null,
            separator: null,
          },
        };

        const vm = new ValidationViewModel(data);

        expect(vm.isValid).to.be.false;
        expect(vm.errors).to.deep.equal(["Type error", "Length error"]);
        expect(vm.hasTypeError).to.be.true;
        expect(vm.hasLengthError).to.be.true;
        expect(vm.hasIterationError).to.be.false;
        expect(vm.hasSeparatorError).to.be.false;
        expect(vm.hasErrors).to.be.true;
      });

      it("should set hasErrors to false when valid", () => {
        const data = {
          isValid: true,
          errors: [],
          fieldErrors: {
            type: null,
            length: null,
            iteration: null,
            separator: null,
          },
        };

        const vm = new ValidationViewModel(data);
        expect(vm.hasErrors).to.be.false;
      });
    });

    describe("fromValidationResult", () => {
      it("should map type errors correctly", () => {
        const validation = {
          isValid: false,
          errors: ["Invalid type specified"],
        };

        const vm = ValidationViewModel.fromValidationResult(validation);

        expect(vm.fieldErrors.type).to.equal("Invalid type specified");
        expect(vm.hasTypeError).to.be.true;
      });

      it("should map length errors correctly", () => {
        const validation = {
          isValid: false,
          errors: ["Invalid length value"],
        };

        const vm = ValidationViewModel.fromValidationResult(validation);

        expect(vm.fieldErrors.length).to.equal("Invalid length value");
        expect(vm.hasLengthError).to.be.true;
      });

      it("should map iteration errors correctly", () => {
        const validation = {
          isValid: false,
          errors: ["Iteration must be positive"],
        };

        const vm = ValidationViewModel.fromValidationResult(validation);

        expect(vm.fieldErrors.iteration).to.equal("Iteration must be positive");
        expect(vm.hasIterationError).to.be.true;
      });

      it("should map separator errors correctly", () => {
        const validation = {
          isValid: false,
          errors: ["Invalid separator character"],
        };

        const vm = ValidationViewModel.fromValidationResult(validation);

        expect(vm.fieldErrors.separator).to.equal("Invalid separator character");
        expect(vm.hasSeparatorError).to.be.true;
      });

      it("should handle multiple errors of different types", () => {
        const validation = {
          isValid: false,
          errors: [
            "Unknown type value",
            "Length is too short",
            "Iteration count invalid",
            "Separator not allowed",
          ],
        };

        const vm = ValidationViewModel.fromValidationResult(validation);

        expect(vm.fieldErrors.type).to.equal("Unknown type value");
        expect(vm.fieldErrors.length).to.equal("Length is too short");
        expect(vm.fieldErrors.iteration).to.equal("Iteration count invalid");
        expect(vm.fieldErrors.separator).to.equal("Separator not allowed");
      });

      it("should handle valid result with no errors", () => {
        const validation = {
          isValid: true,
          errors: [],
        };

        const vm = ValidationViewModel.fromValidationResult(validation);

        expect(vm.isValid).to.be.true;
        expect(vm.fieldErrors.type).to.be.null;
        expect(vm.fieldErrors.length).to.be.null;
        expect(vm.fieldErrors.iteration).to.be.null;
        expect(vm.fieldErrors.separator).to.be.null;
      });

      it("should handle errors that do not match any field", () => {
        const validation = {
          isValid: false,
          errors: ["Some generic error"],
        };

        const vm = ValidationViewModel.fromValidationResult(validation);

        // Error doesn't contain type, length, iteration, or separator
        expect(vm.fieldErrors.type).to.be.null;
        expect(vm.fieldErrors.length).to.be.null;
        expect(vm.fieldErrors.iteration).to.be.null;
        expect(vm.fieldErrors.separator).to.be.null;
        expect(vm.errors).to.deep.equal(["Some generic error"]);
      });

      it("should accept optional formState parameter", () => {
        const validation = {
          isValid: true,
          errors: [],
        };
        const formState = { touched: true };

        const vm = ValidationViewModel.fromValidationResult(validation, formState);

        expect(vm.isValid).to.be.true;
      });

      it("should handle case-insensitive error matching", () => {
        const validation = {
          isValid: false,
          errors: ["TYPE is required", "LENGTH must be positive"],
        };

        const vm = ValidationViewModel.fromValidationResult(validation);

        expect(vm.fieldErrors.type).to.equal("TYPE is required");
        expect(vm.fieldErrors.length).to.equal("LENGTH must be positive");
      });
    });

    describe("valid", () => {
      it("should create a valid view model with no errors", () => {
        const vm = ValidationViewModel.valid();

        expect(vm.isValid).to.be.true;
        expect(vm.errors).to.deep.equal([]);
        expect(vm.fieldErrors).to.deep.equal({
          type: null,
          length: null,
          iteration: null,
          separator: null,
        });
        expect(vm.hasTypeError).to.be.false;
        expect(vm.hasLengthError).to.be.false;
        expect(vm.hasIterationError).to.be.false;
        expect(vm.hasSeparatorError).to.be.false;
        expect(vm.hasErrors).to.be.false;
      });
    });

    describe("getFieldError", () => {
      it("should return error for specified field", () => {
        const data = {
          isValid: false,
          errors: ["Type error"],
          fieldErrors: {
            type: "Type error",
            length: null,
            iteration: null,
            separator: null,
          },
        };
        const vm = new ValidationViewModel(data);

        expect(vm.getFieldError("type")).to.equal("Type error");
      });

      it("should return null for field without error", () => {
        const data = {
          isValid: false,
          errors: ["Type error"],
          fieldErrors: {
            type: "Type error",
            length: null,
            iteration: null,
            separator: null,
          },
        };
        const vm = new ValidationViewModel(data);

        expect(vm.getFieldError("length")).to.be.null;
      });

      it("should return null for non-existent field", () => {
        const data = {
          isValid: true,
          errors: [],
          fieldErrors: {
            type: null,
            length: null,
            iteration: null,
            separator: null,
          },
        };
        const vm = new ValidationViewModel(data);

        expect(vm.getFieldError("nonexistent")).to.be.null;
      });
    });

    describe("hasFieldError", () => {
      it("should return true if field has error", () => {
        const data = {
          isValid: false,
          errors: ["Type error"],
          fieldErrors: {
            type: "Type error",
            length: null,
            iteration: null,
            separator: null,
          },
        };
        const vm = new ValidationViewModel(data);

        expect(vm.hasFieldError("type")).to.be.true;
      });

      it("should return false if field has no error", () => {
        const data = {
          isValid: false,
          errors: ["Type error"],
          fieldErrors: {
            type: "Type error",
            length: null,
            iteration: null,
            separator: null,
          },
        };
        const vm = new ValidationViewModel(data);

        expect(vm.hasFieldError("length")).to.be.false;
      });

      it("should return false for non-existent field", () => {
        const data = {
          isValid: true,
          errors: [],
          fieldErrors: {
            type: null,
            length: null,
            iteration: null,
            separator: null,
          },
        };
        const vm = new ValidationViewModel(data);

        expect(vm.hasFieldError("nonexistent")).to.be.false;
      });
    });

    describe("getErrorFields", () => {
      it("should return array of fields with errors", () => {
        const data = {
          isValid: false,
          errors: ["Type error", "Length error"],
          fieldErrors: {
            type: "Type error",
            length: "Length error",
            iteration: null,
            separator: null,
          },
        };
        const vm = new ValidationViewModel(data);

        const errorFields = vm.getErrorFields();
        expect(errorFields).to.have.members(["type", "length"]);
        expect(errorFields).to.have.lengthOf(2);
      });

      it("should return empty array when no fields have errors", () => {
        const data = {
          isValid: true,
          errors: [],
          fieldErrors: {
            type: null,
            length: null,
            iteration: null,
            separator: null,
          },
        };
        const vm = new ValidationViewModel(data);

        expect(vm.getErrorFields()).to.deep.equal([]);
      });

      it("should return all fields with errors", () => {
        const data = {
          isValid: false,
          errors: ["Multiple errors"],
          fieldErrors: {
            type: "Type error",
            length: "Length error",
            iteration: "Iteration error",
            separator: "Separator error",
          },
        };
        const vm = new ValidationViewModel(data);

        const errorFields = vm.getErrorFields();
        expect(errorFields).to.have.members([
          "type",
          "length",
          "iteration",
          "separator",
        ]);
        expect(errorFields).to.have.lengthOf(4);
      });
    });

    describe("getFirstError", () => {
      it("should return first error message", () => {
        const data = {
          isValid: false,
          errors: ["First error", "Second error"],
          fieldErrors: {
            type: null,
            length: null,
            iteration: null,
            separator: null,
          },
        };
        const vm = new ValidationViewModel(data);

        expect(vm.getFirstError()).to.equal("First error");
      });

      it("should return null when no errors", () => {
        const data = {
          isValid: true,
          errors: [],
          fieldErrors: {
            type: null,
            length: null,
            iteration: null,
            separator: null,
          },
        };
        const vm = new ValidationViewModel(data);

        expect(vm.getFirstError()).to.be.null;
      });
    });

    describe("toJSON", () => {
      it("should return plain object representation", () => {
        const data = {
          isValid: false,
          errors: ["Type error"],
          fieldErrors: {
            type: "Type error",
            length: null,
            iteration: null,
            separator: null,
          },
        };
        const vm = new ValidationViewModel(data);
        const json = vm.toJSON();

        expect(json).to.deep.equal({
          isValid: false,
          errors: ["Type error"],
          fieldErrors: {
            type: "Type error",
            length: null,
            iteration: null,
            separator: null,
          },
        });
      });

      it("should return valid state representation", () => {
        const vm = ValidationViewModel.valid();
        const json = vm.toJSON();

        expect(json).to.deep.equal({
          isValid: true,
          errors: [],
          fieldErrors: {
            type: null,
            length: null,
            iteration: null,
            separator: null,
          },
        });
      });
    });
  });

  describe("index.js exports", () => {
    it("should export EntropyViewModel", () => {
      expect(EntropyViewModel).to.be.a("function");
      expect(new EntropyViewModel({})).to.be.instanceOf(EntropyViewModel);
    });

    it("should export PasswordViewModel", () => {
      expect(PasswordViewModel).to.be.a("function");
      expect(
        new PasswordViewModel({ password: "test", config: {} })
      ).to.be.instanceOf(PasswordViewModel);
    });

    it("should export ValidationViewModel", () => {
      expect(ValidationViewModel).to.be.a("function");
      expect(ValidationViewModel.valid()).to.be.instanceOf(ValidationViewModel);
    });
  });
});
