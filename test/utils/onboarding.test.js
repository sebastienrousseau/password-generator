// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { isFirstRun } from "../../src/utils/onboarding.js";

describe("Onboarding Utils Module", function () {
  describe("isFirstRun", function () {
    it("should return true when no arguments are provided", function () {
      expect(isFirstRun([])).to.be.true;
    });

    it("should return true when only --interactive flag is provided", function () {
      expect(isFirstRun(["--interactive"])).to.be.true;
    });

    it("should return false when -i flag is provided (iteration)", function () {
      expect(isFirstRun(["-i"])).to.be.false;
    });

    it("should return true when only password-generator is provided", function () {
      expect(isFirstRun(["password-generator"])).to.be.true;
    });

    it("should return true when interactive flags combined", function () {
      expect(isFirstRun(["--interactive"])).to.be.true;
      expect(isFirstRun(["password-generator", "--interactive"])).to.be.true;
    });

    it("should return false when other arguments are provided", function () {
      expect(isFirstRun(["--type", "strong"])).to.be.false;
      expect(isFirstRun(["-t", "base64"])).to.be.false;
      expect(isFirstRun(["--length", "16"])).to.be.false;
    });

    it("should return false when interactive flag combined with other args", function () {
      expect(isFirstRun(["--interactive", "--type", "strong"])).to.be.false;
      expect(isFirstRun(["-i", "-l", "20"])).to.be.false;
    });

    it("should return false for preset arguments", function () {
      expect(isFirstRun(["-p", "quick"])).to.be.false;
      expect(isFirstRun(["--preset", "secure"])).to.be.false;
    });

    it("should return false for clipboard flag", function () {
      expect(isFirstRun(["-c"])).to.be.false;
      expect(isFirstRun(["--clipboard"])).to.be.false;
    });

    it("should return false for audit flag", function () {
      expect(isFirstRun(["-a"])).to.be.false;
      expect(isFirstRun(["--audit"])).to.be.false;
    });
  });
});
