// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";

// We need to test capabilities with different env configurations,
// so we'll import fresh modules for each test scenario

describe("UI Modules", function () {
  // Store original env and stdout properties
  let originalEnv;
  let originalIsTTY;
  let originalPlatform;
  let originalColumns;
  let originalRows;

  beforeEach(function () {
    // Save original values
    originalEnv = { ...process.env };
    originalIsTTY = process.stdout.isTTY;
    originalPlatform = process.platform;
    originalColumns = process.stdout.columns;
    originalRows = process.stdout.rows;
  });

  afterEach(function () {
    // Restore original values
    process.env = originalEnv;
    Object.defineProperty(process.stdout, "isTTY", {
      value: originalIsTTY,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(process.stdout, "columns", {
      value: originalColumns,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(process.stdout, "rows", {
      value: originalRows,
      writable: true,
      configurable: true,
    });
  });

  // ============================================================================
  // CAPABILITIES TESTS
  // ============================================================================
  describe("capabilities.js", function () {
    describe("ColorDepth enum", function () {
      it("should have correct color depth values", async function () {
        const { ColorDepth } = await import("../../src/ui/capabilities.js");
        expect(ColorDepth.NONE).to.equal(0);
        expect(ColorDepth.BASIC).to.equal(16);
        expect(ColorDepth.ANSI256).to.equal(256);
        expect(ColorDepth.TRUECOLOR).to.equal(16777216);
      });
    });

    describe("ThemeMode enum", function () {
      it("should have correct theme mode values", async function () {
        const { ThemeMode } = await import("../../src/ui/capabilities.js");
        expect(ThemeMode.DARK).to.equal("dark");
        expect(ThemeMode.LIGHT).to.equal("light");
        expect(ThemeMode.AUTO).to.equal("auto");
      });
    });

    describe("isColorDisabled", function () {
      it("should return false when FORCE_COLOR is set to truthy value", async function () {
        delete process.env.NO_COLOR;
        delete process.env.CI;
        process.env.FORCE_COLOR = "1";

        // Re-import to get fresh function
        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-1`
        );
        expect(module.isColorDisabled()).to.be.false;
      });

      it("should return true when FORCE_COLOR is 0", async function () {
        delete process.env.NO_COLOR;
        delete process.env.CI;
        process.env.FORCE_COLOR = "0";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-2`
        );
        expect(module.isColorDisabled()).to.be.true;
      });

      it("should return true when FORCE_COLOR is false", async function () {
        delete process.env.NO_COLOR;
        delete process.env.CI;
        process.env.FORCE_COLOR = "false";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-3`
        );
        expect(module.isColorDisabled()).to.be.true;
      });

      it("should return true when NO_COLOR is set", async function () {
        delete process.env.FORCE_COLOR;
        delete process.env.CI;
        process.env.NO_COLOR = "1";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-4`
        );
        expect(module.isColorDisabled()).to.be.true;
      });

      it("should return true when CI is true and FORCE_COLOR is not set", async function () {
        delete process.env.FORCE_COLOR;
        delete process.env.NO_COLOR;
        process.env.CI = "true";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-5`
        );
        expect(module.isColorDisabled()).to.be.true;
      });

      it("should return false when no color-disabling env vars are set", async function () {
        delete process.env.FORCE_COLOR;
        delete process.env.NO_COLOR;
        delete process.env.CI;

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-6`
        );
        expect(module.isColorDisabled()).to.be.false;
      });
    });

    describe("detectColorDepth", function () {
      it("should return NONE when colors are disabled", async function () {
        process.env.NO_COLOR = "1";
        delete process.env.FORCE_COLOR;

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-7`
        );
        expect(module.detectColorDepth()).to.equal(module.ColorDepth.NONE);
      });

      it("should return TRUECOLOR when COLORTERM is truecolor", async function () {
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        delete process.env.CI;
        process.env.COLORTERM = "truecolor";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-8`
        );
        expect(module.detectColorDepth()).to.equal(module.ColorDepth.TRUECOLOR);
      });

      it("should return TRUECOLOR when COLORTERM is 24bit", async function () {
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        delete process.env.CI;
        process.env.COLORTERM = "24bit";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-9`
        );
        expect(module.detectColorDepth()).to.equal(module.ColorDepth.TRUECOLOR);
      });

      it("should return TRUECOLOR when TERM contains truecolor", async function () {
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        delete process.env.CI;
        delete process.env.COLORTERM;
        process.env.TERM = "xterm-truecolor";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-10`
        );
        expect(module.detectColorDepth()).to.equal(module.ColorDepth.TRUECOLOR);
      });

      it("should return TRUECOLOR when TERM contains 24bit", async function () {
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        delete process.env.CI;
        delete process.env.COLORTERM;
        process.env.TERM = "xterm-24bit";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-11`
        );
        expect(module.detectColorDepth()).to.equal(module.ColorDepth.TRUECOLOR);
      });

      it("should return ANSI256 when TERM contains 256color", async function () {
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        delete process.env.CI;
        delete process.env.COLORTERM;
        process.env.TERM = "xterm-256color";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-12`
        );
        expect(module.detectColorDepth()).to.equal(module.ColorDepth.ANSI256);
      });

      it("should return ANSI256 when TERM contains 256", async function () {
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        delete process.env.CI;
        delete process.env.COLORTERM;
        process.env.TERM = "screen-256";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-13`
        );
        expect(module.detectColorDepth()).to.equal(module.ColorDepth.ANSI256);
      });

      it("should return NONE when TERM is dumb", async function () {
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        delete process.env.CI;
        delete process.env.COLORTERM;
        process.env.TERM = "dumb";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-14`
        );
        expect(module.detectColorDepth()).to.equal(module.ColorDepth.NONE);
      });

      it("should return NONE when TERM is empty", async function () {
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        delete process.env.CI;
        delete process.env.COLORTERM;
        delete process.env.TERM;

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-15`
        );
        expect(module.detectColorDepth()).to.equal(module.ColorDepth.NONE);
      });

      it("should return BASIC when stdout is TTY and TERM is set", async function () {
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        delete process.env.CI;
        delete process.env.COLORTERM;
        process.env.TERM = "xterm";
        Object.defineProperty(process.stdout, "isTTY", {
          value: true,
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-16`
        );
        expect(module.detectColorDepth()).to.equal(module.ColorDepth.BASIC);
      });

      it("should return NONE when stdout is not TTY", async function () {
        delete process.env.NO_COLOR;
        delete process.env.FORCE_COLOR;
        delete process.env.CI;
        delete process.env.COLORTERM;
        process.env.TERM = "xterm";
        Object.defineProperty(process.stdout, "isTTY", {
          value: false,
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-17`
        );
        expect(module.detectColorDepth()).to.equal(module.ColorDepth.NONE);
      });
    });

    describe("detectTheme", function () {
      it('should return "light" when TERMINAL_THEME is light', async function () {
        process.env.TERMINAL_THEME = "light";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-18`
        );
        expect(module.detectTheme()).to.equal("light");
      });

      it('should return "dark" when TERMINAL_THEME is dark', async function () {
        process.env.TERMINAL_THEME = "dark";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-19`
        );
        expect(module.detectTheme()).to.equal("dark");
      });

      it("should return LIGHT when APPLE_TERMINAL is light", async function () {
        delete process.env.TERMINAL_THEME;
        process.env.APPLE_TERMINAL = "light";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-20`
        );
        expect(module.detectTheme()).to.equal(module.ThemeMode.LIGHT);
      });

      it("should detect light theme from COLORFGBG with bg=7", async function () {
        delete process.env.TERMINAL_THEME;
        delete process.env.APPLE_TERMINAL;
        process.env.COLORFGBG = "0;7";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-21`
        );
        expect(module.detectTheme()).to.equal(module.ThemeMode.LIGHT);
      });

      it("should detect light theme from COLORFGBG with bg=15", async function () {
        delete process.env.TERMINAL_THEME;
        delete process.env.APPLE_TERMINAL;
        process.env.COLORFGBG = "0;15";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-22`
        );
        expect(module.detectTheme()).to.equal(module.ThemeMode.LIGHT);
      });

      it("should detect light theme from COLORFGBG with bg in range 9-14", async function () {
        delete process.env.TERMINAL_THEME;
        delete process.env.APPLE_TERMINAL;
        process.env.COLORFGBG = "0;12";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-23`
        );
        expect(module.detectTheme()).to.equal(module.ThemeMode.LIGHT);
      });

      it("should detect dark theme from COLORFGBG with dark bg", async function () {
        delete process.env.TERMINAL_THEME;
        delete process.env.APPLE_TERMINAL;
        process.env.COLORFGBG = "7;0";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-24`
        );
        expect(module.detectTheme()).to.equal(module.ThemeMode.DARK);
      });

      it("should handle COLORFGBG with three parts", async function () {
        delete process.env.TERMINAL_THEME;
        delete process.env.APPLE_TERMINAL;
        process.env.COLORFGBG = "0;default;7";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-25`
        );
        expect(module.detectTheme()).to.equal(module.ThemeMode.LIGHT);
      });

      it("should handle invalid COLORFGBG values", async function () {
        delete process.env.TERMINAL_THEME;
        delete process.env.APPLE_TERMINAL;
        process.env.COLORFGBG = "invalid";
        delete process.env.TERM_PROGRAM;

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-26`
        );
        expect(module.detectTheme()).to.equal(module.ThemeMode.DARK);
      });

      it("should detect light theme from TERM_PROGRAM containing light", async function () {
        delete process.env.TERMINAL_THEME;
        delete process.env.APPLE_TERMINAL;
        delete process.env.COLORFGBG;
        process.env.TERM_PROGRAM = "LightTerminal";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-27`
        );
        expect(module.detectTheme()).to.equal(module.ThemeMode.LIGHT);
      });

      it("should default to dark theme", async function () {
        delete process.env.TERMINAL_THEME;
        delete process.env.APPLE_TERMINAL;
        delete process.env.COLORFGBG;
        delete process.env.TERM_PROGRAM;

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-28`
        );
        expect(module.detectTheme()).to.equal(module.ThemeMode.DARK);
      });
    });

    describe("supportsUnicode", function () {
      it("should return false when TERM is dumb", async function () {
        process.env.TERM = "dumb";

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-29`
        );
        expect(module.supportsUnicode()).to.be.false;
      });

      it("should return true on Windows with WT_SESSION", async function () {
        delete process.env.TERM;
        process.env.WT_SESSION = "1";
        Object.defineProperty(process, "platform", {
          value: "win32",
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-30`
        );
        expect(module.supportsUnicode()).to.be.true;
      });

      it("should return true on Windows with ConEmuANSI=ON", async function () {
        delete process.env.TERM;
        delete process.env.WT_SESSION;
        process.env.ConEmuANSI = "ON";
        Object.defineProperty(process, "platform", {
          value: "win32",
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-31`
        );
        expect(module.supportsUnicode()).to.be.true;
      });

      it("should return true on Windows with TERM_PROGRAM set", async function () {
        delete process.env.TERM;
        delete process.env.WT_SESSION;
        delete process.env.ConEmuANSI;
        process.env.TERM_PROGRAM = "vscode";
        Object.defineProperty(process, "platform", {
          value: "win32",
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-32`
        );
        expect(module.supportsUnicode()).to.be.true;
      });

      it("should return true on Windows with CHCP=65001", async function () {
        delete process.env.TERM;
        delete process.env.WT_SESSION;
        delete process.env.ConEmuANSI;
        delete process.env.TERM_PROGRAM;
        process.env.CHCP = "65001";
        Object.defineProperty(process, "platform", {
          value: "win32",
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-33`
        );
        expect(module.supportsUnicode()).to.be.true;
      });

      it("should return false on Windows without Unicode support", async function () {
        delete process.env.TERM;
        delete process.env.WT_SESSION;
        delete process.env.ConEmuANSI;
        delete process.env.TERM_PROGRAM;
        delete process.env.CHCP;
        Object.defineProperty(process, "platform", {
          value: "win32",
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-34`
        );
        expect(module.supportsUnicode()).to.be.false;
      });

      it("should return true when LANG contains UTF-8", async function () {
        delete process.env.TERM;
        process.env.LANG = "en_US.UTF-8";
        Object.defineProperty(process, "platform", {
          value: "linux",
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-35`
        );
        expect(module.supportsUnicode()).to.be.true;
      });

      it("should return true when LANG contains utf8 (lowercase)", async function () {
        delete process.env.TERM;
        process.env.LANG = "en_US.utf8";
        Object.defineProperty(process, "platform", {
          value: "linux",
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-36`
        );
        expect(module.supportsUnicode()).to.be.true;
      });

      it("should return true when LC_ALL contains UTF-8", async function () {
        delete process.env.TERM;
        delete process.env.LANG;
        process.env.LC_ALL = "en_US.UTF-8";
        Object.defineProperty(process, "platform", {
          value: "linux",
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-37`
        );
        expect(module.supportsUnicode()).to.be.true;
      });

      it("should return TTY status when no locale is set", async function () {
        delete process.env.TERM;
        delete process.env.LANG;
        delete process.env.LC_ALL;
        Object.defineProperty(process, "platform", {
          value: "linux",
          writable: true,
          configurable: true,
        });
        Object.defineProperty(process.stdout, "isTTY", {
          value: true,
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-38`
        );
        expect(module.supportsUnicode()).to.be.true;
      });

      it("should return false when not TTY and no locale", async function () {
        delete process.env.TERM;
        delete process.env.LANG;
        delete process.env.LC_ALL;
        Object.defineProperty(process, "platform", {
          value: "linux",
          writable: true,
          configurable: true,
        });
        Object.defineProperty(process.stdout, "isTTY", {
          value: false,
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-39`
        );
        expect(module.supportsUnicode()).to.be.false;
      });
    });

    describe("getCapabilities", function () {
      it("should return an object with all capability properties", async function () {
        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-40`
        );
        const caps = module.getCapabilities();

        expect(caps).to.have.property("colorDisabled");
        expect(caps).to.have.property("colorDepth");
        expect(caps).to.have.property("theme");
        expect(caps).to.have.property("unicode");
        expect(caps).to.have.property("isTTY");
        expect(caps).to.have.property("columns");
        expect(caps).to.have.property("rows");
      });

      it("should use default columns when not set", async function () {
        Object.defineProperty(process.stdout, "columns", {
          value: undefined,
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-41`
        );
        const caps = module.getCapabilities();
        expect(caps.columns).to.equal(80);
      });

      it("should use default rows when not set", async function () {
        Object.defineProperty(process.stdout, "rows", {
          value: undefined,
          writable: true,
          configurable: true,
        });

        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-42`
        );
        const caps = module.getCapabilities();
        expect(caps.rows).to.equal(24);
      });
    });

    describe("capabilities (cached)", function () {
      it("should return cached capabilities", async function () {
        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-43`
        );
        const caps1 = module.capabilities();
        const caps2 = module.capabilities();
        expect(caps1).to.equal(caps2);
      });

      it("should refresh capabilities when refresh=true", async function () {
        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-44`
        );
        const caps1 = module.capabilities();
        const caps2 = module.capabilities(true);
        expect(caps1).to.not.equal(caps2);
      });
    });

    describe("default export", function () {
      it("should export all functions", async function () {
        const module = await import(
          `../../src/ui/capabilities.js?v=${Date.now()}-45`
        );
        const defaultExport = module.default;

        expect(defaultExport.ColorDepth).to.equal(module.ColorDepth);
        expect(defaultExport.ThemeMode).to.equal(module.ThemeMode);
        expect(defaultExport.isColorDisabled).to.equal(module.isColorDisabled);
        expect(defaultExport.detectColorDepth).to.equal(module.detectColorDepth);
        expect(defaultExport.detectTheme).to.equal(module.detectTheme);
        expect(defaultExport.supportsUnicode).to.equal(module.supportsUnicode);
        expect(defaultExport.getCapabilities).to.equal(module.getCapabilities);
        expect(defaultExport.capabilities).to.equal(module.capabilities);
      });
    });
  });

  // ============================================================================
  // KEYBOARD TESTS
  // ============================================================================
  describe("keyboard.js", function () {
    let keyboard;

    before(async function () {
      keyboard = await import("../../src/ui/keyboard.js");
    });

    describe("defaultBindings", function () {
      it("should have navigation bindings", function () {
        expect(keyboard.defaultBindings.up).to.be.an("array");
        expect(keyboard.defaultBindings.down).to.be.an("array");
        expect(keyboard.defaultBindings.left).to.be.an("array");
        expect(keyboard.defaultBindings.right).to.be.an("array");
      });

      it("should have selection bindings", function () {
        expect(keyboard.defaultBindings.select).to.be.an("array");
        expect(keyboard.defaultBindings.selectNumber).to.be.an("array");
      });

      it("should have exit/cancel bindings", function () {
        expect(keyboard.defaultBindings.cancel).to.be.an("array");
        expect(keyboard.defaultBindings.quit).to.be.an("array");
      });

      it("should have action bindings", function () {
        expect(keyboard.defaultBindings.back).to.be.an("array");
        expect(keyboard.defaultBindings.help).to.be.an("array");
        expect(keyboard.defaultBindings.commandPalette).to.be.an("array");
      });

      it("should have page navigation bindings", function () {
        expect(keyboard.defaultBindings.pageUp).to.be.an("array");
        expect(keyboard.defaultBindings.pageDown).to.be.an("array");
        expect(keyboard.defaultBindings.home).to.be.an("array");
        expect(keyboard.defaultBindings.end).to.be.an("array");
      });
    });

    describe("matchesBinding", function () {
      it("should match simple key binding", function () {
        const key = { name: "up" };
        expect(keyboard.matchesBinding(key, "up")).to.be.true;
      });

      it("should match vim-style k for up", function () {
        const key = { name: "k" };
        expect(keyboard.matchesBinding(key, "up")).to.be.true;
      });

      it("should match vim-style j for down", function () {
        const key = { name: "j" };
        expect(keyboard.matchesBinding(key, "down")).to.be.true;
      });

      it("should match ctrl+c for quit", function () {
        const key = { name: "c", ctrl: true };
        expect(keyboard.matchesBinding(key, "quit")).to.be.true;
      });

      it("should match ctrl+k for command palette", function () {
        const key = { name: "k", ctrl: true };
        expect(keyboard.matchesBinding(key, "commandPalette")).to.be.true;
      });

      it("should match shift+h for help", function () {
        const key = { name: "h", shift: true };
        expect(keyboard.matchesBinding(key, "help")).to.be.true;
      });

      it("should return false for non-matching key", function () {
        const key = { name: "x" };
        expect(keyboard.matchesBinding(key, "up")).to.be.false;
      });

      it("should return false for unknown action", function () {
        const key = { name: "up" };
        expect(keyboard.matchesBinding(key, "unknownAction")).to.be.false;
      });

      it("should return false for null key", function () {
        expect(keyboard.matchesBinding(null, "up")).to.be.false;
      });

      it("should handle meta modifier", function () {
        const bindings = {
          test: [{ key: "t", meta: true }],
        };
        expect(keyboard.matchesBinding({ name: "t", meta: true }, "test", bindings)).to
          .be.true;
        expect(keyboard.matchesBinding({ name: "t", meta: false }, "test", bindings))
          .to.be.false;
      });

      it("should return false when shift modifier does not match", function () {
        const bindings = {
          test: [{ key: "h", shift: true }],
        };
        // Key pressed without shift, but binding requires shift
        expect(keyboard.matchesBinding({ name: "h", shift: false }, "test", bindings)).to.be.false;
      });

      it("should return false when ctrl modifier does not match", function () {
        const bindings = {
          test: [{ key: "c", ctrl: true }],
        };
        // Key pressed without ctrl, but binding requires ctrl
        expect(keyboard.matchesBinding({ name: "c", ctrl: false }, "test", bindings)).to.be.false;
      });

      it("should use custom bindings when provided", function () {
        const customBindings = {
          custom: [{ key: "x" }],
        };
        const key = { name: "x" };
        expect(keyboard.matchesBinding(key, "custom", customBindings)).to.be.true;
      });
    });

    describe("formatBinding", function () {
      it("should format simple key binding", function () {
        const binding = { key: "up" };
        expect(keyboard.formatBinding(binding)).to.equal("Up");
      });

      it("should format ctrl+key binding", function () {
        const binding = { key: "c", ctrl: true };
        expect(keyboard.formatBinding(binding)).to.equal("Ctrl+C");
      });

      it("should format alt+key binding", function () {
        const binding = { key: "x", meta: true };
        expect(keyboard.formatBinding(binding)).to.equal("Alt+X");
      });

      it("should format shift+key binding", function () {
        const binding = { key: "h", shift: true };
        expect(keyboard.formatBinding(binding)).to.equal("Shift+H");
      });

      it("should format multi-modifier binding", function () {
        const binding = { key: "s", ctrl: true, shift: true };
        expect(keyboard.formatBinding(binding)).to.equal("Ctrl+Shift+S");
      });

      it("should handle array of keys (use first)", function () {
        const binding = { key: ["a", "b", "c"] };
        expect(keyboard.formatBinding(binding)).to.equal("A");
      });
    });

    describe("getBindingDisplays", function () {
      it("should return array of display strings for action", function () {
        const displays = keyboard.getBindingDisplays("up");
        expect(displays).to.be.an("array");
        expect(displays).to.include("Up");
        expect(displays).to.include("K");
      });

      it("should return empty array for unknown action", function () {
        const displays = keyboard.getBindingDisplays("unknownAction");
        expect(displays).to.be.an("array");
        expect(displays).to.have.length(0);
      });

      it("should use custom bindings when provided", function () {
        const customBindings = {
          custom: [{ key: "x", ctrl: true }],
        };
        const displays = keyboard.getBindingDisplays("custom", customBindings);
        expect(displays).to.include("Ctrl+X");
      });
    });

    describe("createKeyHandler", function () {
      it("should call handler when key matches action", function () {
        let called = false;
        const handlers = {
          up: () => {
            called = true;
          },
        };
        const handler = keyboard.createKeyHandler(handlers);
        handler("", { name: "up" });
        expect(called).to.be.true;
      });

      it("should return true when key is handled", function () {
        const handlers = { up: () => {} };
        const handler = keyboard.createKeyHandler(handlers);
        expect(handler("", { name: "up" })).to.be.true;
      });

      it("should return false when key is not handled", function () {
        const handlers = { up: () => {} };
        const handler = keyboard.createKeyHandler(handlers);
        expect(handler("", { name: "x" })).to.be.false;
      });

      it("should handle number key selection via special case", function () {
        let selectedIndex = -1;
        const handlers = {
          selectNumber: (index, key, str) => {
            selectedIndex = index;
          },
        };
        // Use empty bindings so the special case logic is triggered
        const emptyBindings = {};
        const handler = keyboard.createKeyHandler(handlers, emptyBindings);
        handler("5", { name: "5" });
        expect(selectedIndex).to.equal(4); // 5 - 1 = 4 (0-indexed)
      });

      it("should handle number key selection via bindings", function () {
        let receivedKey = null;
        const handlers = {
          selectNumber: (key, str) => {
            receivedKey = key;
          },
        };
        const handler = keyboard.createKeyHandler(handlers);
        handler("5", { name: "5" });
        expect(receivedKey.name).to.equal("5");
      });

      it("should not call handler for null key", function () {
        let called = false;
        const handlers = { up: () => { called = true; } };
        const handler = keyboard.createKeyHandler(handlers);
        handler("", null);
        expect(called).to.be.false;
      });

      it("should pass key and str to handler", function () {
        let receivedKey, receivedStr;
        const handlers = {
          up: (key, str) => {
            receivedKey = key;
            receivedStr = str;
          },
        };
        const handler = keyboard.createKeyHandler(handlers);
        handler("test", { name: "up" });
        expect(receivedKey).to.deep.equal({ name: "up" });
        expect(receivedStr).to.equal("test");
      });
    });

    describe("mergeBindings", function () {
      it("should merge custom bindings with defaults", function () {
        const custom = {
          up: [{ key: "w" }],
        };
        const merged = keyboard.mergeBindings(custom);
        expect(merged.up).to.have.length(3); // w + up + k
        expect(merged.up[0].key).to.equal("w");
      });

      it("should add new actions from custom bindings", function () {
        const custom = {
          newAction: [{ key: "n" }],
        };
        const merged = keyboard.mergeBindings(custom);
        expect(merged.newAction).to.be.an("array");
        expect(merged.newAction[0].key).to.equal("n");
      });

      it("should not modify default bindings", function () {
        const original = keyboard.defaultBindings.up.length;
        keyboard.mergeBindings({ up: [{ key: "w" }] });
        expect(keyboard.defaultBindings.up.length).to.equal(original);
      });
    });

    describe("default export", function () {
      it("should export all functions", function () {
        expect(keyboard.default.defaultBindings).to.equal(
          keyboard.defaultBindings
        );
        expect(keyboard.default.matchesBinding).to.equal(
          keyboard.matchesBinding
        );
        expect(keyboard.default.formatBinding).to.equal(keyboard.formatBinding);
        expect(keyboard.default.getBindingDisplays).to.equal(
          keyboard.getBindingDisplays
        );
        expect(keyboard.default.createKeyHandler).to.equal(
          keyboard.createKeyHandler
        );
        expect(keyboard.default.mergeBindings).to.equal(keyboard.mergeBindings);
      });
    });
  });

  // ============================================================================
  // FOCUS MANAGER TESTS
  // ============================================================================
  describe("focus-manager.js", function () {
    let focusManager;

    before(async function () {
      focusManager = await import("../../src/ui/focus-manager.js");
    });

    describe("FocusManager class", function () {
      let manager;

      beforeEach(function () {
        manager = new focusManager.FocusManager();
      });

      describe("push", function () {
        it("should push focus state onto stack", function () {
          manager.push("menu1", 0);
          expect(manager.getDepth()).to.equal(1);
        });

        it("should push with metadata", function () {
          manager.push("menu1", 2, { scrollOffset: 10 });
          const state = manager.peek();
          expect(state.metadata).to.deep.equal({ scrollOffset: 10 });
        });

        it("should save state to savedStates", function () {
          manager.push("menu1", 3);
          const saved = manager.getSavedState("menu1");
          expect(saved).to.not.be.null;
          expect(saved.index).to.equal(3);
        });
      });

      describe("pop", function () {
        it("should pop and return focus state", function () {
          manager.push("menu1", 0);
          const popped = manager.pop();
          expect(popped.id).to.equal("menu1");
          expect(manager.getDepth()).to.equal(0);
        });

        it("should return null when stack is empty", function () {
          const popped = manager.pop();
          expect(popped).to.be.null;
        });
      });

      describe("peek", function () {
        it("should return current state without removing", function () {
          manager.push("menu1", 0);
          const state = manager.peek();
          expect(state.id).to.equal("menu1");
          expect(manager.getDepth()).to.equal(1);
        });

        it("should return null when stack is empty", function () {
          const state = manager.peek();
          expect(state).to.be.null;
        });
      });

      describe("updateIndex", function () {
        it("should update current state index", function () {
          manager.push("menu1", 0);
          manager.updateIndex(5);
          expect(manager.peek().index).to.equal(5);
        });

        it("should do nothing when stack is empty", function () {
          manager.updateIndex(5); // Should not throw
        });

        it("should update saved state", function () {
          manager.push("menu1", 0);
          manager.updateIndex(5);
          expect(manager.getSavedIndex("menu1")).to.equal(5);
        });
      });

      describe("updateMetadata", function () {
        it("should merge metadata with existing", function () {
          manager.push("menu1", 0, { a: 1 });
          manager.updateMetadata({ b: 2 });
          const state = manager.peek();
          expect(state.metadata).to.deep.equal({ a: 1, b: 2 });
        });

        it("should do nothing when stack is empty", function () {
          manager.updateMetadata({ a: 1 }); // Should not throw
        });
      });

      describe("getSavedState", function () {
        it("should return saved state by id", function () {
          manager.push("menu1", 3);
          const saved = manager.getSavedState("menu1");
          expect(saved.index).to.equal(3);
        });

        it("should return null for unknown id", function () {
          const saved = manager.getSavedState("unknown");
          expect(saved).to.be.null;
        });
      });

      describe("getSavedIndex", function () {
        it("should return saved index for id", function () {
          manager.push("menu1", 5);
          expect(manager.getSavedIndex("menu1")).to.equal(5);
        });

        it("should return default when id not found", function () {
          expect(manager.getSavedIndex("unknown", 10)).to.equal(10);
        });

        it("should return 0 as default when id not found", function () {
          expect(manager.getSavedIndex("unknown")).to.equal(0);
        });
      });

      describe("canGoBack", function () {
        it("should return false when stack has 0 items", function () {
          expect(manager.canGoBack()).to.be.false;
        });

        it("should return false when stack has 1 item", function () {
          manager.push("menu1", 0);
          expect(manager.canGoBack()).to.be.false;
        });

        it("should return true when stack has 2+ items", function () {
          manager.push("menu1", 0);
          manager.push("menu2", 0);
          expect(manager.canGoBack()).to.be.true;
        });
      });

      describe("getPrevious", function () {
        it("should return null when stack has 0 items", function () {
          expect(manager.getPrevious()).to.be.null;
        });

        it("should return null when stack has 1 item", function () {
          manager.push("menu1", 0);
          expect(manager.getPrevious()).to.be.null;
        });

        it("should return previous state when stack has 2+ items", function () {
          manager.push("menu1", 1);
          manager.push("menu2", 2);
          const prev = manager.getPrevious();
          expect(prev.id).to.equal("menu1");
          expect(prev.index).to.equal(1);
        });
      });

      describe("clear", function () {
        it("should clear stack and saved states", function () {
          manager.push("menu1", 0);
          manager.push("menu2", 0);
          manager.clear();
          expect(manager.getDepth()).to.equal(0);
          expect(manager.getSavedState("menu1")).to.be.null;
        });
      });

      describe("getDepth", function () {
        it("should return stack depth", function () {
          expect(manager.getDepth()).to.equal(0);
          manager.push("menu1", 0);
          expect(manager.getDepth()).to.equal(1);
          manager.push("menu2", 0);
          expect(manager.getDepth()).to.equal(2);
        });
      });

      describe("getBreadcrumbs", function () {
        it("should return array of menu IDs", function () {
          manager.push("home", 0);
          manager.push("settings", 0);
          manager.push("advanced", 0);
          expect(manager.getBreadcrumbs()).to.deep.equal([
            "home",
            "settings",
            "advanced",
          ]);
        });

        it("should return empty array when stack is empty", function () {
          expect(manager.getBreadcrumbs()).to.deep.equal([]);
        });
      });
    });

    describe("getFocusManager", function () {
      it("should return a FocusManager instance", function () {
        const manager = focusManager.getFocusManager();
        expect(manager).to.be.instanceOf(focusManager.FocusManager);
      });

      it("should return the same instance on multiple calls", function () {
        const manager1 = focusManager.getFocusManager();
        const manager2 = focusManager.getFocusManager();
        expect(manager1).to.equal(manager2);
      });
    });

    describe("resetFocusManager", function () {
      it("should return a new FocusManager instance", function () {
        const manager1 = focusManager.getFocusManager();
        const manager2 = focusManager.resetFocusManager();
        expect(manager1).to.not.equal(manager2);
      });
    });

    describe("createFocusableMenu", function () {
      beforeEach(function () {
        focusManager.resetFocusManager();
      });

      it("should create menu handlers", function () {
        const menu = focusManager.createFocusableMenu("testMenu", {
          itemCount: 5,
          onSelect: () => {},
        });

        expect(menu.enter).to.be.a("function");
        expect(menu.moveUp).to.be.a("function");
        expect(menu.moveDown).to.be.a("function");
        expect(menu.select).to.be.a("function");
        expect(menu.back).to.be.a("function");
        expect(menu.getIndex).to.be.a("function");
        expect(menu.setIndex).to.be.a("function");
      });

      it("should push to focus stack on enter", function () {
        const menu = focusManager.createFocusableMenu("testMenu", {
          itemCount: 5,
          onSelect: () => {},
        });
        menu.enter();
        const manager = focusManager.getFocusManager();
        expect(manager.peek().id).to.equal("testMenu");
      });

      it("should call onRender on enter", function () {
        let renderedIndex = -1;
        const menu = focusManager.createFocusableMenu("testMenu", {
          itemCount: 5,
          onSelect: () => {},
          onRender: (index) => {
            renderedIndex = index;
          },
        });
        menu.enter();
        expect(renderedIndex).to.equal(0);
      });

      it("should navigate up with wrap-around", function () {
        const menu = focusManager.createFocusableMenu("testMenu", {
          itemCount: 3,
          onSelect: () => {},
        });
        menu.enter();
        expect(menu.moveUp()).to.equal(2); // Wraps to last
      });

      it("should navigate down with wrap-around", function () {
        const menu = focusManager.createFocusableMenu("testMenu", {
          itemCount: 3,
          onSelect: () => {},
        });
        menu.enter();
        menu.setIndex(2);
        expect(menu.moveDown()).to.equal(0); // Wraps to first
      });

      it("should call onSelect when selecting", function () {
        let selectedIndex = -1;
        const menu = focusManager.createFocusableMenu("testMenu", {
          itemCount: 3,
          onSelect: (index) => {
            selectedIndex = index;
          },
        });
        menu.enter();
        menu.setIndex(1);
        menu.select();
        expect(selectedIndex).to.equal(1);
      });

      it("should pop focus stack on back", function () {
        const menu = focusManager.createFocusableMenu("testMenu", {
          itemCount: 3,
          onSelect: () => {},
        });
        menu.enter();
        menu.back();
        const manager = focusManager.getFocusManager();
        expect(manager.getDepth()).to.equal(0);
      });

      it("should call onBack when going back", function () {
        let backCalled = false;
        const menu = focusManager.createFocusableMenu("testMenu", {
          itemCount: 3,
          onSelect: () => {},
          onBack: () => {
            backCalled = true;
          },
        });
        menu.enter();
        menu.back();
        expect(backCalled).to.be.true;
      });

      it("should get current index", function () {
        const menu = focusManager.createFocusableMenu("testMenu", {
          itemCount: 3,
          onSelect: () => {},
        });
        menu.enter();
        expect(menu.getIndex()).to.equal(0);
        menu.moveDown();
        expect(menu.getIndex()).to.equal(1);
      });

      it("should set index with bounds checking", function () {
        const menu = focusManager.createFocusableMenu("testMenu", {
          itemCount: 3,
          onSelect: () => {},
        });
        menu.enter();
        expect(menu.setIndex(2)).to.equal(2);
        expect(menu.setIndex(-1)).to.equal(2); // Invalid, stays same
        expect(menu.setIndex(10)).to.equal(2); // Invalid, stays same
      });

      it("should restore saved index on re-enter", function () {
        focusManager.resetFocusManager();
        const manager = focusManager.getFocusManager();
        manager.push("testMenu", 2);
        manager.pop();

        const menu = focusManager.createFocusableMenu("testMenu", {
          itemCount: 5,
          onSelect: () => {},
        });
        expect(menu.getIndex()).to.equal(2);
      });

      it("should work without onRender callback", function () {
        focusManager.resetFocusManager();
        const menu = focusManager.createFocusableMenu("noRenderMenu", {
          itemCount: 3,
          onSelect: () => {},
          onRender: undefined, // Explicitly undefined
        });
        menu.enter();
        expect(menu.getIndex()).to.equal(0);
        // Test moveUp with wrap (from 0 to 2)
        menu.moveUp();
        expect(menu.getIndex()).to.equal(2);
        // Test moveUp without wrap (from 2 to 1)
        menu.moveUp();
        expect(menu.getIndex()).to.equal(1);
        // Test moveDown without wrap (from 1 to 2)
        menu.moveDown();
        expect(menu.getIndex()).to.equal(2);
        // Test moveDown with wrap (from 2 to 0)
        menu.moveDown();
        expect(menu.getIndex()).to.equal(0);
        // Test setIndex
        menu.setIndex(1);
        expect(menu.getIndex()).to.equal(1);
      });

      it("should work with onRender callback on moveUp/moveDown/setIndex", function () {
        focusManager.resetFocusManager();
        let renderCount = 0;
        const menu = focusManager.createFocusableMenu("renderMenu", {
          itemCount: 3,
          onSelect: () => {},
          onRender: () => { renderCount++; },
        });
        menu.enter();
        expect(renderCount).to.equal(1);
        menu.moveUp();
        expect(renderCount).to.equal(2);
        menu.moveDown();
        expect(renderCount).to.equal(3);
        menu.setIndex(1);
        expect(renderCount).to.equal(4);
      });

      it("should work without onBack callback", function () {
        const menu = focusManager.createFocusableMenu("noBackMenu", {
          itemCount: 3,
          onSelect: () => {},
          // No onBack provided
        });
        menu.enter();
        menu.back(); // Should not throw
        const manager = focusManager.getFocusManager();
        expect(manager.getDepth()).to.equal(0);
      });

      it("should work without onSelect callback", function () {
        const menu = focusManager.createFocusableMenu("noSelectMenu", {
          itemCount: 3,
          // No onSelect provided
        });
        menu.enter();
        const result = menu.select(); // Should not throw
        expect(result).to.equal(0);
      });
    });

    describe("default export", function () {
      it("should export all functions", function () {
        expect(focusManager.default.FocusManager).to.equal(
          focusManager.FocusManager
        );
        expect(focusManager.default.getFocusManager).to.equal(
          focusManager.getFocusManager
        );
        expect(focusManager.default.resetFocusManager).to.equal(
          focusManager.resetFocusManager
        );
        expect(focusManager.default.createFocusableMenu).to.equal(
          focusManager.createFocusableMenu
        );
      });
    });
  });

  // ============================================================================
  // COMMAND PALETTE TESTS
  // ============================================================================
  describe("command-palette.js", function () {
    let commandPalette;

    before(async function () {
      commandPalette = await import("../../src/ui/command-palette.js");
    });

    beforeEach(function () {
      // Reset the global palette for each test
      commandPalette.resetCommandPalette();
    });

    describe("defaultCommands", function () {
      it("should have preset commands", function () {
        const presets = commandPalette.defaultCommands.filter(
          (c) => c.category === "Presets"
        );
        expect(presets.length).to.be.greaterThan(0);
      });

      it("should have length commands", function () {
        const lengths = commandPalette.defaultCommands.filter(
          (c) => c.category === "Length"
        );
        expect(lengths.length).to.be.greaterThan(0);
      });

      it("should have action commands", function () {
        const actions = commandPalette.defaultCommands.filter(
          (c) => c.category === "Actions"
        );
        expect(actions.length).to.be.greaterThan(0);
      });

      it("should have commands with actions that return objects", function () {
        const quickPreset = commandPalette.defaultCommands.find(
          (c) => c.id === "preset-quick"
        );
        expect(quickPreset.action()).to.deep.equal({ preset: "quick" });
      });

      it("should execute all command actions", function () {
        // Test all command actions return proper objects
        commandPalette.defaultCommands.forEach((cmd) => {
          const result = cmd.action();
          expect(result).to.be.an("object");
        });
      });

      it("should have secure preset action", function () {
        const secure = commandPalette.defaultCommands.find((c) => c.id === "preset-secure");
        expect(secure.action()).to.deep.equal({ preset: "secure" });
      });

      it("should have memorable preset action", function () {
        const memorable = commandPalette.defaultCommands.find((c) => c.id === "preset-memorable");
        expect(memorable.action()).to.deep.equal({ preset: "memorable" });
      });

      it("should have length actions", function () {
        const length8 = commandPalette.defaultCommands.find((c) => c.id === "length-8");
        const length16 = commandPalette.defaultCommands.find((c) => c.id === "length-16");
        const length24 = commandPalette.defaultCommands.find((c) => c.id === "length-24");
        const length32 = commandPalette.defaultCommands.find((c) => c.id === "length-32");

        expect(length8.action()).to.deep.equal({ length: 8 });
        expect(length16.action()).to.deep.equal({ length: 16 });
        expect(length24.action()).to.deep.equal({ length: 24 });
        expect(length32.action()).to.deep.equal({ length: 32 });
      });

      it("should have clipboard action", function () {
        const clipboard = commandPalette.defaultCommands.find((c) => c.id === "copy-clipboard");
        expect(clipboard.action()).to.deep.equal({ clipboard: true });
      });

      it("should have help action", function () {
        const help = commandPalette.defaultCommands.find((c) => c.id === "help");
        expect(help.action()).to.deep.equal({ showHelp: true });
      });

      it("should have quit action", function () {
        const quit = commandPalette.defaultCommands.find((c) => c.id === "quit");
        expect(quit.action()).to.deep.equal({ quit: true });
      });
    });

    describe("fuzzyMatch", function () {
      it("should return 1 for empty query", function () {
        expect(commandPalette.fuzzyMatch("", "anything")).to.equal(1);
      });

      it("should return 100 for exact match", function () {
        expect(commandPalette.fuzzyMatch("test", "test")).to.equal(100);
      });

      it("should return 80 for starts with", function () {
        expect(commandPalette.fuzzyMatch("test", "testing")).to.equal(80);
      });

      it("should return 60 for contains", function () {
        expect(commandPalette.fuzzyMatch("test", "a test string")).to.equal(60);
      });

      it("should return score for fuzzy match", function () {
        const score = commandPalette.fuzzyMatch("tst", "test");
        expect(score).to.be.greaterThan(0);
      });

      it("should return 0 for no match", function () {
        expect(commandPalette.fuzzyMatch("xyz", "abc")).to.equal(0);
      });

      it("should be case insensitive", function () {
        expect(commandPalette.fuzzyMatch("TEST", "test")).to.equal(100);
      });

      it("should give consecutive bonus", function () {
        const consecutiveScore = commandPalette.fuzzyMatch("abc", "abcdef");
        const spreadScore = commandPalette.fuzzyMatch("adf", "abcdef");
        expect(consecutiveScore).to.be.greaterThan(spreadScore);
      });
    });

    describe("searchCommands", function () {
      it("should return all commands for empty query", function () {
        const results = commandPalette.searchCommands(
          commandPalette.defaultCommands,
          ""
        );
        expect(results.length).to.equal(commandPalette.defaultCommands.length);
      });

      it("should filter commands by query", function () {
        const results = commandPalette.searchCommands(
          commandPalette.defaultCommands,
          "secure"
        );
        expect(results.length).to.be.greaterThan(0);
        expect(results[0].id).to.equal("preset-secure");
      });

      it("should search in description", function () {
        const results = commandPalette.searchCommands(
          commandPalette.defaultCommands,
          "clipboard"
        );
        expect(results.length).to.be.greaterThan(0);
        expect(results[0].id).to.equal("copy-clipboard");
      });

      it("should search in category", function () {
        const results = commandPalette.searchCommands(
          commandPalette.defaultCommands,
          "Presets"
        );
        expect(results.length).to.be.greaterThan(0);
        results.forEach((r) => expect(r.category).to.equal("Presets"));
      });

      it("should sort by score descending", function () {
        const results = commandPalette.searchCommands(
          commandPalette.defaultCommands,
          "quick"
        );
        // First result should be best match
        expect(results[0].name).to.include("Quick");
      });

      it("should handle commands without description or category", function () {
        const commands = [
          { id: "test", name: "Test", action: () => ({}) },
        ];
        const results = commandPalette.searchCommands(commands, "test");
        expect(results.length).to.equal(1);
      });
    });

    describe("CommandPalette class", function () {
      let palette;

      beforeEach(function () {
        palette = new commandPalette.CommandPalette();
      });

      describe("constructor", function () {
        it("should initialize with default commands", function () {
          expect(palette.commands).to.equal(commandPalette.defaultCommands);
        });

        it("should accept custom commands", function () {
          const custom = [{ id: "custom", name: "Custom", action: () => ({}) }];
          const customPalette = new commandPalette.CommandPalette(custom);
          expect(customPalette.commands).to.equal(custom);
        });

        it("should initialize with isOpen=false", function () {
          expect(palette.isOpen).to.be.false;
        });
      });

      describe("open", function () {
        it("should set isOpen to true", function () {
          palette.open();
          expect(palette.isOpen).to.be.true;
        });

        it("should reset query and selection", function () {
          palette.query = "test";
          palette.selectedIndex = 5;
          palette.open();
          expect(palette.query).to.equal("");
          expect(palette.selectedIndex).to.equal(0);
        });

        it("should set onSelect and onClose callbacks", function () {
          const onSelect = () => {};
          const onClose = () => {};
          palette.open({ onSelect, onClose });
          expect(palette.onSelect).to.equal(onSelect);
          expect(palette.onClose).to.equal(onClose);
        });

        it("should reset filtered commands", function () {
          palette.filteredCommands = [];
          palette.open();
          expect(palette.filteredCommands).to.equal(palette.commands);
        });
      });

      describe("close", function () {
        it("should set isOpen to false", function () {
          palette.open();
          palette.close();
          expect(palette.isOpen).to.be.false;
        });

        it("should reset query", function () {
          palette.open();
          palette.handleInput("t");
          palette.close();
          expect(palette.query).to.equal("");
        });

        it("should call onClose callback", function () {
          let closeCalled = false;
          palette.open({ onClose: () => { closeCalled = true; } });
          palette.close();
          expect(closeCalled).to.be.true;
        });
      });

      describe("setQuery", function () {
        it("should update query", function () {
          palette.setQuery("test");
          expect(palette.query).to.equal("test");
        });

        it("should filter commands", function () {
          palette.setQuery("secure");
          expect(palette.filteredCommands.length).to.be.lessThan(
            palette.commands.length
          );
        });

        it("should reset selection index", function () {
          palette.selectedIndex = 5;
          palette.setQuery("test");
          expect(palette.selectedIndex).to.equal(0);
        });
      });

      describe("handleInput", function () {
        it("should append character to query", function () {
          palette.handleInput("a");
          palette.handleInput("b");
          expect(palette.query).to.equal("ab");
        });
      });

      describe("handleBackspace", function () {
        it("should remove last character from query", function () {
          palette.setQuery("test");
          palette.handleBackspace();
          expect(palette.query).to.equal("tes");
        });

        it("should do nothing when query is empty", function () {
          palette.setQuery("");
          palette.handleBackspace();
          expect(palette.query).to.equal("");
        });
      });

      describe("moveUp", function () {
        beforeEach(function () {
          palette.open();
        });

        it("should decrement selection index", function () {
          palette.selectedIndex = 5;
          palette.moveUp();
          expect(palette.selectedIndex).to.equal(4);
        });

        it("should wrap to last item when at first", function () {
          palette.selectedIndex = 0;
          palette.moveUp();
          expect(palette.selectedIndex).to.equal(
            palette.filteredCommands.length - 1
          );
        });

        it("should do nothing when no filtered commands", function () {
          palette.filteredCommands = [];
          palette.moveUp();
          expect(palette.selectedIndex).to.equal(0);
        });
      });

      describe("moveDown", function () {
        beforeEach(function () {
          palette.open();
        });

        it("should increment selection index", function () {
          palette.selectedIndex = 0;
          palette.moveDown();
          expect(palette.selectedIndex).to.equal(1);
        });

        it("should wrap to first item when at last", function () {
          palette.selectedIndex = palette.filteredCommands.length - 1;
          palette.moveDown();
          expect(palette.selectedIndex).to.equal(0);
        });

        it("should do nothing when no filtered commands", function () {
          palette.filteredCommands = [];
          palette.moveDown();
          expect(palette.selectedIndex).to.equal(0);
        });
      });

      describe("select", function () {
        beforeEach(function () {
          palette.open();
        });

        it("should execute command action", function () {
          palette.setQuery("quit");
          const result = palette.select();
          expect(result).to.deep.equal({ quit: true });
        });

        it("should close palette", function () {
          palette.select();
          expect(palette.isOpen).to.be.false;
        });

        it("should call onSelect callback", function () {
          let selectedCommand = null;
          let selectedResult = null;
          palette.onSelect = (cmd, result) => {
            selectedCommand = cmd;
            selectedResult = result;
          };
          palette.select();
          expect(selectedCommand).to.not.be.null;
          expect(selectedResult).to.not.be.null;
        });

        it("should return null when no commands", function () {
          palette.filteredCommands = [];
          const result = palette.select();
          expect(result).to.be.null;
        });

        it("should return null when selectedIndex out of range", function () {
          palette.selectedIndex = 100;
          const result = palette.select();
          expect(result).to.be.null;
        });
      });

      describe("handleKeypress", function () {
        beforeEach(function () {
          palette.open();
        });

        it("should return false when not open", function () {
          palette.close();
          expect(palette.handleKeypress("a", { name: "a" })).to.be.false;
        });

        it("should close on escape", function () {
          palette.handleKeypress("", { name: "escape" });
          expect(palette.isOpen).to.be.false;
        });

        it("should move up on up arrow", function () {
          palette.selectedIndex = 5;
          palette.handleKeypress("", { name: "up" });
          expect(palette.selectedIndex).to.equal(4);
        });

        it("should move down on down arrow", function () {
          palette.handleKeypress("", { name: "down" });
          expect(palette.selectedIndex).to.equal(1);
        });

        it("should select on enter", function () {
          const result = palette.handleKeypress("", { name: "return" });
          expect(result).to.be.true;
          expect(palette.isOpen).to.be.false;
        });

        it("should handle backspace", function () {
          palette.setQuery("test");
          palette.handleKeypress("", { name: "backspace" });
          expect(palette.query).to.equal("tes");
        });

        it("should handle character input", function () {
          palette.handleKeypress("a", { name: "a" });
          expect(palette.query).to.equal("a");
        });

        it("should ignore ctrl+char combinations", function () {
          palette.handleKeypress("a", { name: "a", ctrl: true });
          expect(palette.query).to.equal("");
        });

        it("should ignore meta+char combinations", function () {
          palette.handleKeypress("a", { name: "a", meta: true });
          expect(palette.query).to.equal("");
        });

        it("should return true for handled keys", function () {
          expect(palette.handleKeypress("a", { name: "a" })).to.be.true;
        });

        it("should return false for unhandled keys", function () {
          expect(palette.handleKeypress("", { name: "f12" })).to.be.false;
        });
      });

      describe("render", function () {
        it("should return empty string when not open", function () {
          expect(palette.render()).to.equal("");
        });

        it("should return rendered string when open", function () {
          palette.open();
          const rendered = palette.render();
          expect(rendered).to.be.a("string");
          expect(rendered.length).to.be.greaterThan(0);
        });

        it("should show search prompt", function () {
          palette.open();
          const rendered = palette.render();
          expect(rendered).to.include("Type to search");
        });

        it("should show query when set", function () {
          palette.open();
          palette.setQuery("test");
          const rendered = palette.render();
          expect(rendered).to.include("test");
        });

        it("should show no results message when no matches", function () {
          palette.open();
          palette.setQuery("xyznonexistent");
          const rendered = palette.render();
          expect(rendered).to.include("No commands found");
        });

        it("should show more count when many results", function () {
          palette.open();
          const rendered = palette.render(5);
          expect(rendered).to.include("+");
        });

        it("should show help text", function () {
          palette.open();
          const rendered = palette.render();
          expect(rendered).to.include("navigate");
          expect(rendered).to.include("select");
          expect(rendered).to.include("close");
        });
      });
    });

    describe("getCommandPalette", function () {
      it("should return a CommandPalette instance", function () {
        const palette = commandPalette.getCommandPalette();
        expect(palette).to.be.instanceOf(commandPalette.CommandPalette);
      });

      it("should return same instance on multiple calls", function () {
        const palette1 = commandPalette.getCommandPalette();
        const palette2 = commandPalette.getCommandPalette();
        expect(palette1).to.equal(palette2);
      });

      it("should create new instance if none exists", async function () {
        // Import a fresh copy to get uninitialized state
        const freshModule = await import(`../../src/ui/command-palette.js?v=${Date.now()}-fresh`);
        const palette = freshModule.getCommandPalette();
        expect(palette).to.be.instanceOf(freshModule.CommandPalette);
      });
    });

    describe("resetCommandPalette", function () {
      it("should return a new CommandPalette instance", function () {
        const palette1 = commandPalette.getCommandPalette();
        const palette2 = commandPalette.resetCommandPalette();
        expect(palette1).to.not.equal(palette2);
      });

      it("should accept custom commands", function () {
        const custom = [{ id: "custom", name: "Custom", action: () => ({}) }];
        const palette = commandPalette.resetCommandPalette(custom);
        expect(palette.commands).to.equal(custom);
      });
    });

    describe("isCommandPaletteKey", function () {
      it("should return true for Ctrl+K", function () {
        expect(
          commandPalette.isCommandPaletteKey({ name: "k", ctrl: true })
        ).to.be.true;
      });

      it("should return true for Ctrl+P", function () {
        expect(
          commandPalette.isCommandPaletteKey({ name: "p", ctrl: true })
        ).to.be.true;
      });

      it("should return false for regular K", function () {
        expect(commandPalette.isCommandPaletteKey({ name: "k" })).to.be.false;
      });
    });

    describe("default export", function () {
      it("should export all functions and classes", function () {
        expect(commandPalette.default.CommandPalette).to.equal(
          commandPalette.CommandPalette
        );
        expect(commandPalette.default.defaultCommands).to.equal(
          commandPalette.defaultCommands
        );
        expect(commandPalette.default.fuzzyMatch).to.equal(
          commandPalette.fuzzyMatch
        );
        expect(commandPalette.default.searchCommands).to.equal(
          commandPalette.searchCommands
        );
        expect(commandPalette.default.getCommandPalette).to.equal(
          commandPalette.getCommandPalette
        );
        expect(commandPalette.default.resetCommandPalette).to.equal(
          commandPalette.resetCommandPalette
        );
        expect(commandPalette.default.isCommandPaletteKey).to.equal(
          commandPalette.isCommandPaletteKey
        );
      });
    });
  });

  // ============================================================================
  // TOKENS TESTS
  // ============================================================================
  describe("tokens.js", function () {
    let tokens;

    before(async function () {
      tokens = await import("../../src/ui/tokens.js");
    });

    describe("palette", function () {
      it("should have primary colors", function () {
        expect(tokens.palette.pink).to.be.a("string");
        expect(tokens.palette.hotPink).to.be.a("string");
        expect(tokens.palette.purple).to.be.a("string");
        expect(tokens.palette.violet).to.be.a("string");
      });

      it("should have accent colors", function () {
        expect(tokens.palette.cyan).to.be.a("string");
        expect(tokens.palette.mint).to.be.a("string");
        expect(tokens.palette.peach).to.be.a("string");
        expect(tokens.palette.coral).to.be.a("string");
      });

      it("should have gray scale", function () {
        expect(tokens.palette.gray).to.be.an("object");
        expect(tokens.palette.gray[50]).to.be.a("string");
        expect(tokens.palette.gray[900]).to.be.a("string");
      });

      it("should have light theme variants", function () {
        expect(tokens.palette.light).to.be.an("object");
        expect(tokens.palette.light.pink).to.be.a("string");
        expect(tokens.palette.light.text).to.be.a("string");
      });
    });

    describe("darkTheme", function () {
      it("should have brand tokens", function () {
        expect(tokens.darkTheme.brand.primary).to.be.a("string");
        expect(tokens.darkTheme.brand.secondary).to.be.a("string");
        expect(tokens.darkTheme.brand.gradient).to.be.an("array");
      });

      it("should have feedback tokens", function () {
        expect(tokens.darkTheme.feedback.success).to.be.a("string");
        expect(tokens.darkTheme.feedback.warning).to.be.a("string");
        expect(tokens.darkTheme.feedback.error).to.be.a("string");
        expect(tokens.darkTheme.feedback.info).to.be.a("string");
      });

      it("should have text tokens", function () {
        expect(tokens.darkTheme.text.primary).to.be.a("string");
        expect(tokens.darkTheme.text.secondary).to.be.a("string");
        expect(tokens.darkTheme.text.muted).to.be.a("string");
        expect(tokens.darkTheme.text.disabled).to.be.a("string");
      });

      it("should have background tokens", function () {
        expect(tokens.darkTheme.background.primary).to.be.a("string");
        expect(tokens.darkTheme.background.secondary).to.be.a("string");
        expect(tokens.darkTheme.background.elevated).to.be.a("string");
      });

      it("should have border tokens", function () {
        expect(tokens.darkTheme.border.default).to.be.a("string");
        expect(tokens.darkTheme.border.focus).to.be.a("string");
        expect(tokens.darkTheme.border.error).to.be.a("string");
      });

      it("should have interactive tokens", function () {
        expect(tokens.darkTheme.interactive.default).to.be.a("string");
        expect(tokens.darkTheme.interactive.hover).to.be.a("string");
        expect(tokens.darkTheme.interactive.active).to.be.a("string");
        expect(tokens.darkTheme.interactive.focus).to.be.a("string");
      });

      it("should have strength tokens", function () {
        expect(tokens.darkTheme.strength.weak).to.be.a("string");
        expect(tokens.darkTheme.strength.medium).to.be.a("string");
        expect(tokens.darkTheme.strength.strong).to.be.a("string");
        expect(tokens.darkTheme.strength.maximum).to.be.a("string");
      });
    });

    describe("lightTheme", function () {
      it("should have all token categories", function () {
        expect(tokens.lightTheme.brand).to.be.an("object");
        expect(tokens.lightTheme.feedback).to.be.an("object");
        expect(tokens.lightTheme.text).to.be.an("object");
        expect(tokens.lightTheme.background).to.be.an("object");
        expect(tokens.lightTheme.border).to.be.an("object");
        expect(tokens.lightTheme.interactive).to.be.an("object");
        expect(tokens.lightTheme.strength).to.be.an("object");
      });
    });

    describe("highContrastTheme", function () {
      it("should have high contrast colors", function () {
        expect(tokens.highContrastTheme.text.primary).to.equal("#FFFFFF");
        expect(tokens.highContrastTheme.background.primary).to.equal("#000000");
      });

      it("should have all token categories", function () {
        expect(tokens.highContrastTheme.brand).to.be.an("object");
        expect(tokens.highContrastTheme.feedback).to.be.an("object");
        expect(tokens.highContrastTheme.text).to.be.an("object");
        expect(tokens.highContrastTheme.background).to.be.an("object");
        expect(tokens.highContrastTheme.border).to.be.an("object");
        expect(tokens.highContrastTheme.interactive).to.be.an("object");
        expect(tokens.highContrastTheme.strength).to.be.an("object");
      });
    });

    describe("getTheme", function () {
      it("should return darkTheme by default", function () {
        expect(tokens.getTheme()).to.equal(tokens.darkTheme);
      });

      it("should return darkTheme for dark mode", function () {
        expect(tokens.getTheme("dark")).to.equal(tokens.darkTheme);
      });

      it("should return lightTheme for light mode", function () {
        expect(tokens.getTheme("light")).to.equal(tokens.lightTheme);
      });

      it("should return highContrastTheme for high-contrast mode", function () {
        expect(tokens.getTheme("high-contrast")).to.equal(
          tokens.highContrastTheme
        );
      });

      it("should return darkTheme for unknown mode", function () {
        expect(tokens.getTheme("unknown")).to.equal(tokens.darkTheme);
      });
    });

    describe("resolveToken", function () {
      it("should resolve single level path", function () {
        // Since darkTheme doesn't have a single level string, test with nested
        const theme = { test: "value" };
        expect(tokens.resolveToken(theme, "test")).to.equal("value");
      });

      it("should resolve nested path", function () {
        expect(tokens.resolveToken(tokens.darkTheme, "feedback.success")).to.equal(
          tokens.palette.mint
        );
      });

      it("should resolve deeply nested path", function () {
        expect(tokens.resolveToken(tokens.darkTheme, "text.primary")).to.equal(
          tokens.palette.white
        );
      });

      it("should return null for invalid path", function () {
        expect(tokens.resolveToken(tokens.darkTheme, "nonexistent.path")).to.be
          .null;
      });

      it("should return null for partially valid path", function () {
        expect(tokens.resolveToken(tokens.darkTheme, "feedback.nonexistent")).to
          .be.null;
      });

      it("should return null for non-string values", function () {
        expect(tokens.resolveToken(tokens.darkTheme, "brand.gradient")).to.be
          .null;
      });
    });

    describe("strengthLabels", function () {
      it("should have all strength labels", function () {
        expect(tokens.strengthLabels.weak).to.equal("weak");
        expect(tokens.strengthLabels.medium).to.equal("medium");
        expect(tokens.strengthLabels.strong).to.equal("strong");
        expect(tokens.strengthLabels.maximum).to.equal("maximum");
      });
    });

    describe("default export", function () {
      it("should export all tokens and functions", function () {
        expect(tokens.default.palette).to.equal(tokens.palette);
        expect(tokens.default.darkTheme).to.equal(tokens.darkTheme);
        expect(tokens.default.lightTheme).to.equal(tokens.lightTheme);
        expect(tokens.default.highContrastTheme).to.equal(
          tokens.highContrastTheme
        );
        expect(tokens.default.getTheme).to.equal(tokens.getTheme);
        expect(tokens.default.resolveToken).to.equal(tokens.resolveToken);
        expect(tokens.default.strengthLabels).to.equal(tokens.strengthLabels);
      });
    });
  });
});
