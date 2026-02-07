// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { CommandLearningPresenter } from "../../src/presenters/CommandLearningPresenter.js";

describe("CommandLearningPresenter", function () {
  let originalLog;
  let logOutput;

  beforeEach(function () {
    originalLog = console.log;
    logOutput = [];
    console.log = (...args) => logOutput.push(args.join(" "));
  });

  afterEach(function () {
    console.log = originalLog;
  });

  describe("generateEquivalentCommand", function () {
    it("should generate command with preset", function () {
      const command = CommandLearningPresenter.generateEquivalentCommand(
        { type: "strong", iteration: 3 },
        "quick",
        false
      );
      expect(command).to.equal("password-generator -p quick");
    });

    it("should generate command with preset and clipboard", function () {
      const command = CommandLearningPresenter.generateEquivalentCommand(
        { type: "strong", iteration: 3 },
        "secure",
        true
      );
      expect(command).to.equal("password-generator -p secure -c");
    });

    it("should generate custom command without preset", function () {
      const command = CommandLearningPresenter.generateEquivalentCommand(
        { type: "strong", length: 16, iteration: 4, separator: "-" },
        null,
        false
      );
      expect(command).to.equal("password-generator --type strong --length 16 --iteration 4");
    });

    it("should include custom separator in command", function () {
      const command = CommandLearningPresenter.generateEquivalentCommand(
        { type: "memorable", iteration: 4, separator: "_" },
        null,
        false
      );
      expect(command).to.include('--separator "_"');
    });

    it("should not include separator if it is hyphen", function () {
      const command = CommandLearningPresenter.generateEquivalentCommand(
        { type: "memorable", iteration: 4, separator: "-" },
        null,
        false
      );
      expect(command).to.not.include("--separator");
    });

    it("should include clipboard flag when enabled", function () {
      const command = CommandLearningPresenter.generateEquivalentCommand(
        { type: "strong", length: 12, iteration: 3, separator: "-" },
        null,
        true
      );
      expect(command).to.include("-c");
    });
  });

  describe("generateCommandBreakdown", function () {
    it("should generate breakdown with preset", function () {
      const breakdown = CommandLearningPresenter.generateCommandBreakdown(
        { type: "strong" },
        "quick",
        false
      );
      expect(breakdown).to.be.an("array");
      expect(breakdown[0].flag).to.include("-p quick");
      expect(breakdown[0].desc).to.include("preset");
    });

    it("should generate breakdown without preset", function () {
      const breakdown = CommandLearningPresenter.generateCommandBreakdown(
        { type: "strong", length: 16, iteration: 4, separator: "-" },
        null,
        false
      );
      expect(breakdown).to.be.an("array");
      expect(breakdown.some(item => item.flag.includes("--type strong"))).to.be.true;
      expect(breakdown.some(item => item.flag.includes("--length 16"))).to.be.true;
      expect(breakdown.some(item => item.flag.includes("--iteration 4"))).to.be.true;
    });

    it("should include separator in breakdown for custom separator", function () {
      const breakdown = CommandLearningPresenter.generateCommandBreakdown(
        { type: "strong", iteration: 3, separator: "_" },
        null,
        false
      );
      expect(breakdown.some(item => item.flag.includes('--separator "_"'))).to.be.true;
    });

    it("should include clipboard in breakdown", function () {
      const breakdown = CommandLearningPresenter.generateCommandBreakdown(
        { type: "strong" },
        "quick",
        true
      );
      expect(breakdown.some(item => item.flag.includes("-c"))).to.be.true;
      expect(breakdown.some(item => item.desc.includes("clipboard"))).to.be.true;
    });

    it("should show words for memorable type", function () {
      const breakdown = CommandLearningPresenter.generateCommandBreakdown(
        { type: "memorable", length: 8, iteration: 4 },
        null,
        false
      );
      expect(breakdown.some(item => item.desc.includes("words"))).to.be.true;
    });

    it("should show chunks for strong type", function () {
      const breakdown = CommandLearningPresenter.generateCommandBreakdown(
        { type: "strong", length: 12, iteration: 3 },
        null,
        false
      );
      expect(breakdown.some(item => item.desc.includes("chunks"))).to.be.true;
    });
  });

  describe("displayCommandLearningPanel", function () {
    it("should display the learning panel", function () {
      CommandLearningPresenter.displayCommandLearningPanel(
        { type: "strong", length: 12, iteration: 3, separator: "-" },
        true,
        "quick"
      );
      expect(logOutput.some(line => line.includes("command"))).to.be.true;
      expect(logOutput.some(line => line.includes("password-generator"))).to.be.true;
      expect(logOutput.some(line => line.includes("breakdown"))).to.be.true;
    });

    it("should display panel without preset", function () {
      CommandLearningPresenter.displayCommandLearningPanel(
        { type: "memorable", iteration: 4, separator: "_" },
        false,
        null
      );
      expect(logOutput.some(line => line.includes("--type memorable"))).to.be.true;
    });
  });

  describe("displayNextSteps", function () {
    it("should display next steps without preset", function () {
      CommandLearningPresenter.displayNextSteps(null);
      expect(logOutput.some(line => line.includes("next"))).to.be.true;
      expect(logOutput.some(line => line.includes("--help"))).to.be.true;
      expect(logOutput.some(line => line.includes("--audit"))).to.be.true;
    });

    it("should display next steps with preset", function () {
      CommandLearningPresenter.displayNextSteps("secure");
      expect(logOutput.some(line => line.includes("-p secure"))).to.be.true;
    });
  });

  describe("displayFullCommandLearning", function () {
    it("should display both panel and next steps", function () {
      CommandLearningPresenter.displayFullCommandLearning(
        { type: "strong", length: 12, iteration: 3, separator: "-" },
        true,
        "quick"
      );
      expect(logOutput.some(line => line.includes("command"))).to.be.true;
      expect(logOutput.some(line => line.includes("next"))).to.be.true;
    });

    it("should display full learning without preset", function () {
      CommandLearningPresenter.displayFullCommandLearning(
        { type: "memorable", iteration: 4, separator: "_" },
        false,
        null
      );
      expect(logOutput.some(line => line.includes("--type memorable"))).to.be.true;
      expect(logOutput.some(line => line.includes("next"))).to.be.true;
    });
  });

  describe("getCommandData", function () {
    it("should return command data object", function () {
      const data = CommandLearningPresenter.getCommandData(
        { type: "strong", length: 12, iteration: 3, separator: "-" },
        true,
        "quick"
      );
      expect(data).to.have.property("command");
      expect(data).to.have.property("breakdown");
      expect(data).to.have.property("preset", "quick");
      expect(data).to.have.property("config");
      expect(data).to.have.property("clipboard", true);
    });

    it("should return correct command in data", function () {
      const data = CommandLearningPresenter.getCommandData(
        { type: "memorable", iteration: 4, separator: "_" },
        false,
        null
      );
      expect(data.command).to.include("--type memorable");
      expect(data.breakdown).to.be.an("array");
      expect(data.preset).to.be.null;
      expect(data.clipboard).to.be.false;
    });
  });
});
