// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import {
  VALID_PASSWORD_TYPES,
  VALID_PRESETS,
  PRESET_PROFILES,
  CLI_DEFAULTS,
  CLI_OPTIONS,
  isValidPasswordType,
  getValidTypesString,
  isValidPreset,
  getPresetConfig,
  getValidPresetsString,
} from "../src/config.js";

describe("Config Module", function () {
  describe("VALID_PASSWORD_TYPES", function () {
    it("should contain expected password types", function () {
      expect(VALID_PASSWORD_TYPES).to.include("strong");
      expect(VALID_PASSWORD_TYPES).to.include("base64");
      expect(VALID_PASSWORD_TYPES).to.include("memorable");
      expect(VALID_PASSWORD_TYPES).to.have.length(3);
    });
  });

  describe("VALID_PRESETS", function () {
    it("should contain expected presets", function () {
      expect(VALID_PRESETS).to.include("quick");
      expect(VALID_PRESETS).to.include("secure");
      expect(VALID_PRESETS).to.include("memorable");
      expect(VALID_PRESETS).to.have.length(3);
    });
  });

  describe("PRESET_PROFILES", function () {
    it("should have quick preset with correct values", function () {
      expect(PRESET_PROFILES.quick).to.deep.equal({
        type: "strong",
        length: 14,
        iteration: 4,
        separator: "-",
      });
    });

    it("should have secure preset with correct values", function () {
      expect(PRESET_PROFILES.secure).to.deep.equal({
        type: "strong",
        length: 16,
        iteration: 4,
        separator: "",
      });
    });

    it("should have memorable preset with correct values", function () {
      expect(PRESET_PROFILES.memorable).to.deep.equal({
        type: "memorable",
        iteration: 4,
        separator: "-",
      });
    });
  });

  describe("CLI_DEFAULTS", function () {
    it("should have expected default values", function () {
      expect(CLI_DEFAULTS.length).to.equal(16);
      expect(CLI_DEFAULTS.iteration).to.equal(3);
      expect(CLI_DEFAULTS.separator).to.equal("-");
      expect(CLI_DEFAULTS.clipboard).to.equal(false);
    });
  });

  describe("CLI_OPTIONS", function () {
    it("should have program name and description", function () {
      expect(CLI_OPTIONS.name).to.equal("password-generator");
      expect(CLI_OPTIONS.description).to.be.a("string");
    });

    it("should have all required option configurations", function () {
      expect(CLI_OPTIONS.options).to.have.property("preset");
      expect(CLI_OPTIONS.options).to.have.property("type");
      expect(CLI_OPTIONS.options).to.have.property("length");
      expect(CLI_OPTIONS.options).to.have.property("iteration");
      expect(CLI_OPTIONS.options).to.have.property("separator");
      expect(CLI_OPTIONS.options).to.have.property("clipboard");
      expect(CLI_OPTIONS.options).to.have.property("audit");
    });

    it("should have flags for each option", function () {
      expect(CLI_OPTIONS.options.type.flags).to.include("-t");
      expect(CLI_OPTIONS.options.length.flags).to.include("-l");
      expect(CLI_OPTIONS.options.iteration.flags).to.include("-i");
      expect(CLI_OPTIONS.options.separator.flags).to.include("-s");
      expect(CLI_OPTIONS.options.clipboard.flags).to.include("-c");
      expect(CLI_OPTIONS.options.audit.flags).to.include("-a");
      expect(CLI_OPTIONS.options.preset.flags).to.include("-p");
    });
  });

  describe("isValidPasswordType", function () {
    it("should return true for valid password types", function () {
      expect(isValidPasswordType("strong")).to.be.true;
      expect(isValidPasswordType("base64")).to.be.true;
      expect(isValidPasswordType("memorable")).to.be.true;
    });

    it("should return false for invalid password types", function () {
      expect(isValidPasswordType("invalid")).to.be.false;
      expect(isValidPasswordType("")).to.be.false;
      expect(isValidPasswordType("STRONG")).to.be.false; // case-sensitive
      expect(isValidPasswordType(null)).to.be.false;
      expect(isValidPasswordType(undefined)).to.be.false;
    });
  });

  describe("getValidTypesString", function () {
    it("should return comma-separated string of valid types", function () {
      const result = getValidTypesString();
      expect(result).to.include("strong");
      expect(result).to.include("base64");
      expect(result).to.include("memorable");
      expect(result).to.include(", ");
    });
  });

  describe("isValidPreset", function () {
    it("should return true for valid presets", function () {
      expect(isValidPreset("quick")).to.be.true;
      expect(isValidPreset("secure")).to.be.true;
      expect(isValidPreset("memorable")).to.be.true;
    });

    it("should return false for invalid presets", function () {
      expect(isValidPreset("invalid")).to.be.false;
      expect(isValidPreset("")).to.be.false;
      expect(isValidPreset("QUICK")).to.be.false; // case-sensitive
      expect(isValidPreset(null)).to.be.false;
      expect(isValidPreset(undefined)).to.be.false;
    });
  });

  describe("getPresetConfig", function () {
    it("should return config for valid presets", function () {
      const quickConfig = getPresetConfig("quick");
      expect(quickConfig).to.deep.equal(PRESET_PROFILES.quick);

      const secureConfig = getPresetConfig("secure");
      expect(secureConfig).to.deep.equal(PRESET_PROFILES.secure);

      const memorableConfig = getPresetConfig("memorable");
      expect(memorableConfig).to.deep.equal(PRESET_PROFILES.memorable);
    });

    it("should return null for invalid presets", function () {
      expect(getPresetConfig("invalid")).to.be.null;
      expect(getPresetConfig("")).to.be.null;
      expect(getPresetConfig(null)).to.be.null;
      expect(getPresetConfig(undefined)).to.be.null;
    });
  });

  describe("getValidPresetsString", function () {
    it("should return comma-separated string of valid presets", function () {
      const result = getValidPresetsString();
      expect(result).to.include("quick");
      expect(result).to.include("secure");
      expect(result).to.include("memorable");
      expect(result).to.include(", ");
    });
  });
});
