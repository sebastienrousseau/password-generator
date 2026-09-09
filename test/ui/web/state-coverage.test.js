// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';

// Import from the index.js to test the exports
import { FormState, StateToCoreMapper } from '../../../src/ui/web/state/index.js';

// Also import directly to verify modules work independently
import { FormState as DirectFormState } from '../../../src/ui/web/state/FormState.js';
import { StateToCoreMapper as DirectStateToCoreMapper } from '../../../src/ui/web/state/StateToCoreMapper.js';

describe('UI Web State Layer', function () {
  describe('index.js exports', function () {
    it('should export FormState class', function () {
      expect(FormState).to.be.a('function');
      expect(FormState.name).to.equal('FormState');
    });

    it('should export StateToCoreMapper class', function () {
      expect(StateToCoreMapper).to.be.a('function');
      expect(StateToCoreMapper.name).to.equal('StateToCoreMapper');
    });

    it('should export the same classes as direct imports', function () {
      expect(FormState).to.equal(DirectFormState);
      expect(StateToCoreMapper).to.equal(DirectStateToCoreMapper);
    });
  });

  describe('FormState', function () {
    describe('constructor', function () {
      it('should create FormState with default values when no data provided', function () {
        const state = new FormState();

        expect(state.type).to.equal('');
        expect(state.length).to.equal('');
        expect(state.iteration).to.equal('');
        expect(state.separator).to.equal('-');
        expect(state.preset).to.be.null;
        expect(state.copyToClipboard).to.be.false;
        expect(state.showPassword).to.be.true;
      });

      it('should create FormState with empty object', function () {
        const state = new FormState({});

        expect(state.type).to.equal('');
        expect(state.length).to.equal('');
        expect(state.iteration).to.equal('');
        expect(state.separator).to.equal('-');
        expect(state.preset).to.be.null;
        expect(state.copyToClipboard).to.be.false;
        expect(state.showPassword).to.be.true;
      });

      it('should create FormState with provided values', function () {
        const state = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '+',
          preset: 'secure',
          copyToClipboard: true,
          showPassword: false,
        });

        expect(state.type).to.equal('strong');
        expect(state.length).to.equal('16');
        expect(state.iteration).to.equal('4');
        expect(state.separator).to.equal('+');
        expect(state.preset).to.equal('secure');
        expect(state.copyToClipboard).to.be.true;
        expect(state.showPassword).to.be.false;
      });

      it('should use nullish coalescing for falsy values', function () {
        // Empty string should be preserved, not replaced with default
        const state = new FormState({
          type: '',
          length: '',
          iteration: '',
          separator: '',
          preset: null,
          copyToClipboard: false,
          showPassword: false,
        });

        expect(state.type).to.equal('');
        expect(state.length).to.equal('');
        expect(state.iteration).to.equal('');
        expect(state.separator).to.equal(''); // Empty separator is valid
        expect(state.preset).to.be.null;
        expect(state.copyToClipboard).to.be.false;
        expect(state.showPassword).to.be.false;
      });

      it('should handle undefined values using defaults', function () {
        const state = new FormState({
          type: undefined,
          length: undefined,
          iteration: undefined,
          separator: undefined,
          preset: undefined,
          copyToClipboard: undefined,
          showPassword: undefined,
        });

        expect(state.type).to.equal('');
        expect(state.length).to.equal('');
        expect(state.iteration).to.equal('');
        expect(state.separator).to.equal('-');
        expect(state.preset).to.be.null;
        expect(state.copyToClipboard).to.be.false;
        expect(state.showPassword).to.be.true;
      });

      it('should handle quantum-resistant password type', function () {
        const state = new FormState({
          type: 'quantum-resistant',
          length: '43',
          iteration: '1',
          separator: '',
        });

        expect(state.type).to.equal('quantum-resistant');
        expect(state.length).to.equal('43');
        expect(state.iteration).to.equal('1');
        expect(state.separator).to.equal('');
      });

      it('should handle memorable password type', function () {
        const state = new FormState({
          type: 'memorable',
          iteration: '4',
          separator: ' ',
        });

        expect(state.type).to.equal('memorable');
        expect(state.iteration).to.equal('4');
        expect(state.separator).to.equal(' ');
      });

      it('should handle base64 password type', function () {
        const state = new FormState({
          type: 'base64',
          length: '32',
          iteration: '2',
          separator: '-',
        });

        expect(state.type).to.equal('base64');
        expect(state.length).to.equal('32');
        expect(state.iteration).to.equal('2');
      });
    });

    describe('fromPreset', function () {
      const presets = {
        quick: {
          type: 'strong',
          length: 14,
          iteration: 4,
          separator: '-',
        },
        secure: {
          type: 'strong',
          length: 16,
          iteration: 4,
          separator: '',
        },
        memorable: {
          type: 'memorable',
          iteration: 4,
          separator: '-',
        },
        quantum: {
          type: 'quantum-resistant',
          length: 43,
          iteration: 1,
          separator: '',
        },
      };

      it('should create FormState from quick preset', function () {
        const state = FormState.fromPreset('quick', presets);

        expect(state.type).to.equal('strong');
        expect(state.length).to.equal('14');
        expect(state.iteration).to.equal('4');
        expect(state.separator).to.equal('-');
        expect(state.preset).to.equal('quick');
      });

      it('should create FormState from secure preset', function () {
        const state = FormState.fromPreset('secure', presets);

        expect(state.type).to.equal('strong');
        expect(state.length).to.equal('16');
        expect(state.iteration).to.equal('4');
        expect(state.separator).to.equal('');
        expect(state.preset).to.equal('secure');
      });

      it('should create FormState from memorable preset', function () {
        const state = FormState.fromPreset('memorable', presets);

        expect(state.type).to.equal('memorable');
        expect(state.iteration).to.equal('4');
        expect(state.separator).to.equal('-');
        expect(state.preset).to.equal('memorable');
      });

      it('should create FormState from quantum preset', function () {
        const state = FormState.fromPreset('quantum', presets);

        expect(state.type).to.equal('quantum-resistant');
        expect(state.length).to.equal('43');
        expect(state.iteration).to.equal('1');
        expect(state.separator).to.equal('');
        expect(state.preset).to.equal('quantum');
      });

      it('should throw error for unknown preset', function () {
        expect(() => FormState.fromPreset('unknown', presets)).to.throw(
          Error,
          'Unknown preset: unknown'
        );
      });

      it('should throw error for null preset name', function () {
        expect(() => FormState.fromPreset(null, presets)).to.throw(Error, 'Unknown preset: null');
      });

      it('should throw error for undefined preset name', function () {
        expect(() => FormState.fromPreset(undefined, presets)).to.throw(
          Error,
          'Unknown preset: undefined'
        );
      });

      it('should throw error for empty string preset name', function () {
        expect(() => FormState.fromPreset('', presets)).to.throw(Error, 'Unknown preset: ');
      });

      it('should convert numeric length and iteration to strings', function () {
        const state = FormState.fromPreset('quick', presets);

        expect(state.length).to.be.a('string');
        expect(state.iteration).to.be.a('string');
      });
    });

    describe('with', function () {
      let originalState;

      beforeEach(function () {
        originalState = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '-',
          preset: 'quick',
          copyToClipboard: false,
          showPassword: true,
        });
      });

      it('should create a new FormState with updated type', function () {
        const newState = originalState.with({ type: 'memorable' });

        expect(newState.type).to.equal('memorable');
        expect(newState.length).to.equal('16');
        expect(newState.iteration).to.equal('4');
        expect(newState).to.not.equal(originalState);
      });

      it('should create a new FormState with updated length', function () {
        const newState = originalState.with({ length: '32' });

        expect(newState.type).to.equal('strong');
        expect(newState.length).to.equal('32');
      });

      it('should create a new FormState with updated iteration', function () {
        const newState = originalState.with({ iteration: '8' });

        expect(newState.iteration).to.equal('8');
      });

      it('should create a new FormState with updated separator', function () {
        const newState = originalState.with({ separator: '+' });

        expect(newState.separator).to.equal('+');
      });

      it('should create a new FormState with updated preset', function () {
        const newState = originalState.with({ preset: 'secure' });

        expect(newState.preset).to.equal('secure');
      });

      it('should create a new FormState with updated copyToClipboard', function () {
        const newState = originalState.with({ copyToClipboard: true });

        expect(newState.copyToClipboard).to.be.true;
      });

      it('should create a new FormState with updated showPassword', function () {
        const newState = originalState.with({ showPassword: false });

        expect(newState.showPassword).to.be.false;
      });

      it('should create a new FormState with multiple updates', function () {
        const newState = originalState.with({
          type: 'base64',
          length: '24',
          separator: '',
        });

        expect(newState.type).to.equal('base64');
        expect(newState.length).to.equal('24');
        expect(newState.separator).to.equal('');
        expect(newState.iteration).to.equal('4'); // unchanged
      });

      it('should not mutate the original state', function () {
        originalState.with({ type: 'memorable' });

        expect(originalState.type).to.equal('strong');
      });

      it('should create a new FormState instance', function () {
        const newState = originalState.with({});

        expect(newState).to.be.instanceOf(FormState);
        expect(newState).to.not.equal(originalState);
      });

      it('should preserve all values when updating with empty object', function () {
        const newState = originalState.with({});

        expect(newState.type).to.equal('strong');
        expect(newState.length).to.equal('16');
        expect(newState.iteration).to.equal('4');
        expect(newState.separator).to.equal('-');
        expect(newState.preset).to.equal('quick');
        expect(newState.copyToClipboard).to.be.false;
        expect(newState.showPassword).to.be.true;
      });
    });

    describe('hasRequiredFields', function () {
      it('should return true when type and iteration are set', function () {
        const state = new FormState({
          type: 'strong',
          iteration: '4',
        });

        expect(state.hasRequiredFields()).to.be.true;
      });

      it('should return false when type is empty', function () {
        const state = new FormState({
          type: '',
          iteration: '4',
        });

        expect(state.hasRequiredFields()).to.be.false;
      });

      it('should return false when iteration is empty', function () {
        const state = new FormState({
          type: 'strong',
          iteration: '',
        });

        expect(state.hasRequiredFields()).to.be.false;
      });

      it('should return false when both type and iteration are empty', function () {
        const state = new FormState({
          type: '',
          iteration: '',
        });

        expect(state.hasRequiredFields()).to.be.false;
      });

      it('should return false for default FormState', function () {
        const state = new FormState();

        expect(state.hasRequiredFields()).to.be.false;
      });

      it('should return true regardless of other fields', function () {
        const state = new FormState({
          type: 'memorable',
          iteration: '3',
          length: '', // length is optional for memorable
        });

        expect(state.hasRequiredFields()).to.be.true;
      });
    });

    describe('equals', function () {
      it('should return true for identical FormState objects', function () {
        const state1 = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '-',
          preset: 'quick',
        });
        const state2 = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '-',
          preset: 'quick',
        });

        expect(state1.equals(state2)).to.be.true;
      });

      it('should return false when type differs', function () {
        const state1 = new FormState({ type: 'strong', iteration: '4' });
        const state2 = new FormState({ type: 'memorable', iteration: '4' });

        expect(state1.equals(state2)).to.be.false;
      });

      it('should return false when length differs', function () {
        const state1 = new FormState({ type: 'strong', length: '16', iteration: '4' });
        const state2 = new FormState({ type: 'strong', length: '32', iteration: '4' });

        expect(state1.equals(state2)).to.be.false;
      });

      it('should return false when iteration differs', function () {
        const state1 = new FormState({ type: 'strong', iteration: '4' });
        const state2 = new FormState({ type: 'strong', iteration: '8' });

        expect(state1.equals(state2)).to.be.false;
      });

      it('should return false when separator differs', function () {
        const state1 = new FormState({ type: 'strong', iteration: '4', separator: '-' });
        const state2 = new FormState({ type: 'strong', iteration: '4', separator: '+' });

        expect(state1.equals(state2)).to.be.false;
      });

      it('should return false when preset differs', function () {
        const state1 = new FormState({ type: 'strong', iteration: '4', preset: 'quick' });
        const state2 = new FormState({ type: 'strong', iteration: '4', preset: 'secure' });

        expect(state1.equals(state2)).to.be.false;
      });

      it('should not compare copyToClipboard', function () {
        const state1 = new FormState({ type: 'strong', iteration: '4', copyToClipboard: true });
        const state2 = new FormState({ type: 'strong', iteration: '4', copyToClipboard: false });

        expect(state1.equals(state2)).to.be.true;
      });

      it('should not compare showPassword', function () {
        const state1 = new FormState({ type: 'strong', iteration: '4', showPassword: true });
        const state2 = new FormState({ type: 'strong', iteration: '4', showPassword: false });

        expect(state1.equals(state2)).to.be.true;
      });

      it('should return false when compared with non-FormState object', function () {
        const state = new FormState({ type: 'strong', iteration: '4' });
        const plainObject = {
          type: 'strong',
          length: '',
          iteration: '4',
          separator: '-',
          preset: null,
        };

        expect(state.equals(plainObject)).to.be.false;
      });

      it('should return false when compared with null', function () {
        const state = new FormState({ type: 'strong', iteration: '4' });

        expect(state.equals(null)).to.be.false;
      });

      it('should return false when compared with undefined', function () {
        const state = new FormState({ type: 'strong', iteration: '4' });

        expect(state.equals(undefined)).to.be.false;
      });

      it('should return false when compared with a string', function () {
        const state = new FormState({ type: 'strong', iteration: '4' });

        expect(state.equals('some string')).to.be.false;
      });

      it('should return false when compared with a number', function () {
        const state = new FormState({ type: 'strong', iteration: '4' });

        expect(state.equals(42)).to.be.false;
      });
    });

    describe('toJSON', function () {
      it('should return plain object with all properties', function () {
        const state = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '-',
          preset: 'quick',
          copyToClipboard: true,
          showPassword: false,
        });

        const json = state.toJSON();

        expect(json).to.deep.equal({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '-',
          preset: 'quick',
          copyToClipboard: true,
          showPassword: false,
        });
      });

      it('should return plain object for default FormState', function () {
        const state = new FormState();
        const json = state.toJSON();

        expect(json).to.deep.equal({
          type: '',
          length: '',
          iteration: '',
          separator: '-',
          preset: null,
          copyToClipboard: false,
          showPassword: true,
        });
      });

      it('should not be an instance of FormState', function () {
        const state = new FormState({ type: 'strong', iteration: '4' });
        const json = state.toJSON();

        expect(json).to.not.be.instanceOf(FormState);
        expect(json).to.be.an('object');
      });

      it('should be serializable to JSON string', function () {
        const state = new FormState({
          type: 'quantum-resistant',
          length: '43',
          iteration: '1',
          separator: '',
          preset: 'quantum',
        });

        const jsonString = JSON.stringify(state);
        const parsed = JSON.parse(jsonString);

        expect(parsed.type).to.equal('quantum-resistant');
        expect(parsed.length).to.equal('43');
        expect(parsed.iteration).to.equal('1');
        expect(parsed.separator).to.equal('');
        expect(parsed.preset).to.equal('quantum');
      });
    });
  });

  describe('StateToCoreMapper', function () {
    let mapper;

    beforeEach(function () {
      mapper = new StateToCoreMapper();
    });

    describe('toConfig', function () {
      it('should convert FormState to core config with all values', function () {
        const formState = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config).to.deep.equal({
          type: 'strong',
          length: 16,
          iteration: 4,
          separator: '-',
        });
      });

      it('should omit type when empty', function () {
        const formState = new FormState({
          type: '',
          length: '16',
          iteration: '4',
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config).to.not.have.property('type');
        expect(config.length).to.equal(16);
      });

      it('should omit length when empty string', function () {
        const formState = new FormState({
          type: 'memorable',
          length: '',
          iteration: '4',
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config).to.not.have.property('length');
        expect(config.type).to.equal('memorable');
      });

      it('should omit length when undefined', function () {
        const formState = new FormState({
          type: 'memorable',
          length: undefined,
          iteration: '4',
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config).to.not.have.property('length');
      });

      it('should omit iteration when empty string', function () {
        const formState = new FormState({
          type: 'strong',
          length: '16',
          iteration: '',
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config).to.not.have.property('iteration');
      });

      it('should omit iteration when undefined', function () {
        const formState = new FormState({
          type: 'strong',
          length: '16',
          iteration: undefined,
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config).to.not.have.property('iteration');
      });

      it('should include separator even when empty string', function () {
        const formState = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '',
        });

        const config = mapper.toConfig(formState);

        expect(config.separator).to.equal('');
      });

      it('should omit separator when undefined', function () {
        // Create a FormState and manually set separator to undefined
        const formState = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
        });
        formState.separator = undefined;

        const config = mapper.toConfig(formState);

        expect(config).to.not.have.property('separator');
      });

      it('should skip length when NaN after parsing', function () {
        const formState = new FormState({
          type: 'strong',
          length: 'invalid',
          iteration: '4',
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config).to.not.have.property('length');
        expect(config.iteration).to.equal(4);
      });

      it('should skip iteration when NaN after parsing', function () {
        const formState = new FormState({
          type: 'strong',
          length: '16',
          iteration: 'invalid',
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config).to.not.have.property('iteration');
        expect(config.length).to.equal(16);
      });

      it('should handle quantum-resistant type', function () {
        const formState = new FormState({
          type: 'quantum-resistant',
          length: '43',
          iteration: '1',
          separator: '',
        });

        const config = mapper.toConfig(formState);

        expect(config).to.deep.equal({
          type: 'quantum-resistant',
          length: 43,
          iteration: 1,
          separator: '',
        });
      });

      it('should handle base64 type', function () {
        const formState = new FormState({
          type: 'base64',
          length: '32',
          iteration: '2',
          separator: '+',
        });

        const config = mapper.toConfig(formState);

        expect(config).to.deep.equal({
          type: 'base64',
          length: 32,
          iteration: 2,
          separator: '+',
        });
      });

      it('should not include UI-only properties', function () {
        const formState = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '-',
          preset: 'quick',
          copyToClipboard: true,
          showPassword: false,
        });

        const config = mapper.toConfig(formState);

        expect(config).to.not.have.property('preset');
        expect(config).to.not.have.property('copyToClipboard');
        expect(config).to.not.have.property('showPassword');
      });

      it('should return empty config for empty FormState', function () {
        const formState = new FormState();

        const config = mapper.toConfig(formState);

        // Only separator is included because it defaults to "-"
        expect(config).to.deep.equal({
          separator: '-',
        });
      });

      it('should parse length with leading zeros correctly', function () {
        const formState = new FormState({
          type: 'strong',
          length: '0016',
          iteration: '4',
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config.length).to.equal(16);
      });

      it('should parse negative length correctly', function () {
        const formState = new FormState({
          type: 'strong',
          length: '-5',
          iteration: '4',
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config.length).to.equal(-5);
      });

      it('should parse negative iteration correctly', function () {
        const formState = new FormState({
          type: 'strong',
          length: '16',
          iteration: '-3',
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config.iteration).to.equal(-3);
      });

      it('should handle decimal values by parsing as integer', function () {
        const formState = new FormState({
          type: 'strong',
          length: '16.5',
          iteration: '4.9',
          separator: '-',
        });

        const config = mapper.toConfig(formState);

        expect(config.length).to.equal(16);
        expect(config.iteration).to.equal(4);
      });
    });

    describe('toFormState', function () {
      it('should convert core config to FormState with all values', function () {
        const config = {
          type: 'strong',
          length: 16,
          iteration: 4,
          separator: '-',
        };

        const formState = mapper.toFormState(config);

        expect(formState).to.be.instanceOf(FormState);
        expect(formState.type).to.equal('strong');
        expect(formState.length).to.equal('16');
        expect(formState.iteration).to.equal('4');
        expect(formState.separator).to.equal('-');
      });

      it('should handle missing type with empty string', function () {
        const config = {
          length: 16,
          iteration: 4,
          separator: '-',
        };

        const formState = mapper.toFormState(config);

        expect(formState.type).to.equal('');
      });

      it('should handle missing length with empty string', function () {
        const config = {
          type: 'memorable',
          iteration: 4,
          separator: '-',
        };

        const formState = mapper.toFormState(config);

        expect(formState.length).to.equal('');
      });

      it('should handle missing iteration with empty string', function () {
        const config = {
          type: 'strong',
          length: 16,
          separator: '-',
        };

        const formState = mapper.toFormState(config);

        expect(formState.iteration).to.equal('');
      });

      it('should handle missing separator with default', function () {
        const config = {
          type: 'strong',
          length: 16,
          iteration: 4,
        };

        const formState = mapper.toFormState(config);

        expect(formState.separator).to.equal('-');
      });

      it('should convert numeric length to string', function () {
        const config = {
          type: 'strong',
          length: 32,
          iteration: 4,
          separator: '-',
        };

        const formState = mapper.toFormState(config);

        expect(formState.length).to.be.a('string');
        expect(formState.length).to.equal('32');
      });

      it('should convert numeric iteration to string', function () {
        const config = {
          type: 'strong',
          length: 16,
          iteration: 8,
          separator: '-',
        };

        const formState = mapper.toFormState(config);

        expect(formState.iteration).to.be.a('string');
        expect(formState.iteration).to.equal('8');
      });

      it('should handle quantum-resistant config', function () {
        const config = {
          type: 'quantum-resistant',
          length: 43,
          iteration: 1,
          separator: '',
        };

        const formState = mapper.toFormState(config);

        expect(formState.type).to.equal('quantum-resistant');
        expect(formState.length).to.equal('43');
        expect(formState.iteration).to.equal('1');
        expect(formState.separator).to.equal('');
      });

      it('should handle empty config', function () {
        const config = {};

        const formState = mapper.toFormState(config);

        expect(formState.type).to.equal('');
        expect(formState.length).to.equal('');
        expect(formState.iteration).to.equal('');
        expect(formState.separator).to.equal('-');
      });

      it('should not populate UI-only fields', function () {
        const config = {
          type: 'strong',
          length: 16,
          iteration: 4,
          separator: '-',
        };

        const formState = mapper.toFormState(config);

        // UI-only fields should have their defaults
        expect(formState.preset).to.be.null;
        expect(formState.copyToClipboard).to.be.false;
        expect(formState.showPassword).to.be.true;
      });

      it('should handle length value of 0', function () {
        const config = {
          type: 'strong',
          length: 0,
          iteration: 4,
          separator: '-',
        };

        const formState = mapper.toFormState(config);

        expect(formState.length).to.equal('0');
      });

      it('should handle iteration value of 0', function () {
        const config = {
          type: 'strong',
          length: 16,
          iteration: 0,
          separator: '-',
        };

        const formState = mapper.toFormState(config);

        expect(formState.iteration).to.equal('0');
      });
    });

    describe('toUIOptions', function () {
      it('should extract UI-only options from FormState', function () {
        const formState = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '-',
          preset: 'quick',
          copyToClipboard: true,
          showPassword: false,
        });

        const uiOptions = mapper.toUIOptions(formState);

        expect(uiOptions).to.deep.equal({
          copyToClipboard: true,
          showPassword: false,
          preset: 'quick',
        });
      });

      it('should return defaults for default FormState', function () {
        const formState = new FormState();

        const uiOptions = mapper.toUIOptions(formState);

        expect(uiOptions).to.deep.equal({
          copyToClipboard: false,
          showPassword: true,
          preset: null,
        });
      });

      it('should not include core config properties', function () {
        const formState = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '-',
        });

        const uiOptions = mapper.toUIOptions(formState);

        expect(uiOptions).to.not.have.property('type');
        expect(uiOptions).to.not.have.property('length');
        expect(uiOptions).to.not.have.property('iteration');
        expect(uiOptions).to.not.have.property('separator');
      });

      it('should handle preset being null', function () {
        const formState = new FormState({
          type: 'strong',
          iteration: '4',
          preset: null,
        });

        const uiOptions = mapper.toUIOptions(formState);

        expect(uiOptions.preset).to.be.null;
      });

      it('should handle quantum preset', function () {
        const formState = new FormState({
          type: 'quantum-resistant',
          length: '43',
          iteration: '1',
          separator: '',
          preset: 'quantum',
        });

        const uiOptions = mapper.toUIOptions(formState);

        expect(uiOptions.preset).to.equal('quantum');
      });
    });

    describe('round-trip conversion', function () {
      it('should preserve values through toConfig and toFormState', function () {
        const originalFormState = new FormState({
          type: 'strong',
          length: '16',
          iteration: '4',
          separator: '-',
        });

        const config = mapper.toConfig(originalFormState);
        const restoredFormState = mapper.toFormState(config);

        expect(restoredFormState.type).to.equal(originalFormState.type);
        expect(restoredFormState.length).to.equal(originalFormState.length);
        expect(restoredFormState.iteration).to.equal(originalFormState.iteration);
        expect(restoredFormState.separator).to.equal(originalFormState.separator);
      });

      it('should preserve quantum-resistant type through round-trip', function () {
        const originalFormState = new FormState({
          type: 'quantum-resistant',
          length: '43',
          iteration: '1',
          separator: '',
        });

        const config = mapper.toConfig(originalFormState);
        const restoredFormState = mapper.toFormState(config);

        expect(restoredFormState.type).to.equal('quantum-resistant');
        expect(restoredFormState.length).to.equal('43');
        expect(restoredFormState.iteration).to.equal('1');
        expect(restoredFormState.separator).to.equal('');
      });

      it('should preserve memorable type through round-trip', function () {
        const originalFormState = new FormState({
          type: 'memorable',
          iteration: '4',
          separator: ' ',
        });

        const config = mapper.toConfig(originalFormState);
        const restoredFormState = mapper.toFormState(config);

        expect(restoredFormState.type).to.equal('memorable');
        expect(restoredFormState.iteration).to.equal('4');
        expect(restoredFormState.separator).to.equal(' ');
      });
    });
  });
});
