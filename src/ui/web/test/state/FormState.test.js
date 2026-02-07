// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { FormState } from '../../state/FormState.js';

describe('FormState', () => {
  describe('constructor', () => {
    it('should create FormState with default values', () => {
      const state = new FormState();

      expect(state.type).to.equal('');
      expect(state.length).to.equal('');
      expect(state.iteration).to.equal('');
      expect(state.separator).to.equal('-');
      expect(state.preset).to.be.null;
      expect(state.copyToClipboard).to.be.false;
      expect(state.showPassword).to.be.true;
    });

    it('should create FormState with provided values', () => {
      const state = new FormState({
        type: 'strong',
        length: '16',
        iteration: '4',
        separator: '_',
        preset: 'secure',
        copyToClipboard: true,
        showPassword: false,
      });

      expect(state.type).to.equal('strong');
      expect(state.length).to.equal('16');
      expect(state.iteration).to.equal('4');
      expect(state.separator).to.equal('_');
      expect(state.preset).to.equal('secure');
      expect(state.copyToClipboard).to.be.true;
      expect(state.showPassword).to.be.false;
    });

    it('should handle partial values', () => {
      const state = new FormState({
        type: 'base64',
        length: '20',
      });

      expect(state.type).to.equal('base64');
      expect(state.length).to.equal('20');
      expect(state.iteration).to.equal('');
      expect(state.separator).to.equal('-');
    });

    it('should handle null and undefined values with defaults', () => {
      const state = new FormState({
        type: null,
        length: undefined,
      });

      expect(state.type).to.equal('');
      expect(state.length).to.equal('');
    });
  });

  describe('fromPreset', () => {
    const presets = {
      quick: {
        type: 'strong',
        length: 8,
        iteration: 1,
        separator: '-',
      },
      secure: {
        type: 'strong',
        length: 16,
        iteration: 4,
        separator: '_',
      },
      memorable: {
        type: 'memorable',
        length: 0,
        iteration: 4,
        separator: '-',
      },
    };

    it('should create FormState from a valid preset', () => {
      const state = FormState.fromPreset('quick', presets);

      expect(state.type).to.equal('strong');
      expect(state.length).to.equal('8');
      expect(state.iteration).to.equal('1');
      expect(state.separator).to.equal('-');
      expect(state.preset).to.equal('quick');
    });

    it('should create FormState from secure preset', () => {
      const state = FormState.fromPreset('secure', presets);

      expect(state.type).to.equal('strong');
      expect(state.length).to.equal('16');
      expect(state.iteration).to.equal('4');
      expect(state.separator).to.equal('_');
      expect(state.preset).to.equal('secure');
    });

    it('should convert numeric values to strings', () => {
      const state = FormState.fromPreset('memorable', presets);

      expect(state.length).to.equal('0');
      expect(state.iteration).to.equal('4');
    });

    it('should throw error for unknown preset', () => {
      expect(() => FormState.fromPreset('unknown', presets)).to.throw(
        Error,
        'Unknown preset: unknown'
      );
    });

    it('should throw error for empty presets object', () => {
      expect(() => FormState.fromPreset('quick', {})).to.throw(Error, 'Unknown preset: quick');
    });
  });

  describe('with', () => {
    it('should create a new FormState with updated values', () => {
      const original = new FormState({
        type: 'strong',
        length: '16',
        iteration: '1',
      });

      const updated = original.with({ length: '32' });

      expect(updated.length).to.equal('32');
      expect(updated.type).to.equal('strong');
      expect(updated.iteration).to.equal('1');
    });

    it('should not modify the original FormState', () => {
      const original = new FormState({
        type: 'strong',
        length: '16',
      });

      original.with({ length: '32' });

      expect(original.length).to.equal('16');
    });

    it('should allow updating multiple fields', () => {
      const original = new FormState({
        type: 'strong',
        length: '16',
        iteration: '1',
      });

      const updated = original.with({
        type: 'base64',
        length: '20',
        iteration: '2',
      });

      expect(updated.type).to.equal('base64');
      expect(updated.length).to.equal('20');
      expect(updated.iteration).to.equal('2');
    });

    it('should allow updating UI-only fields', () => {
      const original = new FormState({
        copyToClipboard: false,
        showPassword: true,
      });

      const updated = original.with({
        copyToClipboard: true,
        showPassword: false,
      });

      expect(updated.copyToClipboard).to.be.true;
      expect(updated.showPassword).to.be.false;
    });

    it('should return a new FormState instance', () => {
      const original = new FormState({ type: 'strong' });
      const updated = original.with({ length: '16' });

      expect(updated).to.be.instanceOf(FormState);
      expect(updated).to.not.equal(original);
    });
  });

  describe('hasRequiredFields', () => {
    it('should return true when type and iteration are set', () => {
      const state = new FormState({
        type: 'strong',
        iteration: '1',
      });

      expect(state.hasRequiredFields()).to.be.true;
    });

    it('should return false when type is empty', () => {
      const state = new FormState({
        type: '',
        iteration: '1',
      });

      expect(state.hasRequiredFields()).to.be.false;
    });

    it('should return false when iteration is empty', () => {
      const state = new FormState({
        type: 'strong',
        iteration: '',
      });

      expect(state.hasRequiredFields()).to.be.false;
    });

    it('should return false when both type and iteration are empty', () => {
      const state = new FormState();

      expect(state.hasRequiredFields()).to.be.false;
    });

    it('should not require length', () => {
      const state = new FormState({
        type: 'memorable',
        iteration: '4',
        length: '',
      });

      expect(state.hasRequiredFields()).to.be.true;
    });
  });

  describe('equals', () => {
    it('should return true for equal FormState instances', () => {
      const state1 = new FormState({
        type: 'strong',
        length: '16',
        iteration: '4',
        separator: '-',
        preset: 'secure',
      });

      const state2 = new FormState({
        type: 'strong',
        length: '16',
        iteration: '4',
        separator: '-',
        preset: 'secure',
      });

      expect(state1.equals(state2)).to.be.true;
    });

    it('should return false for different types', () => {
      const state1 = new FormState({ type: 'strong' });
      const state2 = new FormState({ type: 'base64' });

      expect(state1.equals(state2)).to.be.false;
    });

    it('should return false for different lengths', () => {
      const state1 = new FormState({ type: 'strong', length: '16' });
      const state2 = new FormState({ type: 'strong', length: '32' });

      expect(state1.equals(state2)).to.be.false;
    });

    it('should return false for different iterations', () => {
      const state1 = new FormState({ type: 'strong', iteration: '1' });
      const state2 = new FormState({ type: 'strong', iteration: '4' });

      expect(state1.equals(state2)).to.be.false;
    });

    it('should return false for different separators', () => {
      const state1 = new FormState({ type: 'strong', separator: '-' });
      const state2 = new FormState({ type: 'strong', separator: '_' });

      expect(state1.equals(state2)).to.be.false;
    });

    it('should return false for different presets', () => {
      const state1 = new FormState({ type: 'strong', preset: 'quick' });
      const state2 = new FormState({ type: 'strong', preset: 'secure' });

      expect(state1.equals(state2)).to.be.false;
    });

    it('should return false when comparing to non-FormState', () => {
      const state = new FormState({ type: 'strong' });

      expect(state.equals(null)).to.be.false;
      expect(state.equals(undefined)).to.be.false;
      expect(state.equals({ type: 'strong' })).to.be.false;
      expect(state.equals('strong')).to.be.false;
    });

    it('should ignore UI-only fields in comparison', () => {
      const state1 = new FormState({
        type: 'strong',
        copyToClipboard: true,
        showPassword: false,
      });

      const state2 = new FormState({
        type: 'strong',
        copyToClipboard: false,
        showPassword: true,
      });

      expect(state1.equals(state2)).to.be.true;
    });
  });

  describe('toJSON', () => {
    it('should convert FormState to plain object', () => {
      const state = new FormState({
        type: 'strong',
        length: '16',
        iteration: '4',
        separator: '-',
        preset: 'secure',
        copyToClipboard: true,
        showPassword: false,
      });

      const json = state.toJSON();

      expect(json).to.deep.equal({
        type: 'strong',
        length: '16',
        iteration: '4',
        separator: '-',
        preset: 'secure',
        copyToClipboard: true,
        showPassword: false,
      });
    });

    it('should return a plain object not a FormState', () => {
      const state = new FormState({ type: 'strong' });
      const json = state.toJSON();

      expect(json).to.not.be.instanceOf(FormState);
      expect(json).to.be.an('object');
    });

    it('should be serializable to JSON string', () => {
      const state = new FormState({
        type: 'base64',
        length: '20',
        iteration: '2',
      });

      const jsonString = JSON.stringify(state.toJSON());
      const parsed = JSON.parse(jsonString);

      expect(parsed.type).to.equal('base64');
      expect(parsed.length).to.equal('20');
      expect(parsed.iteration).to.equal('2');
    });
  });
});
