// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { StateToCoreMapper } from '../../state/StateToCoreMapper.js';
import { FormState } from '../../state/FormState.js';

describe('StateToCoreMapper', () => {
  let mapper;

  beforeEach(() => {
    mapper = new StateToCoreMapper();
  });

  describe('toConfig', () => {
    it('should map type field', () => {
      const formState = new FormState({ type: 'strong' });
      const config = mapper.toConfig(formState);

      expect(config.type).to.equal('strong');
    });

    it('should parse length as integer', () => {
      const formState = new FormState({ type: 'strong', length: '16' });
      const config = mapper.toConfig(formState);

      expect(config.length).to.equal(16);
      expect(config.length).to.be.a('number');
    });

    it('should parse iteration as integer', () => {
      const formState = new FormState({ type: 'strong', iteration: '4' });
      const config = mapper.toConfig(formState);

      expect(config.iteration).to.equal(4);
      expect(config.iteration).to.be.a('number');
    });

    it('should pass separator as-is', () => {
      const formState = new FormState({ type: 'strong', separator: '_' });
      const config = mapper.toConfig(formState);

      expect(config.separator).to.equal('_');
    });

    it('should omit empty type', () => {
      const formState = new FormState({ type: '' });
      const config = mapper.toConfig(formState);

      expect(config).to.not.have.property('type');
    });

    it('should omit empty length', () => {
      const formState = new FormState({ type: 'strong', length: '' });
      const config = mapper.toConfig(formState);

      expect(config).to.not.have.property('length');
    });

    it('should omit empty iteration', () => {
      const formState = new FormState({ type: 'strong', iteration: '' });
      const config = mapper.toConfig(formState);

      expect(config).to.not.have.property('iteration');
    });

    it('should handle NaN length gracefully', () => {
      const formState = new FormState({ type: 'strong', length: 'abc' });
      const config = mapper.toConfig(formState);

      expect(config).to.not.have.property('length');
    });

    it('should handle NaN iteration gracefully', () => {
      const formState = new FormState({ type: 'strong', iteration: 'xyz' });
      const config = mapper.toConfig(formState);

      expect(config).to.not.have.property('iteration');
    });

    it('should map a complete FormState', () => {
      const formState = new FormState({
        type: 'base64',
        length: '20',
        iteration: '2',
        separator: '.',
      });

      const config = mapper.toConfig(formState);

      expect(config).to.deep.equal({
        type: 'base64',
        length: 20,
        iteration: 2,
        separator: '.',
      });
    });

    it('should not include UI-only fields', () => {
      const formState = new FormState({
        type: 'strong',
        length: '16',
        iteration: '1',
        preset: 'quick',
        copyToClipboard: true,
        showPassword: false,
      });

      const config = mapper.toConfig(formState);

      expect(config).to.not.have.property('preset');
      expect(config).to.not.have.property('copyToClipboard');
      expect(config).to.not.have.property('showPassword');
    });

    it('should handle memorable type without length', () => {
      const formState = new FormState({
        type: 'memorable',
        iteration: '4',
        separator: '-',
      });

      const config = mapper.toConfig(formState);

      expect(config).to.deep.equal({
        type: 'memorable',
        iteration: 4,
        separator: '-',
      });
    });

    it('should handle leading/trailing spaces in numeric values', () => {
      const formState = new FormState({
        type: 'strong',
        length: ' 16 ',
        iteration: ' 4 ',
      });

      const config = mapper.toConfig(formState);

      expect(config.length).to.equal(16);
      expect(config.iteration).to.equal(4);
    });

    it('should include separator even if empty string', () => {
      const formState = new FormState({
        type: 'strong',
        separator: '',
      });

      const config = mapper.toConfig(formState);

      expect(config.separator).to.equal('');
    });

    it('should use fixed parameters for quantum-resistant type', () => {
      const formState = new FormState({
        type: 'quantum-resistant',
        length: '14', // Should be ignored
        iteration: '4', // Should be ignored
        separator: '-', // Should be ignored
      });

      const config = mapper.toConfig(formState);

      expect(config.type).to.equal('quantum-resistant');
      expect(config.length).to.equal(43);
      expect(config.iteration).to.equal(1);
      expect(config.separator).to.equal('');
    });

    it('should apply quantum-resistant defaults regardless of form values', () => {
      const formState = new FormState({
        type: 'quantum-resistant',
        // No length/iteration/separator specified
      });

      const config = mapper.toConfig(formState);

      expect(config.length).to.equal(43);
      expect(config.iteration).to.equal(1);
      expect(config.separator).to.equal('');
    });
  });

  describe('toFormState', () => {
    it('should create FormState from core config', () => {
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

    it('should convert numeric values to strings', () => {
      const config = {
        type: 'base64',
        length: 20,
        iteration: 2,
      };

      const formState = mapper.toFormState(config);

      expect(formState.length).to.equal('20');
      expect(formState.length).to.be.a('string');
      expect(formState.iteration).to.equal('2');
      expect(formState.iteration).to.be.a('string');
    });

    it('should use default separator if not provided', () => {
      const config = {
        type: 'strong',
        length: 16,
      };

      const formState = mapper.toFormState(config);

      expect(formState.separator).to.equal('-');
    });

    it('should handle missing optional fields', () => {
      const config = { type: 'memorable' };

      const formState = mapper.toFormState(config);

      expect(formState.type).to.equal('memorable');
      expect(formState.length).to.equal('');
      expect(formState.iteration).to.equal('');
      expect(formState.separator).to.equal('-');
    });

    it('should handle empty config', () => {
      const config = {};

      const formState = mapper.toFormState(config);

      expect(formState.type).to.equal('');
      expect(formState.length).to.equal('');
      expect(formState.iteration).to.equal('');
    });

    it('should not include UI-only fields from config', () => {
      const config = {
        type: 'strong',
        length: 16,
      };

      const formState = mapper.toFormState(config);

      expect(formState.preset).to.be.null;
      expect(formState.copyToClipboard).to.be.false;
      expect(formState.showPassword).to.be.true;
    });

    it('should handle zero values correctly', () => {
      const config = {
        type: 'strong',
        length: 0,
        iteration: 0,
      };

      const formState = mapper.toFormState(config);

      expect(formState.length).to.equal('0');
      expect(formState.iteration).to.equal('0');
    });
  });

  describe('toUIOptions', () => {
    it('should extract UI-only options', () => {
      const formState = new FormState({
        type: 'strong',
        copyToClipboard: true,
        showPassword: false,
        preset: 'secure',
      });

      const uiOptions = mapper.toUIOptions(formState);

      expect(uiOptions).to.deep.equal({
        copyToClipboard: true,
        showPassword: false,
        preset: 'secure',
      });
    });

    it('should return default UI options', () => {
      const formState = new FormState({ type: 'strong' });

      const uiOptions = mapper.toUIOptions(formState);

      expect(uiOptions.copyToClipboard).to.be.false;
      expect(uiOptions.showPassword).to.be.true;
      expect(uiOptions.preset).to.be.null;
    });

    it('should not include core config fields', () => {
      const formState = new FormState({
        type: 'strong',
        length: '16',
        iteration: '4',
        separator: '-',
        copyToClipboard: true,
      });

      const uiOptions = mapper.toUIOptions(formState);

      expect(uiOptions).to.not.have.property('type');
      expect(uiOptions).to.not.have.property('length');
      expect(uiOptions).to.not.have.property('iteration');
      expect(uiOptions).to.not.have.property('separator');
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve data through toConfig -> toFormState', () => {
      const original = new FormState({
        type: 'strong',
        length: '16',
        iteration: '4',
        separator: '_',
      });

      const config = mapper.toConfig(original);
      const restored = mapper.toFormState(config);

      expect(restored.type).to.equal(original.type);
      expect(restored.length).to.equal(original.length);
      expect(restored.iteration).to.equal(original.iteration);
      expect(restored.separator).to.equal(original.separator);
    });

    it('should preserve data through toFormState -> toConfig', () => {
      const original = {
        type: 'base64',
        length: 20,
        iteration: 2,
        separator: '-',
      };

      const formState = mapper.toFormState(original);
      const restored = mapper.toConfig(formState);

      expect(restored).to.deep.equal(original);
    });
  });
});
