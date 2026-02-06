// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { PasswordGeneratorOrchestrator } from "../../src/core/PasswordGeneratorOrchestrator.js";

// Setup chai-as-promised for async testing
use(chaiAsPromised);

describe("PasswordGeneratorOrchestrator", function () {
  describe("orchestrateGeneration", function () {
    it("should orchestrate password generation with quick preset", async function () {
      // Arrange
      const options = {
        preset: "quick",
        audit: false
      };

      // Act
      const result = await PasswordGeneratorOrchestrator.orchestrateGeneration(options);

      // Assert
      expect(result).to.have.property("password");
      expect(result).to.have.property("config");
      expect(result.password).to.be.a("string");
      expect(result.password.length).to.be.greaterThan(0);
      expect(result.config).to.deep.include({
        type: "strong",
        length: 14,
        iteration: 4,
        separator: "-"
      });
      expect(result).to.not.have.property("auditReport");
    });

    it("should orchestrate password generation with secure preset", async function () {
      // Arrange
      const options = {
        preset: "secure",
        audit: false
      };

      // Act
      const result = await PasswordGeneratorOrchestrator.orchestrateGeneration(options);

      // Assert
      expect(result).to.have.property("password");
      expect(result).to.have.property("config");
      expect(result.password).to.be.a("string");
      expect(result.password.length).to.be.greaterThan(0);
      expect(result.config).to.deep.include({
        type: "strong",
        length: 16,
        iteration: 4,
        separator: ""
      });
    });

    it("should orchestrate password generation with memorable preset", async function () {
      // Arrange
      const options = {
        preset: "memorable",
        audit: false
      };

      // Act
      const result = await PasswordGeneratorOrchestrator.orchestrateGeneration(options);

      // Assert
      expect(result).to.have.property("password");
      expect(result).to.have.property("config");
      expect(result.password).to.be.a("string");
      expect(result.password.length).to.be.greaterThan(0);
      expect(result.config).to.deep.include({
        type: "memorable",
        iteration: 4,
        separator: "-"
      });
    });

    it("should enable audit mode when audit option is true", async function () {
      // Arrange
      const options = {
        preset: "quick",
        audit: true
      };

      // Act
      const result = await PasswordGeneratorOrchestrator.orchestrateGeneration(options);

      // Assert
      expect(result).to.have.property("password");
      expect(result).to.have.property("config");
      expect(result).to.have.property("auditReport");
      expect(result.auditReport).to.be.an("object");
    });

    it("should handle options without preset", async function () {
      // Arrange
      const options = {
        type: "memorable",
        iteration: 4,
        separator: " ",
        audit: false
      };

      // Act
      const result = await PasswordGeneratorOrchestrator.orchestrateGeneration(options);

      // Assert
      expect(result).to.have.property("password");
      expect(result).to.have.property("config");
      expect(result.password).to.be.a("string");
      expect(result.config).to.deep.include({
        type: "memorable",
        iteration: 4,
        separator: " "
      });
    });

    it("should handle preset overrides", async function () {
      // Arrange
      const options = {
        preset: "quick",
        type: "base64",
        length: 12,
        audit: false
      };

      // Act
      const result = await PasswordGeneratorOrchestrator.orchestrateGeneration(options);

      // Assert
      expect(result).to.have.property("password");
      expect(result).to.have.property("config");
      expect(result.config.type).to.equal("base64");
      expect(result.config.length).to.equal(12);
      // Other values should come from preset
      expect(result.config.iteration).to.equal(4);
      expect(result.config.separator).to.equal("-");
    });

    it("should propagate configuration resolution errors", async function () {
      // Arrange
      const options = {
        preset: "invalid",
        audit: false
      };

      // Act & Assert
      await expect(PasswordGeneratorOrchestrator.orchestrateGeneration(options))
        .to.eventually.be.rejectedWith("Invalid preset 'invalid'");
    });

    it("should propagate validation errors for missing required options", async function () {
      // Arrange
      const options = {
        type: "strong", // Missing length, iteration, separator
        audit: false
      };

      // Act & Assert
      await expect(PasswordGeneratorOrchestrator.orchestrateGeneration(options))
        .to.eventually.be.rejectedWith("Missing required options");
    });

    it("should propagate validation errors for invalid type", async function () {
      // Arrange
      const options = {
        type: "invalid",
        length: 8,
        iteration: 2,
        separator: "-",
        audit: false
      };

      // Act & Assert
      await expect(PasswordGeneratorOrchestrator.orchestrateGeneration(options))
        .to.eventually.be.rejectedWith("Invalid password type 'invalid'");
    });

    it("should handle minimal options with audit", async function () {
      // Arrange
      const options = {
        preset: "quick",
        audit: true
      };

      // Act
      const result = await PasswordGeneratorOrchestrator.orchestrateGeneration(options);

      // Assert
      expect(result).to.have.property("password");
      expect(result).to.have.property("config");
      expect(result).to.have.property("auditReport");
      expect(result.auditReport).to.be.an("object");
    });

    it("should handle complete configuration without preset", async function () {
      // Arrange
      const options = {
        type: "strong",
        length: 10,
        iteration: 2,
        separator: ".",
        audit: false
      };

      // Act
      const result = await PasswordGeneratorOrchestrator.orchestrateGeneration(options);

      // Assert
      expect(result).to.have.property("password");
      expect(result).to.have.property("config");
      expect(result.password).to.be.a("string");
      expect(result.config).to.deep.include({
        type: "strong",
        length: 10,
        iteration: 2,
        separator: "."
      });

      // Verify password structure
      const parts = result.password.split(".");
      expect(parts).to.have.lengthOf(2);
      parts.forEach(part => expect(part).to.have.lengthOf(10));
    });
  });
});