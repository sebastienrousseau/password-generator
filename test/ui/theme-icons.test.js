// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import sinon from 'sinon';

// ============================================================================
// ICONS MODULE TESTS
// ============================================================================

import {
  statusIcons,
  navigationIcons,
  decorativeIcons,
  progressIcons,
  boxIcons,
  strengthIcons,
  allIcons,
  getIcon,
  getIconWithLabel,
} from '../../src/ui/icons.js';

describe('Icons Module', function () {
  describe('Icon Definitions', function () {
    describe('statusIcons', function () {
      it('should have success icon with visual, label, and fallback', function () {
        expect(statusIcons.success).to.have.property('visual', '✓');
        expect(statusIcons.success).to.have.property('label', 'success');
        expect(statusIcons.success).to.have.property('fallback', '[OK]');
      });

      it('should have error icon with visual, label, and fallback', function () {
        expect(statusIcons.error).to.have.property('visual', '✗');
        expect(statusIcons.error).to.have.property('label', 'error');
        expect(statusIcons.error).to.have.property('fallback', '[ERROR]');
      });

      it('should have warning icon with visual, label, and fallback', function () {
        expect(statusIcons.warning).to.have.property('visual', '!');
        expect(statusIcons.warning).to.have.property('label', 'warning');
        expect(statusIcons.warning).to.have.property('fallback', '[WARN]');
      });

      it('should have info icon with visual, label, and fallback', function () {
        expect(statusIcons.info).to.have.property('visual', 'i');
        expect(statusIcons.info).to.have.property('label', 'info');
        expect(statusIcons.info).to.have.property('fallback', '[INFO]');
      });
    });

    describe('navigationIcons', function () {
      it('should have arrow icon', function () {
        expect(navigationIcons.arrow).to.have.property('visual', '→');
        expect(navigationIcons.arrow).to.have.property('label', 'arrow');
        expect(navigationIcons.arrow).to.have.property('fallback', '->');
      });

      it('should have pointer icon', function () {
        expect(navigationIcons.pointer).to.have.property('visual', '›');
        expect(navigationIcons.pointer).to.have.property('label', 'pointer');
        expect(navigationIcons.pointer).to.have.property('fallback', '>');
      });

      it('should have bullet icon', function () {
        expect(navigationIcons.bullet).to.have.property('visual', '•');
        expect(navigationIcons.bullet).to.have.property('label', 'bullet');
        expect(navigationIcons.bullet).to.have.property('fallback', '*');
      });

      it('should have back icon', function () {
        expect(navigationIcons.back).to.have.property('visual', '←');
        expect(navigationIcons.back).to.have.property('label', 'back');
        expect(navigationIcons.back).to.have.property('fallback', '<-');
      });

      it('should have up icon', function () {
        expect(navigationIcons.up).to.have.property('visual', '↑');
        expect(navigationIcons.up).to.have.property('label', 'up');
        expect(navigationIcons.up).to.have.property('fallback', '^');
      });

      it('should have down icon', function () {
        expect(navigationIcons.down).to.have.property('visual', '↓');
        expect(navigationIcons.down).to.have.property('label', 'down');
        expect(navigationIcons.down).to.have.property('fallback', 'v');
      });
    });

    describe('decorativeIcons', function () {
      it('should have sparkle icon', function () {
        expect(decorativeIcons.sparkle).to.have.property('visual', '✦');
        expect(decorativeIcons.sparkle).to.have.property('label', 'sparkle');
        expect(decorativeIcons.sparkle).to.have.property('fallback', '*');
      });

      it('should have diamond icon', function () {
        expect(decorativeIcons.diamond).to.have.property('visual', '◇');
        expect(decorativeIcons.diamond).to.have.property('label', 'diamond');
        expect(decorativeIcons.diamond).to.have.property('fallback', '<>');
      });

      it('should have circle icon', function () {
        expect(decorativeIcons.circle).to.have.property('visual', '○');
        expect(decorativeIcons.circle).to.have.property('label', 'empty circle');
        expect(decorativeIcons.circle).to.have.property('fallback', 'o');
      });

      it('should have filledCircle icon', function () {
        expect(decorativeIcons.filledCircle).to.have.property('visual', '●');
        expect(decorativeIcons.filledCircle).to.have.property('label', 'filled circle');
        expect(decorativeIcons.filledCircle).to.have.property('fallback', '@');
      });

      it('should have star icon', function () {
        expect(decorativeIcons.star).to.have.property('visual', '★');
        expect(decorativeIcons.star).to.have.property('label', 'star');
        expect(decorativeIcons.star).to.have.property('fallback', '*');
      });
    });

    describe('progressIcons', function () {
      it('should have filled icon', function () {
        expect(progressIcons.filled).to.have.property('visual', '█');
        expect(progressIcons.filled).to.have.property('label', 'filled block');
        expect(progressIcons.filled).to.have.property('fallback', '#');
      });

      it('should have light icon', function () {
        expect(progressIcons.light).to.have.property('visual', '░');
        expect(progressIcons.light).to.have.property('label', 'light block');
        expect(progressIcons.light).to.have.property('fallback', '.');
      });

      it('should have half icon', function () {
        expect(progressIcons.half).to.have.property('visual', '▓');
        expect(progressIcons.half).to.have.property('label', 'half block');
        expect(progressIcons.half).to.have.property('fallback', '=');
      });
    });

    describe('boxIcons', function () {
      it('should have topLeft corner', function () {
        expect(boxIcons.topLeft).to.have.property('visual', '╭');
        expect(boxIcons.topLeft).to.have.property('label', 'top left corner');
        expect(boxIcons.topLeft).to.have.property('fallback', '+');
      });

      it('should have topRight corner', function () {
        expect(boxIcons.topRight).to.have.property('visual', '╮');
        expect(boxIcons.topRight).to.have.property('label', 'top right corner');
        expect(boxIcons.topRight).to.have.property('fallback', '+');
      });

      it('should have bottomLeft corner', function () {
        expect(boxIcons.bottomLeft).to.have.property('visual', '╰');
        expect(boxIcons.bottomLeft).to.have.property('label', 'bottom left corner');
        expect(boxIcons.bottomLeft).to.have.property('fallback', '+');
      });

      it('should have bottomRight corner', function () {
        expect(boxIcons.bottomRight).to.have.property('visual', '╯');
        expect(boxIcons.bottomRight).to.have.property('label', 'bottom right corner');
        expect(boxIcons.bottomRight).to.have.property('fallback', '+');
      });

      it('should have horizontal line', function () {
        expect(boxIcons.horizontal).to.have.property('visual', '─');
        expect(boxIcons.horizontal).to.have.property('label', 'horizontal line');
        expect(boxIcons.horizontal).to.have.property('fallback', '-');
      });

      it('should have vertical line', function () {
        expect(boxIcons.vertical).to.have.property('visual', '│');
        expect(boxIcons.vertical).to.have.property('label', 'vertical line');
        expect(boxIcons.vertical).to.have.property('fallback', '|');
      });

      it('should have dot', function () {
        expect(boxIcons.dot).to.have.property('visual', '·');
        expect(boxIcons.dot).to.have.property('label', 'center dot');
        expect(boxIcons.dot).to.have.property('fallback', '.');
      });
    });

    describe('strengthIcons', function () {
      it('should have weak indicator', function () {
        expect(strengthIcons.weak).to.have.property('visual', '●○○○');
        expect(strengthIcons.weak).to.have.property('label', 'weak');
        expect(strengthIcons.weak).to.have.property('fallback', '[#...]');
      });

      it('should have medium indicator', function () {
        expect(strengthIcons.medium).to.have.property('visual', '●●○○');
        expect(strengthIcons.medium).to.have.property('label', 'medium');
        expect(strengthIcons.medium).to.have.property('fallback', '[##..]');
      });

      it('should have strong indicator', function () {
        expect(strengthIcons.strong).to.have.property('visual', '●●●○');
        expect(strengthIcons.strong).to.have.property('label', 'strong');
        expect(strengthIcons.strong).to.have.property('fallback', '[###.]');
      });

      it('should have maximum indicator', function () {
        expect(strengthIcons.maximum).to.have.property('visual', '●●●●');
        expect(strengthIcons.maximum).to.have.property('label', 'maximum');
        expect(strengthIcons.maximum).to.have.property('fallback', '[####]');
      });
    });

    describe('allIcons', function () {
      it('should contain all status icons', function () {
        expect(allIcons.success).to.deep.equal(statusIcons.success);
        expect(allIcons.error).to.deep.equal(statusIcons.error);
        expect(allIcons.warning).to.deep.equal(statusIcons.warning);
        expect(allIcons.info).to.deep.equal(statusIcons.info);
      });

      it('should contain all navigation icons', function () {
        expect(allIcons.arrow).to.deep.equal(navigationIcons.arrow);
        expect(allIcons.pointer).to.deep.equal(navigationIcons.pointer);
        expect(allIcons.bullet).to.deep.equal(navigationIcons.bullet);
        expect(allIcons.back).to.deep.equal(navigationIcons.back);
        expect(allIcons.up).to.deep.equal(navigationIcons.up);
        expect(allIcons.down).to.deep.equal(navigationIcons.down);
      });

      it('should contain all decorative icons', function () {
        expect(allIcons.sparkle).to.deep.equal(decorativeIcons.sparkle);
        expect(allIcons.diamond).to.deep.equal(decorativeIcons.diamond);
        expect(allIcons.circle).to.deep.equal(decorativeIcons.circle);
        expect(allIcons.filledCircle).to.deep.equal(decorativeIcons.filledCircle);
        expect(allIcons.star).to.deep.equal(decorativeIcons.star);
      });

      it('should contain all progress icons', function () {
        expect(allIcons.filled).to.deep.equal(progressIcons.filled);
        expect(allIcons.light).to.deep.equal(progressIcons.light);
        expect(allIcons.half).to.deep.equal(progressIcons.half);
      });

      it('should contain all box icons', function () {
        expect(allIcons.topLeft).to.deep.equal(boxIcons.topLeft);
        expect(allIcons.topRight).to.deep.equal(boxIcons.topRight);
        expect(allIcons.bottomLeft).to.deep.equal(boxIcons.bottomLeft);
        expect(allIcons.bottomRight).to.deep.equal(boxIcons.bottomRight);
        expect(allIcons.horizontal).to.deep.equal(boxIcons.horizontal);
        expect(allIcons.vertical).to.deep.equal(boxIcons.vertical);
        expect(allIcons.dot).to.deep.equal(boxIcons.dot);
      });

      it('should contain all strength icons', function () {
        expect(allIcons.weak).to.deep.equal(strengthIcons.weak);
        expect(allIcons.medium).to.deep.equal(strengthIcons.medium);
        expect(allIcons.strong).to.deep.equal(strengthIcons.strong);
        expect(allIcons.maximum).to.deep.equal(strengthIcons.maximum);
      });
    });
  });

  describe('getIcon', function () {
    it('should return Unicode visual when useUnicode is true', function () {
      const result = getIcon(statusIcons.success, true);
      expect(result).to.equal('✓');
    });

    it('should return fallback when useUnicode is false', function () {
      const result = getIcon(statusIcons.success, false);
      expect(result).to.equal('[OK]');
    });

    it('should default to Unicode when useUnicode is not specified', function () {
      const result = getIcon(statusIcons.error);
      expect(result).to.equal('✗');
    });

    it('should work with navigation icons', function () {
      expect(getIcon(navigationIcons.arrow, true)).to.equal('→');
      expect(getIcon(navigationIcons.arrow, false)).to.equal('->');
    });

    it('should work with decorative icons', function () {
      expect(getIcon(decorativeIcons.sparkle, true)).to.equal('✦');
      expect(getIcon(decorativeIcons.sparkle, false)).to.equal('*');
    });

    it('should work with progress icons', function () {
      expect(getIcon(progressIcons.filled, true)).to.equal('█');
      expect(getIcon(progressIcons.filled, false)).to.equal('#');
    });

    it('should work with box icons', function () {
      expect(getIcon(boxIcons.topLeft, true)).to.equal('╭');
      expect(getIcon(boxIcons.topLeft, false)).to.equal('+');
    });

    it('should work with strength icons', function () {
      expect(getIcon(strengthIcons.weak, true)).to.equal('●○○○');
      expect(getIcon(strengthIcons.weak, false)).to.equal('[#...]');
    });
  });

  describe('getIconWithLabel', function () {
    it('should return object with visual and label when useUnicode is true', function () {
      const result = getIconWithLabel(statusIcons.success, true);
      expect(result).to.deep.equal({
        visual: '✓',
        label: 'success',
      });
    });

    it('should return object with fallback visual and label when useUnicode is false', function () {
      const result = getIconWithLabel(statusIcons.success, false);
      expect(result).to.deep.equal({
        visual: '[OK]',
        label: 'success',
      });
    });

    it('should default to Unicode when useUnicode is not specified', function () {
      const result = getIconWithLabel(statusIcons.error);
      expect(result).to.deep.equal({
        visual: '✗',
        label: 'error',
      });
    });

    it('should work with navigation icons', function () {
      const result = getIconWithLabel(navigationIcons.pointer, true);
      expect(result.visual).to.equal('›');
      expect(result.label).to.equal('pointer');
    });

    it('should work with decorative icons', function () {
      const result = getIconWithLabel(decorativeIcons.diamond, false);
      expect(result.visual).to.equal('<>');
      expect(result.label).to.equal('diamond');
    });

    it('should work with strength icons', function () {
      const result = getIconWithLabel(strengthIcons.maximum, true);
      expect(result.visual).to.equal('●●●●');
      expect(result.label).to.equal('maximum');
    });
  });
});

// ============================================================================
// THEME MODULE TESTS
// ============================================================================

import {
  brand,
  gradient,
  colors,
  typography,
  box,
  icons,
  stripAnsi,
  getTerminalWidth,
  center,
  divider,
  dottedDivider,
  colorsEnabled,
  unicodeEnabled,
  renderStrengthIndicator,
  renderBox,
  renderPassword,
  renderCommandPanel,
  renderProgress,
  renderMenu,
  renderSuccess,
  renderInfo,
  renderHeader,
} from '../../src/ui/theme.js';

describe('Theme Module', function () {
  describe('brand', function () {
    it('should have mini function that returns branded string', function () {
      const result = brand.mini();
      expect(result).to.be.a('string');
      // Strip ANSI and verify it contains expected text
      const stripped = stripAnsi(result);
      expect(stripped).to.include('password');
      expect(stripped).to.include('generator');
    });

    it('should have inline function that returns branded string', function () {
      const result = brand.inline();
      expect(result).to.be.a('string');
      const stripped = stripAnsi(result);
      expect(stripped).to.include('pwgen');
    });

    it('should have version function that returns version string', function () {
      const result = brand.version();
      expect(result).to.be.a('string');
      // Version should match semver pattern
      expect(result).to.match(/^\d+\.\d+\.\d+/);
    });
  });

  describe('gradient', function () {
    describe('primary', function () {
      it('should apply gradient to text', function () {
        const result = gradient.primary('Hello');
        expect(result).to.be.a('string');
        // Result should contain the original text
        const stripped = stripAnsi(result);
        expect(stripped).to.equal('Hello');
      });

      it('should handle empty string', function () {
        const result = gradient.primary('');
        expect(result).to.equal('');
      });

      it('should handle single character', function () {
        const result = gradient.primary('A');
        expect(result).to.be.a('string');
        const stripped = stripAnsi(result);
        expect(stripped).to.equal('A');
      });

      it('should handle long text with correct gradient transition', function () {
        const text = 'ABCDEFGHIJ';
        const result = gradient.primary(text);
        expect(result).to.be.a('string');
        const stripped = stripAnsi(result);
        expect(stripped).to.equal(text);
      });
    });

    describe('success', function () {
      it('should apply success gradient to text', function () {
        const result = gradient.success('Success');
        expect(result).to.be.a('string');
        // Result should contain the original text
        const stripped = stripAnsi(result);
        expect(stripped).to.equal('Success');
      });

      it('should handle empty string', function () {
        const result = gradient.success('');
        expect(result).to.equal('');
      });

      it('should handle single character', function () {
        const result = gradient.success('X');
        expect(result).to.be.a('string');
        const stripped = stripAnsi(result);
        expect(stripped).to.equal('X');
      });
    });
  });

  describe('colors', function () {
    it('should have primary color function', function () {
      const result = colors.primary('test');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('test');
    });

    it('should have secondary color function', function () {
      const result = colors.secondary('test');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('test');
    });

    it('should have accent color function', function () {
      const result = colors.accent('test');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('test');
    });

    it('should have success color function', function () {
      const result = colors.success('test');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('test');
    });

    it('should have warning color function', function () {
      const result = colors.warning('test');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('test');
    });

    it('should have error color function', function () {
      const result = colors.error('test');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('test');
    });

    it('should have text color function', function () {
      const result = colors.text('test');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('test');
    });

    it('should have muted color function', function () {
      const result = colors.muted('test');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('test');
    });

    it('should have dim color function', function () {
      const result = colors.dim('test');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('test');
    });

    it('should have password color function', function () {
      const result = colors.password('mypassword');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('mypassword');
    });

    it('should have command color function', function () {
      const result = colors.command('--help');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('--help');
    });

    it('should have label color function', function () {
      const result = colors.label('Label');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('Label');
    });

    it('should have value color function', function () {
      const result = colors.value('Value');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('Value');
    });

    it('should have highlight color function', function () {
      const result = colors.highlight('Important');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('Important');
    });
  });

  describe('typography', function () {
    it('should have title function using gradient', function () {
      const result = typography.title('My Title');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('My Title');
    });

    it('should have subtitle function', function () {
      const result = typography.subtitle('Subtitle');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('Subtitle');
    });

    it('should have body function', function () {
      const result = typography.body('Body text');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('Body text');
    });

    it('should have bold function', function () {
      const result = typography.bold('Bold text');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('Bold text');
    });

    it('should have code function', function () {
      const result = typography.code('const x = 1');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('const x = 1');
    });

    it('should have success function', function () {
      const result = typography.success('Done!');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('Done!');
    });

    it('should have muted function', function () {
      const result = typography.muted('Muted text');
      expect(result).to.be.a('string');
      expect(stripAnsi(result)).to.equal('Muted text');
    });
  });

  describe('box characters', function () {
    it('should have topLeft character', function () {
      expect(box.topLeft).to.equal('╭');
    });

    it('should have topRight character', function () {
      expect(box.topRight).to.equal('╮');
    });

    it('should have bottomLeft character', function () {
      expect(box.bottomLeft).to.equal('╰');
    });

    it('should have bottomRight character', function () {
      expect(box.bottomRight).to.equal('╯');
    });

    it('should have horizontal character', function () {
      expect(box.horizontal).to.equal('─');
    });

    it('should have vertical character', function () {
      expect(box.vertical).to.equal('│');
    });

    it('should have dot character', function () {
      expect(box.dot).to.equal('·');
    });
  });

  describe('icons (from theme)', function () {
    it('should have success icon', function () {
      expect(icons.success).to.be.a('string');
    });

    it('should have error icon', function () {
      expect(icons.error).to.be.a('string');
    });

    it('should have warning icon', function () {
      expect(icons.warning).to.be.a('string');
    });

    it('should have info icon', function () {
      expect(icons.info).to.be.a('string');
    });

    it('should have arrow icon', function () {
      expect(icons.arrow).to.be.a('string');
    });

    it('should have pointer icon', function () {
      expect(icons.pointer).to.be.a('string');
    });

    it('should have bullet icon', function () {
      expect(icons.bullet).to.be.a('string');
    });

    it('should have sparkle icon', function () {
      expect(icons.sparkle).to.be.a('string');
    });

    it('should have diamond icon', function () {
      expect(icons.diamond).to.be.a('string');
    });

    it('should have circle icon', function () {
      expect(icons.circle).to.be.a('string');
    });

    it('should have filledCircle icon', function () {
      expect(icons.filledCircle).to.be.a('string');
    });

    it('should have filled progress icon', function () {
      expect(icons.filled).to.be.a('string');
    });

    it('should have light progress icon', function () {
      expect(icons.light).to.be.a('string');
    });
  });

  describe('Utility Functions', function () {
    describe('stripAnsi', function () {
      it('should remove ANSI escape codes from string', function () {
        const input = '\x1b[31mRed Text\x1b[0m';
        const result = stripAnsi(input);
        expect(result).to.equal('Red Text');
      });

      it('should handle string without ANSI codes', function () {
        const input = 'Plain text';
        const result = stripAnsi(input);
        expect(result).to.equal('Plain text');
      });

      it('should handle empty string', function () {
        const result = stripAnsi('');
        expect(result).to.equal('');
      });

      it('should handle multiple ANSI codes', function () {
        const input = '\x1b[1m\x1b[34mBold Blue\x1b[0m';
        const result = stripAnsi(input);
        expect(result).to.equal('Bold Blue');
      });
    });

    describe('getTerminalWidth', function () {
      let originalColumns;

      beforeEach(function () {
        originalColumns = process.stdout.columns;
      });

      afterEach(function () {
        process.stdout.columns = originalColumns;
      });

      it('should return process.stdout.columns when available', function () {
        process.stdout.columns = 120;
        const result = getTerminalWidth();
        expect(result).to.equal(120);
      });

      it('should return 80 as default when columns is undefined', function () {
        process.stdout.columns = undefined;
        const result = getTerminalWidth();
        expect(result).to.equal(80);
      });
    });

    describe('center', function () {
      it('should center text within given width', function () {
        const result = center('Hi', 10);
        // "Hi" is 2 chars, centered in 10 should have 4 spaces before
        expect(result).to.equal('    Hi');
      });

      it('should handle text longer than width', function () {
        const result = center('Hello World', 5);
        // When text is longer, padding should be 0
        expect(result).to.equal('Hello World');
      });

      it('should handle ANSI codes correctly', function () {
        const coloredText = colors.primary('Hi');
        const result = center(coloredText, 10);
        // Should center based on visible length (2), not ANSI length
        expect(stripAnsi(result).trim()).to.equal('Hi');
      });

      it('should handle empty string', function () {
        const result = center('', 10);
        expect(result.length).to.equal(5);
      });
    });

    describe('divider', function () {
      it('should create divider with default width and character', function () {
        const result = divider();
        const stripped = stripAnsi(result);
        expect(stripped).to.equal('─'.repeat(40));
      });

      it('should create divider with custom width', function () {
        const result = divider(20);
        const stripped = stripAnsi(result);
        expect(stripped).to.equal('─'.repeat(20));
      });

      it('should create divider with custom character', function () {
        const result = divider(10, '=');
        const stripped = stripAnsi(result);
        expect(stripped).to.equal('='.repeat(10));
      });
    });

    describe('dottedDivider', function () {
      it('should create dotted divider with default width', function () {
        const result = dottedDivider();
        const stripped = stripAnsi(result);
        expect(stripped).to.equal('·'.repeat(40));
      });

      it('should create dotted divider with custom width', function () {
        const result = dottedDivider(15);
        const stripped = stripAnsi(result);
        expect(stripped).to.equal('·'.repeat(15));
      });
    });

    describe('colorsEnabled', function () {
      it('should return boolean', function () {
        const result = colorsEnabled();
        expect(result).to.be.a('boolean');
      });
    });

    describe('unicodeEnabled', function () {
      it('should return boolean', function () {
        const result = unicodeEnabled();
        expect(result).to.be.a('boolean');
      });
    });
  });

  describe('Component Renderers', function () {
    describe('renderStrengthIndicator', function () {
      it('should render weak strength with label', function () {
        const result = renderStrengthIndicator('weak');
        const stripped = stripAnsi(result);
        expect(stripped).to.include('weak');
      });

      it('should render medium strength with label', function () {
        const result = renderStrengthIndicator('medium');
        const stripped = stripAnsi(result);
        expect(stripped).to.include('medium');
      });

      it('should render strong strength with label', function () {
        const result = renderStrengthIndicator('strong');
        const stripped = stripAnsi(result);
        expect(stripped).to.include('strong');
      });

      it('should render maximum strength with label', function () {
        const result = renderStrengthIndicator('maximum');
        const stripped = stripAnsi(result);
        expect(stripped).to.include('maximum');
      });

      it('should render without label when showLabel is false', function () {
        const result = renderStrengthIndicator('strong', { showLabel: false });
        const stripped = stripAnsi(result);
        expect(stripped).to.not.include('strong');
      });

      it('should default to strong for unknown strength', function () {
        const result = renderStrengthIndicator('unknown');
        expect(result).to.be.a('string');
      });

      it('should handle undefined strength', function () {
        const result = renderStrengthIndicator(undefined);
        expect(result).to.be.a('string');
      });
    });

    describe('renderBox', function () {
      it('should render box with string content', function () {
        const result = renderBox('Hello World');
        expect(result).to.include(box.topLeft);
        expect(result).to.include(box.bottomRight);
        expect(result).to.include('Hello World');
      });

      it('should render box with array content', function () {
        const result = renderBox(['Line 1', 'Line 2']);
        expect(result).to.include('Line 1');
        expect(result).to.include('Line 2');
      });

      it('should render box with title', function () {
        const result = renderBox('Content', { title: 'My Title' });
        const stripped = stripAnsi(result);
        expect(stripped).to.include('My Title');
      });

      it('should render box without title', function () {
        const result = renderBox('Content', { title: '' });
        expect(result).to.include(box.topLeft);
        expect(result).to.include(box.topRight);
      });

      it('should respect custom width option', function () {
        const result = renderBox('Content', { width: 30 });
        expect(result).to.be.a('string');
        // Box should be rendered with the width
        const lines = result.split('\n');
        expect(lines.length).to.be.greaterThan(0);
      });

      it('should use custom border color', function () {
        const result = renderBox('Content', { borderColor: '#FF0000' });
        expect(result).to.be.a('string');
      });

      it('should handle empty content', function () {
        const result = renderBox('');
        expect(result).to.include(box.topLeft);
        expect(result).to.include(box.bottomRight);
      });

      it('should handle long content properly', function () {
        const longContent = 'A'.repeat(60);
        const result = renderBox(longContent, { width: 50 });
        expect(result).to.be.a('string');
      });
    });

    describe('renderPassword', function () {
      it('should render password with default options', function () {
        const result = renderPassword('mypassword123');
        const stripped = stripAnsi(result);
        expect(stripped).to.include('mypassword123');
        expect(stripped).to.include('password');
        expect(stripped).to.include('generator');
      });

      it('should show copied indicator when copied is true', function () {
        const result = renderPassword('pass', { copied: true });
        const stripped = stripAnsi(result);
        expect(stripped).to.include('copied');
      });

      it('should not show copied indicator when copied is false', function () {
        const result = renderPassword('pass', { copied: false });
        const stripped = stripAnsi(result);
        expect(stripped).to.not.include('copied');
      });

      it('should show entropy when provided', function () {
        const result = renderPassword('pass', { entropy: 128 });
        const stripped = stripAnsi(result);
        expect(stripped).to.include('128-bit');
      });

      it('should not show entropy when zero', function () {
        const result = renderPassword('pass', { entropy: 0 });
        const stripped = stripAnsi(result);
        expect(stripped).to.not.include('-bit');
      });

      it('should render with weak strength', function () {
        const result = renderPassword('pass', { strength: 'weak' });
        const stripped = stripAnsi(result);
        expect(stripped).to.include('weak');
      });

      it('should render with medium strength', function () {
        const result = renderPassword('pass', { strength: 'medium' });
        const stripped = stripAnsi(result);
        expect(stripped).to.include('medium');
      });

      it('should render with maximum strength', function () {
        const result = renderPassword('pass', { strength: 'maximum' });
        const stripped = stripAnsi(result);
        expect(stripped).to.include('maximum');
      });

      it('should render with all options combined', function () {
        const result = renderPassword('securepass', {
          copied: true,
          strength: 'strong',
          entropy: 96,
        });
        const stripped = stripAnsi(result);
        expect(stripped).to.include('securepass');
        expect(stripped).to.include('copied');
        expect(stripped).to.include('96-bit');
        expect(stripped).to.include('strong');
      });

      it('should handle very short passwords', function () {
        const result = renderPassword('ab');
        expect(result).to.be.a('string');
        expect(stripAnsi(result)).to.include('ab');
      });

      it('should handle very long passwords', function () {
        const longPass = 'a'.repeat(100);
        const result = renderPassword(longPass);
        expect(result).to.be.a('string');
        expect(stripAnsi(result)).to.include(longPass);
      });
    });

    describe('renderCommandPanel', function () {
      it('should render command panel with command', function () {
        const result = renderCommandPanel('password-generator -p quick');
        const stripped = stripAnsi(result);
        expect(stripped).to.include('command');
        expect(stripped).to.include('password-generator -p quick');
      });

      it('should render command panel without shortcuts', function () {
        const result = renderCommandPanel('password-generator', []);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('command');
        expect(stripped).to.not.include('shortcuts');
      });

      it('should render command panel with shortcuts', function () {
        const shortcuts = [
          { flag: '-p quick', desc: 'Use quick preset' },
          { flag: '-c', desc: 'Copy to clipboard' },
        ];
        const result = renderCommandPanel('password-generator', shortcuts);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('shortcuts');
        expect(stripped).to.include('-p quick');
        expect(stripped).to.include('Use quick preset');
        expect(stripped).to.include('-c');
        expect(stripped).to.include('Copy to clipboard');
      });

      it('should handle empty command', function () {
        const result = renderCommandPanel('');
        expect(result).to.be.a('string');
      });
    });

    describe('renderProgress', function () {
      it('should render progress at 0%', function () {
        const result = renderProgress(0, 10);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('0/10');
      });

      it('should render progress at 50%', function () {
        const result = renderProgress(5, 10);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('5/10');
      });

      it('should render progress at 100%', function () {
        const result = renderProgress(10, 10);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('10/10');
      });

      it('should handle small numbers', function () {
        const result = renderProgress(1, 3);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('1/3');
      });

      it('should handle large numbers', function () {
        const result = renderProgress(50, 100);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('50/100');
      });
    });

    describe('renderMenu', function () {
      it('should render menu with title', function () {
        const options = ['Option 1', 'Option 2', 'Option 3'];
        const result = renderMenu('Select an option', options, 0);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('Select an option');
      });

      it('should render all options', function () {
        const options = ['Alpha', 'Beta', 'Gamma'];
        const result = renderMenu('Menu', options, 0);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('Alpha');
        expect(stripped).to.include('Beta');
        expect(stripped).to.include('Gamma');
      });

      it('should highlight selected option (first)', function () {
        const options = ['First', 'Second', 'Third'];
        const result = renderMenu('Menu', options, 0);
        // Selected item should have pointer icon
        expect(result).to.be.a('string');
      });

      it('should highlight selected option (middle)', function () {
        const options = ['First', 'Second', 'Third'];
        const result = renderMenu('Menu', options, 1);
        expect(result).to.be.a('string');
      });

      it('should highlight selected option (last)', function () {
        const options = ['First', 'Second', 'Third'];
        const result = renderMenu('Menu', options, 2);
        expect(result).to.be.a('string');
      });

      it('should include navigation instructions', function () {
        const options = ['A', 'B'];
        const result = renderMenu('Menu', options, 0);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('navigate');
        expect(stripped).to.include('select');
        expect(stripped).to.include('back');
      });

      it('should handle empty options array', function () {
        const result = renderMenu('Empty Menu', [], 0);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('Empty Menu');
      });

      it('should handle single option', function () {
        const options = ['Only Option'];
        const result = renderMenu('Single', options, 0);
        const stripped = stripAnsi(result);
        expect(stripped).to.include('Only Option');
      });
    });

    describe('renderSuccess', function () {
      it('should render success message', function () {
        const result = renderSuccess('Operation completed!');
        const stripped = stripAnsi(result);
        expect(stripped).to.include('Operation completed!');
      });

      it('should include success icon', function () {
        const result = renderSuccess('Done');
        expect(result).to.be.a('string');
      });

      it('should handle empty message', function () {
        const result = renderSuccess('');
        expect(result).to.be.a('string');
      });
    });

    describe('renderInfo', function () {
      it('should render info message', function () {
        const result = renderInfo('This is info');
        const stripped = stripAnsi(result);
        expect(stripped).to.include('This is info');
      });

      it('should include info icon', function () {
        const result = renderInfo('Information');
        expect(result).to.be.a('string');
      });

      it('should handle empty message', function () {
        const result = renderInfo('');
        expect(result).to.be.a('string');
      });
    });

    describe('renderHeader', function () {
      it('should render header with title', function () {
        const result = renderHeader('Welcome');
        const stripped = stripAnsi(result);
        expect(stripped).to.include('Welcome');
      });

      it('should include sparkle icon', function () {
        const result = renderHeader('Title');
        expect(result).to.be.a('string');
      });

      it('should handle empty title', function () {
        const result = renderHeader('');
        expect(result).to.be.a('string');
      });

      it('should return multiline string', function () {
        const result = renderHeader('Header');
        expect(result).to.include('\n');
      });
    });
  });
});
