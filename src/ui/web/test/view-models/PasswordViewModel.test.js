// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { PasswordViewModel } from "../../view-models/PasswordViewModel.js";

describe("PasswordViewModel", () => {
  describe("constructor", () => {
    it("should create PasswordViewModel with provided data", () => {
      const data = {
        password: "Abc123!@#XyZ",
        entropyInfo: {
          totalBits: 96,
          securityLevel: "GOOD",
          recommendation: "Good for most uses",
        },
        config: {
          type: "strong",
          length: 12,
          iteration: 1,
          separator: "-",
        },
      };

      const vm = new PasswordViewModel(data);

      expect(vm.password).to.equal("Abc123!@#XyZ");
      expect(vm.length).to.equal(12);
      expect(vm.entropyBits).to.equal(96);
      expect(vm.securityLevel).to.equal("GOOD");
      expect(vm.securityRecommendation).to.equal("Good for most uses");
      expect(vm.type).to.equal("strong");
    });

    it("should mask password correctly for long passwords", () => {
      const data = {
        password: "Abc123!@#XyZ",
        entropyInfo: { totalBits: 96 },
        config: {},
      };

      const vm = new PasswordViewModel(data);

      expect(vm.maskedPassword).to.equal("Ab********yZ");
    });

    it("should mask password correctly for short passwords", () => {
      const data = {
        password: "Ab12",
        entropyInfo: { totalBits: 24 },
        config: {},
      };

      const vm = new PasswordViewModel(data);

      expect(vm.maskedPassword).to.equal("****");
    });

    it("should handle empty password", () => {
      const data = {
        password: "",
        entropyInfo: { totalBits: 0 },
        config: {},
      };

      const vm = new PasswordViewModel(data);

      expect(vm.maskedPassword).to.equal("");
      expect(vm.length).to.equal(0);
    });

    it("should handle missing entropyInfo", () => {
      const data = {
        password: "Test1234",
        entropyInfo: null,
        config: {},
      };

      const vm = new PasswordViewModel(data);

      expect(vm.entropyBits).to.equal(0);
      expect(vm.securityLevel).to.equal("unknown");
      expect(vm.securityRecommendation).to.equal("");
    });

    it("should handle missing config", () => {
      const data = {
        password: "Test1234",
        entropyInfo: { totalBits: 48 },
        config: null,
      };

      const vm = new PasswordViewModel(data);

      expect(vm.type).to.equal("");
      expect(vm.configSummary).to.equal("");
    });

    it("should set generatedAt timestamp", () => {
      const before = new Date().toISOString();
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 20 },
        config: {},
      });
      const after = new Date().toISOString();

      expect(vm.generatedAt).to.be.a("string");
      expect(vm.generatedAt >= before).to.be.true;
      expect(vm.generatedAt <= after).to.be.true;
    });
  });

  describe("strength indicator mapping", () => {
    it("should return maximum strength for 128+ bits", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 128 },
        config: {},
      });

      expect(vm.strengthIndicator.level).to.equal("maximum");
      expect(vm.strengthIndicator.label).to.equal("Maximum");
      expect(vm.strengthIndicator.dots).to.equal(4);
      expect(vm.strengthIndicator.color).to.equal("success");
    });

    it("should return strong strength for 80-127 bits", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 80 },
        config: {},
      });

      expect(vm.strengthIndicator.level).to.equal("strong");
      expect(vm.strengthIndicator.label).to.equal("Strong");
      expect(vm.strengthIndicator.dots).to.equal(3);
      expect(vm.strengthIndicator.color).to.equal("success");
    });

    it("should return medium strength for 64-79 bits", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 64 },
        config: {},
      });

      expect(vm.strengthIndicator.level).to.equal("medium");
      expect(vm.strengthIndicator.label).to.equal("Medium");
      expect(vm.strengthIndicator.dots).to.equal(2);
      expect(vm.strengthIndicator.color).to.equal("warning");
    });

    it("should return weak strength for below 64 bits", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 40 },
        config: {},
      });

      expect(vm.strengthIndicator.level).to.equal("weak");
      expect(vm.strengthIndicator.label).to.equal("Weak");
      expect(vm.strengthIndicator.dots).to.equal(1);
      expect(vm.strengthIndicator.color).to.equal("error");
    });

    it("should return weak for zero bits", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 0 },
        config: {},
      });

      expect(vm.strengthIndicator.level).to.equal("weak");
      expect(vm.strengthIndicator.dots).to.equal(1);
    });
  });

  describe("config summary formatting", () => {
    it("should format complete config", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 48 },
        config: {
          type: "strong",
          length: 16,
          iteration: 4,
          separator: "-",
        },
      });

      expect(vm.configSummary).to.equal('Type: strong | Length: 16 | Iterations: 4 | Separator: "-"');
    });

    it("should handle partial config", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 48 },
        config: {
          type: "memorable",
          iteration: 4,
        },
      });

      expect(vm.configSummary).to.equal("Type: memorable | Iterations: 4");
    });

    it("should handle empty config", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 48 },
        config: {},
      });

      expect(vm.configSummary).to.equal("");
    });
  });

  describe("fromGenerationResult", () => {
    it("should create PasswordViewModel from generation result", () => {
      const result = {
        password: "Generated123!",
        entropyInfo: {
          totalBits: 78,
          securityLevel: "GOOD",
          recommendation: "Suitable for most purposes",
        },
        config: {
          type: "strong",
          length: 13,
        },
      };

      const vm = PasswordViewModel.fromGenerationResult(result);

      expect(vm).to.be.instanceOf(PasswordViewModel);
      expect(vm.password).to.equal("Generated123!");
      expect(vm.entropyBits).to.equal(78);
    });
  });

  describe("getDisplayPassword", () => {
    let vm;

    beforeEach(() => {
      vm = new PasswordViewModel({
        password: "SecretPass123",
        entropyInfo: { totalBits: 80 },
        config: {},
      });
    });

    it("should return password when showPassword is true", () => {
      expect(vm.getDisplayPassword(true)).to.equal("SecretPass123");
    });

    it("should return masked password when showPassword is false", () => {
      expect(vm.getDisplayPassword(false)).to.equal("Se*********23");
    });

    it("should default to showing password", () => {
      expect(vm.getDisplayPassword()).to.equal("SecretPass123");
    });
  });

  describe("getStrengthDots", () => {
    it("should return 4 filled dots for maximum strength", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 256 },
        config: {},
      });

      expect(vm.getStrengthDots()).to.equal("●●●●");
    });

    it("should return 3 filled dots for strong strength", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 100 },
        config: {},
      });

      expect(vm.getStrengthDots()).to.equal("●●●○");
    });

    it("should return 2 filled dots for medium strength", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 70 },
        config: {},
      });

      expect(vm.getStrengthDots()).to.equal("●●○○");
    });

    it("should return 1 filled dot for weak strength", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 30 },
        config: {},
      });

      expect(vm.getStrengthDots()).to.equal("●○○○");
    });
  });

  describe("toJSON", () => {
    it("should convert to plain object", () => {
      const vm = new PasswordViewModel({
        password: "Test1234",
        entropyInfo: {
          totalBits: 48,
          securityLevel: "MODERATE",
        },
        config: {
          type: "strong",
          length: 8,
        },
      });

      const json = vm.toJSON();

      expect(json).to.be.an("object");
      expect(json.password).to.equal("Test1234");
      expect(json.maskedPassword).to.equal("Te****34");
      expect(json.length).to.equal(8);
      expect(json.entropyBits).to.equal(48);
      expect(json.securityLevel).to.equal("MODERATE");
      expect(json.strengthIndicator).to.deep.equal({
        level: "weak",
        label: "Weak",
        dots: 1,
        color: "error",
      });
      expect(json.type).to.equal("strong");
      expect(json.generatedAt).to.be.a("string");
    });

    it("should be serializable to JSON string", () => {
      const vm = new PasswordViewModel({
        password: "Test",
        entropyInfo: { totalBits: 20 },
        config: {},
      });

      const jsonString = JSON.stringify(vm.toJSON());
      const parsed = JSON.parse(jsonString);

      expect(parsed.password).to.equal("Test");
      expect(parsed.entropyBits).to.equal(20);
    });
  });

  describe("password masking edge cases", () => {
    it("should handle 5 character password", () => {
      const vm = new PasswordViewModel({
        password: "Ab1!X",
        entropyInfo: { totalBits: 30 },
        config: {},
      });

      expect(vm.maskedPassword).to.equal("Ab*!X");
    });

    it("should handle exactly 4 character password", () => {
      const vm = new PasswordViewModel({
        password: "Ab1!",
        entropyInfo: { totalBits: 24 },
        config: {},
      });

      expect(vm.maskedPassword).to.equal("****");
    });

    it("should handle 3 character password", () => {
      const vm = new PasswordViewModel({
        password: "Ab1",
        entropyInfo: { totalBits: 18 },
        config: {},
      });

      expect(vm.maskedPassword).to.equal("***");
    });

    it("should handle 1 character password", () => {
      const vm = new PasswordViewModel({
        password: "A",
        entropyInfo: { totalBits: 6 },
        config: {},
      });

      expect(vm.maskedPassword).to.equal("*");
    });

    it("should handle null password", () => {
      const vm = new PasswordViewModel({
        password: null,
        entropyInfo: { totalBits: 0 },
        config: {},
      });

      expect(vm.maskedPassword).to.equal("");
    });
  });
});
