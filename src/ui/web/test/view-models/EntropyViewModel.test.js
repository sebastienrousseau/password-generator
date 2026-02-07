// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { EntropyViewModel } from '../../view-models/EntropyViewModel.js';

describe('EntropyViewModel', () => {
  describe('constructor', () => {
    it('should create EntropyViewModel with provided data', () => {
      const entropyInfo = {
        totalBits: 128,
        perUnit: 32,
        securityLevel: 'STRONG',
        recommendation: 'Excellent for all purposes',
      };

      const vm = new EntropyViewModel(entropyInfo);

      expect(vm.totalBits).to.equal(128);
      expect(vm.perUnit).to.equal(32);
      expect(vm.securityLevel).to.equal('STRONG');
      expect(vm.recommendation).to.equal('Excellent for all purposes');
    });

    it('should handle missing optional fields with defaults', () => {
      const entropyInfo = { totalBits: 64 };

      const vm = new EntropyViewModel(entropyInfo);

      expect(vm.totalBits).to.equal(64);
      expect(vm.perUnit).to.equal(0);
      expect(vm.securityLevel).to.equal('unknown');
      expect(vm.recommendation).to.equal('');
    });

    it('should handle completely empty object', () => {
      const vm = new EntropyViewModel({});

      expect(vm.totalBits).to.equal(0);
      expect(vm.perUnit).to.equal(0);
      expect(vm.securityLevel).to.equal('unknown');
      expect(vm.recommendation).to.equal('');
    });

    it('should calculate displayBits as rounded value', () => {
      const vm = new EntropyViewModel({ totalBits: 51.7 });

      expect(vm.displayBits).to.equal(52);
    });

    it('should round displayBits correctly', () => {
      expect(new EntropyViewModel({ totalBits: 51.4 }).displayBits).to.equal(51);
      expect(new EntropyViewModel({ totalBits: 51.5 }).displayBits).to.equal(52);
      expect(new EntropyViewModel({ totalBits: 51.6 }).displayBits).to.equal(52);
    });
  });

  describe('strength percentage calculation', () => {
    it('should calculate 50% for 128 bits', () => {
      const vm = new EntropyViewModel({ totalBits: 128 });

      expect(vm.strengthPercentage).to.equal(50);
    });

    it('should calculate 100% for 256 bits', () => {
      const vm = new EntropyViewModel({ totalBits: 256 });

      expect(vm.strengthPercentage).to.equal(100);
    });

    it('should cap at 100% for values above 256 bits', () => {
      const vm = new EntropyViewModel({ totalBits: 512 });

      expect(vm.strengthPercentage).to.equal(100);
    });

    it('should calculate 0% for 0 bits', () => {
      const vm = new EntropyViewModel({ totalBits: 0 });

      expect(vm.strengthPercentage).to.equal(0);
    });

    it('should calculate 25% for 64 bits', () => {
      const vm = new EntropyViewModel({ totalBits: 64 });

      expect(vm.strengthPercentage).to.equal(25);
    });

    it('should round percentage to nearest integer', () => {
      const vm = new EntropyViewModel({ totalBits: 100 });

      // 100/256 * 100 = 39.0625, rounds to 39
      expect(vm.strengthPercentage).to.equal(39);
    });
  });

  describe('strength label mapping', () => {
    it("should return 'Excellent' for 256+ bits", () => {
      const vm = new EntropyViewModel({ totalBits: 256 });

      expect(vm.strengthLabel).to.equal('Excellent');
    });

    it("should return 'Strong' for 128-255 bits", () => {
      const vm128 = new EntropyViewModel({ totalBits: 128 });
      const vm200 = new EntropyViewModel({ totalBits: 200 });

      expect(vm128.strengthLabel).to.equal('Strong');
      expect(vm200.strengthLabel).to.equal('Strong');
    });

    it("should return 'Good' for 80-127 bits", () => {
      const vm80 = new EntropyViewModel({ totalBits: 80 });
      const vm100 = new EntropyViewModel({ totalBits: 100 });

      expect(vm80.strengthLabel).to.equal('Good');
      expect(vm100.strengthLabel).to.equal('Good');
    });

    it("should return 'Moderate' for 64-79 bits", () => {
      const vm64 = new EntropyViewModel({ totalBits: 64 });
      const vm75 = new EntropyViewModel({ totalBits: 75 });

      expect(vm64.strengthLabel).to.equal('Moderate');
      expect(vm75.strengthLabel).to.equal('Moderate');
    });

    it("should return 'Weak' for 40-63 bits", () => {
      const vm40 = new EntropyViewModel({ totalBits: 40 });
      const vm60 = new EntropyViewModel({ totalBits: 60 });

      expect(vm40.strengthLabel).to.equal('Weak');
      expect(vm60.strengthLabel).to.equal('Weak');
    });

    it("should return 'Very Weak' for below 40 bits", () => {
      const vm0 = new EntropyViewModel({ totalBits: 0 });
      const vm30 = new EntropyViewModel({ totalBits: 30 });
      const vm39 = new EntropyViewModel({ totalBits: 39 });

      expect(vm0.strengthLabel).to.equal('Very Weak');
      expect(vm30.strengthLabel).to.equal('Very Weak');
      expect(vm39.strengthLabel).to.equal('Very Weak');
    });
  });

  describe('strength color mapping', () => {
    it("should return 'green' for 128+ bits", () => {
      const vm128 = new EntropyViewModel({ totalBits: 128 });
      const vm256 = new EntropyViewModel({ totalBits: 256 });

      expect(vm128.strengthColor).to.equal('green');
      expect(vm256.strengthColor).to.equal('green');
    });

    it("should return 'blue' for 80-127 bits", () => {
      const vm80 = new EntropyViewModel({ totalBits: 80 });
      const vm120 = new EntropyViewModel({ totalBits: 120 });

      expect(vm80.strengthColor).to.equal('blue');
      expect(vm120.strengthColor).to.equal('blue');
    });

    it("should return 'yellow' for 64-79 bits", () => {
      const vm64 = new EntropyViewModel({ totalBits: 64 });
      const vm75 = new EntropyViewModel({ totalBits: 75 });

      expect(vm64.strengthColor).to.equal('yellow');
      expect(vm75.strengthColor).to.equal('yellow');
    });

    it("should return 'orange' for 40-63 bits", () => {
      const vm40 = new EntropyViewModel({ totalBits: 40 });
      const vm60 = new EntropyViewModel({ totalBits: 60 });

      expect(vm40.strengthColor).to.equal('orange');
      expect(vm60.strengthColor).to.equal('orange');
    });

    it("should return 'red' for below 40 bits", () => {
      const vm0 = new EntropyViewModel({ totalBits: 0 });
      const vm30 = new EntropyViewModel({ totalBits: 30 });

      expect(vm0.strengthColor).to.equal('red');
      expect(vm30.strengthColor).to.equal('red');
    });
  });

  describe('progressBarWidth', () => {
    it('should return percentage string for progress bar', () => {
      const vm = new EntropyViewModel({ totalBits: 128 });

      expect(vm.progressBarWidth).to.equal('50%');
    });

    it('should cap at 100%', () => {
      const vm = new EntropyViewModel({ totalBits: 512 });

      expect(vm.progressBarWidth).to.equal('100%');
    });

    it('should return 0% for zero bits', () => {
      const vm = new EntropyViewModel({ totalBits: 0 });

      expect(vm.progressBarWidth).to.equal('0%');
    });
  });

  describe('fromEntropyInfo', () => {
    it('should create EntropyViewModel from entropy info', () => {
      const entropyInfo = {
        totalBits: 96,
        perUnit: 24,
        securityLevel: 'GOOD',
        recommendation: 'Suitable for most uses',
      };

      const vm = EntropyViewModel.fromEntropyInfo(entropyInfo);

      expect(vm).to.be.instanceOf(EntropyViewModel);
      expect(vm.totalBits).to.equal(96);
      expect(vm.perUnit).to.equal(24);
    });
  });

  describe('getDisplayString', () => {
    it('should format display string correctly', () => {
      const vm = new EntropyViewModel({ totalBits: 128 });

      expect(vm.getDisplayString()).to.equal('128-bit · Strong');
    });

    it('should use rounded display bits', () => {
      const vm = new EntropyViewModel({ totalBits: 51.7 });

      expect(vm.getDisplayString()).to.equal('52-bit · Weak');
    });

    it('should handle zero bits', () => {
      const vm = new EntropyViewModel({ totalBits: 0 });

      expect(vm.getDisplayString()).to.equal('0-bit · Very Weak');
    });

    it('should handle high entropy', () => {
      const vm = new EntropyViewModel({ totalBits: 384 });

      expect(vm.getDisplayString()).to.equal('384-bit · Excellent');
    });
  });

  describe('getAriaLabel', () => {
    it('should return accessible description', () => {
      const vm = new EntropyViewModel({ totalBits: 128 });

      expect(vm.getAriaLabel()).to.equal('Password strength: Strong with 128 bits of entropy');
    });

    it('should use rounded bits in label', () => {
      const vm = new EntropyViewModel({ totalBits: 51.7 });

      expect(vm.getAriaLabel()).to.equal('Password strength: Weak with 52 bits of entropy');
    });

    it('should handle zero bits', () => {
      const vm = new EntropyViewModel({ totalBits: 0 });

      expect(vm.getAriaLabel()).to.equal('Password strength: Very Weak with 0 bits of entropy');
    });
  });

  describe('toJSON', () => {
    it('should convert to plain object', () => {
      const entropyInfo = {
        totalBits: 96,
        securityLevel: 'GOOD',
        recommendation: 'Suitable for most uses',
      };

      const vm = new EntropyViewModel(entropyInfo);
      const json = vm.toJSON();

      expect(json).to.deep.equal({
        totalBits: 96,
        displayBits: 96,
        securityLevel: 'GOOD',
        strengthLabel: 'Good',
        strengthColor: 'blue',
        strengthPercentage: 38,
        recommendation: 'Suitable for most uses',
      });
    });

    it('should be serializable to JSON string', () => {
      const vm = new EntropyViewModel({ totalBits: 128 });

      const jsonString = JSON.stringify(vm.toJSON());
      const parsed = JSON.parse(jsonString);

      expect(parsed.totalBits).to.equal(128);
      expect(parsed.displayBits).to.equal(128);
      expect(parsed.strengthLabel).to.equal('Strong');
    });

    it('should not include non-serializable properties', () => {
      const vm = new EntropyViewModel({ totalBits: 64 });
      const json = vm.toJSON();

      // Should only include the expected fields
      const expectedKeys = [
        'totalBits',
        'displayBits',
        'securityLevel',
        'strengthLabel',
        'strengthColor',
        'strengthPercentage',
        'recommendation',
      ];

      expect(Object.keys(json).sort()).to.deep.equal(expectedKeys.sort());
    });
  });

  describe('boundary values', () => {
    it('should handle boundary at 40 bits', () => {
      const below = new EntropyViewModel({ totalBits: 39 });
      const at = new EntropyViewModel({ totalBits: 40 });

      expect(below.strengthLabel).to.equal('Very Weak');
      expect(at.strengthLabel).to.equal('Weak');
    });

    it('should handle boundary at 64 bits', () => {
      const below = new EntropyViewModel({ totalBits: 63 });
      const at = new EntropyViewModel({ totalBits: 64 });

      expect(below.strengthLabel).to.equal('Weak');
      expect(at.strengthLabel).to.equal('Moderate');
    });

    it('should handle boundary at 80 bits', () => {
      const below = new EntropyViewModel({ totalBits: 79 });
      const at = new EntropyViewModel({ totalBits: 80 });

      expect(below.strengthLabel).to.equal('Moderate');
      expect(at.strengthLabel).to.equal('Good');
    });

    it('should handle boundary at 128 bits', () => {
      const below = new EntropyViewModel({ totalBits: 127 });
      const at = new EntropyViewModel({ totalBits: 128 });

      expect(below.strengthLabel).to.equal('Good');
      expect(at.strengthLabel).to.equal('Strong');
    });

    it('should handle boundary at 256 bits', () => {
      const below = new EntropyViewModel({ totalBits: 255 });
      const at = new EntropyViewModel({ totalBits: 256 });

      expect(below.strengthLabel).to.equal('Strong');
      expect(at.strengthLabel).to.equal('Excellent');
    });
  });
});
