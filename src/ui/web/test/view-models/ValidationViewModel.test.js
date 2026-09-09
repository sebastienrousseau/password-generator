// Copyright (c) 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { ValidationViewModel } from '../../view-models/ValidationViewModel.js';

describe('ValidationViewModel', () => {
  describe('constructor', () => {
    it('should create ValidationViewModel with provided data', () => {
      const data = {
        isValid: true,
        errors: [],
        fieldErrors: {
          type: null,
          length: null,
          iteration: null,
          separator: null,
        },
      };

      const vm = new ValidationViewModel(data);

      expect(vm.isValid).to.be.true;
      expect(vm.errors).to.deep.equal([]);
      expect(vm.fieldErrors).to.deep.equal({
        type: null,
        length: null,
        iteration: null,
        separator: null,
      });
    });

    it('should set convenience flags for field errors', () => {
      const data = {
        isValid: false,
        errors: ['Type error', 'Length error'],
        fieldErrors: {
          type: 'Type error',
          length: 'Length error',
          iteration: null,
          separator: null,
        },
      };

      const vm = new ValidationViewModel(data);

      expect(vm.hasTypeError).to.be.true;
      expect(vm.hasLengthError).to.be.true;
      expect(vm.hasIterationError).to.be.false;
      expect(vm.hasSeparatorError).to.be.false;
      expect(vm.hasErrors).to.be.true;
    });

    it('should set hasErrors based on isValid', () => {
      const validVm = new ValidationViewModel({
        isValid: true,
        errors: [],
        fieldErrors: { type: null, length: null, iteration: null, separator: null },
      });

      const invalidVm = new ValidationViewModel({
        isValid: false,
        errors: ['Some error'],
        fieldErrors: { type: null, length: null, iteration: null, separator: null },
      });

      expect(validVm.hasErrors).to.be.false;
      expect(invalidVm.hasErrors).to.be.true;
    });
  });

  describe('fromValidationResult', () => {
    it('should create view model from valid result', () => {
      const validation = {
        isValid: true,
        errors: [],
      };

      const vm = ValidationViewModel.fromValidationResult(validation);

      expect(vm).to.be.instanceOf(ValidationViewModel);
      expect(vm.isValid).to.be.true;
      expect(vm.errors).to.deep.equal([]);
      expect(vm.hasErrors).to.be.false;
    });

    it('should map type errors to type field', () => {
      const validation = {
        isValid: false,
        errors: ['Invalid type: unknown'],
      };

      const vm = ValidationViewModel.fromValidationResult(validation);

      expect(vm.fieldErrors.type).to.equal('Invalid type: unknown');
      expect(vm.hasTypeError).to.be.true;
    });

    it('should map length errors to length field', () => {
      const validation = {
        isValid: false,
        errors: ['Length must be between 1 and 1000'],
      };

      const vm = ValidationViewModel.fromValidationResult(validation);

      expect(vm.fieldErrors.length).to.equal('Length must be between 1 and 1000');
      expect(vm.hasLengthError).to.be.true;
    });

    it('should map iteration errors to iteration field', () => {
      const validation = {
        isValid: false,
        errors: ['Iteration must be at least 1'],
      };

      const vm = ValidationViewModel.fromValidationResult(validation);

      expect(vm.fieldErrors.iteration).to.equal('Iteration must be at least 1');
      expect(vm.hasIterationError).to.be.true;
    });

    it('should map separator errors to separator field', () => {
      const validation = {
        isValid: false,
        errors: ['Invalid separator character'],
      };

      const vm = ValidationViewModel.fromValidationResult(validation);

      expect(vm.fieldErrors.separator).to.equal('Invalid separator character');
      expect(vm.hasSeparatorError).to.be.true;
    });

    it('should handle multiple errors', () => {
      const validation = {
        isValid: false,
        errors: ['Invalid type: foobar', 'Length must be positive', 'Iteration count is too high'],
      };

      const vm = ValidationViewModel.fromValidationResult(validation);

      expect(vm.fieldErrors.type).to.equal('Invalid type: foobar');
      expect(vm.fieldErrors.length).to.equal('Length must be positive');
      expect(vm.fieldErrors.iteration).to.equal('Iteration count is too high');
      expect(vm.errors).to.have.lengthOf(3);
    });

    it('should handle case-insensitive error matching', () => {
      const validation = {
        isValid: false,
        errors: ['TYPE is required', 'LENGTH is invalid'],
      };

      const vm = ValidationViewModel.fromValidationResult(validation);

      expect(vm.fieldErrors.type).to.equal('TYPE is required');
      expect(vm.fieldErrors.length).to.equal('LENGTH is invalid');
    });

    it('should accept optional formState parameter', () => {
      const validation = { isValid: true, errors: [] };
      const formState = { type: 'strong', length: '16' };

      // Should not throw
      const vm = ValidationViewModel.fromValidationResult(validation, formState);
      expect(vm.isValid).to.be.true;
    });

    it('should ignore errors that do not match known fields', () => {
      const validation = {
        isValid: false,
        errors: ['Unknown configuration error'],
      };

      const vm = ValidationViewModel.fromValidationResult(validation);

      expect(vm.fieldErrors.type).to.be.null;
      expect(vm.fieldErrors.length).to.be.null;
      expect(vm.fieldErrors.iteration).to.be.null;
      expect(vm.fieldErrors.separator).to.be.null;
      expect(vm.errors).to.include('Unknown configuration error');
    });
  });

  describe('valid', () => {
    it('should create a valid view model', () => {
      const vm = ValidationViewModel.valid();

      expect(vm).to.be.instanceOf(ValidationViewModel);
      expect(vm.isValid).to.be.true;
      expect(vm.errors).to.deep.equal([]);
      expect(vm.hasErrors).to.be.false;
    });

    it('should have all field errors as null', () => {
      const vm = ValidationViewModel.valid();

      expect(vm.fieldErrors).to.deep.equal({
        type: null,
        length: null,
        iteration: null,
        separator: null,
      });
    });

    it('should have all hasFieldError flags as false', () => {
      const vm = ValidationViewModel.valid();

      expect(vm.hasTypeError).to.be.false;
      expect(vm.hasLengthError).to.be.false;
      expect(vm.hasIterationError).to.be.false;
      expect(vm.hasSeparatorError).to.be.false;
    });
  });

  describe('getFieldError', () => {
    it('should return error for field with error', () => {
      const vm = new ValidationViewModel({
        isValid: false,
        errors: ['Type error'],
        fieldErrors: {
          type: 'Type is required',
          length: null,
          iteration: null,
          separator: null,
        },
      });

      expect(vm.getFieldError('type')).to.equal('Type is required');
    });

    it('should return null for field without error', () => {
      const vm = ValidationViewModel.valid();

      expect(vm.getFieldError('type')).to.be.null;
      expect(vm.getFieldError('length')).to.be.null;
    });

    it('should return null for unknown field', () => {
      const vm = ValidationViewModel.valid();

      expect(vm.getFieldError('unknown')).to.be.null;
    });
  });

  describe('hasFieldError', () => {
    it('should return true for field with error', () => {
      const vm = new ValidationViewModel({
        isValid: false,
        errors: ['Length error'],
        fieldErrors: {
          type: null,
          length: 'Length is invalid',
          iteration: null,
          separator: null,
        },
      });

      expect(vm.hasFieldError('length')).to.be.true;
    });

    it('should return false for field without error', () => {
      const vm = ValidationViewModel.valid();

      expect(vm.hasFieldError('type')).to.be.false;
    });

    it('should return false for unknown field', () => {
      const vm = ValidationViewModel.valid();

      expect(vm.hasFieldError('unknown')).to.be.false;
    });
  });

  describe('getErrorFields', () => {
    it('should return array of fields with errors', () => {
      const vm = new ValidationViewModel({
        isValid: false,
        errors: ['Type error', 'Length error'],
        fieldErrors: {
          type: 'Type error',
          length: 'Length error',
          iteration: null,
          separator: null,
        },
      });

      const errorFields = vm.getErrorFields();

      expect(errorFields).to.include('type');
      expect(errorFields).to.include('length');
      expect(errorFields).to.not.include('iteration');
      expect(errorFields).to.not.include('separator');
    });

    it('should return empty array when no errors', () => {
      const vm = ValidationViewModel.valid();

      expect(vm.getErrorFields()).to.deep.equal([]);
    });

    it('should return all fields when all have errors', () => {
      const vm = new ValidationViewModel({
        isValid: false,
        errors: ['Errors'],
        fieldErrors: {
          type: 'Type error',
          length: 'Length error',
          iteration: 'Iteration error',
          separator: 'Separator error',
        },
      });

      const errorFields = vm.getErrorFields();

      expect(errorFields).to.have.lengthOf(4);
      expect(errorFields).to.include('type');
      expect(errorFields).to.include('length');
      expect(errorFields).to.include('iteration');
      expect(errorFields).to.include('separator');
    });
  });

  describe('getFirstError', () => {
    it('should return first error from errors array', () => {
      const vm = new ValidationViewModel({
        isValid: false,
        errors: ['First error', 'Second error', 'Third error'],
        fieldErrors: { type: null, length: null, iteration: null, separator: null },
      });

      expect(vm.getFirstError()).to.equal('First error');
    });

    it('should return null when no errors', () => {
      const vm = ValidationViewModel.valid();

      expect(vm.getFirstError()).to.be.null;
    });

    it('should return single error when only one exists', () => {
      const vm = new ValidationViewModel({
        isValid: false,
        errors: ['Only error'],
        fieldErrors: { type: null, length: null, iteration: null, separator: null },
      });

      expect(vm.getFirstError()).to.equal('Only error');
    });
  });

  describe('toJSON', () => {
    it('should convert to plain object', () => {
      const vm = new ValidationViewModel({
        isValid: false,
        errors: ['Type error', 'Length error'],
        fieldErrors: {
          type: 'Type error',
          length: 'Length error',
          iteration: null,
          separator: null,
        },
      });

      const json = vm.toJSON();

      expect(json).to.deep.equal({
        isValid: false,
        errors: ['Type error', 'Length error'],
        fieldErrors: {
          type: 'Type error',
          length: 'Length error',
          iteration: null,
          separator: null,
        },
      });
    });

    it('should be serializable to JSON string', () => {
      const vm = ValidationViewModel.valid();

      const jsonString = JSON.stringify(vm.toJSON());
      const parsed = JSON.parse(jsonString);

      expect(parsed.isValid).to.be.true;
      expect(parsed.errors).to.deep.equal([]);
    });

    it('should not include convenience flags', () => {
      const vm = new ValidationViewModel({
        isValid: false,
        errors: ['Error'],
        fieldErrors: {
          type: 'Type error',
          length: null,
          iteration: null,
          separator: null,
        },
      });

      const json = vm.toJSON();

      expect(json).to.not.have.property('hasTypeError');
      expect(json).to.not.have.property('hasLengthError');
      expect(json).to.not.have.property('hasIterationError');
      expect(json).to.not.have.property('hasSeparatorError');
      expect(json).to.not.have.property('hasErrors');
    });
  });

  describe('error field matching edge cases', () => {
    it('should handle error containing multiple field keywords', () => {
      // When an error contains multiple keywords, it should match the first one found
      const validation = {
        isValid: false,
        errors: ['type and length are both invalid'],
      };

      const vm = ValidationViewModel.fromValidationResult(validation);

      // First keyword found in the loop wins
      expect(vm.fieldErrors.type).to.equal('type and length are both invalid');
    });

    it('should handle empty errors array', () => {
      const validation = {
        isValid: true,
        errors: [],
      };

      const vm = ValidationViewModel.fromValidationResult(validation);

      expect(vm.errors).to.deep.equal([]);
      expect(vm.getErrorFields()).to.deep.equal([]);
    });

    it('should preserve original error messages', () => {
      const originalError = '  Length must be at least 4 characters  ';
      const validation = {
        isValid: false,
        errors: [originalError],
      };

      const vm = ValidationViewModel.fromValidationResult(validation);

      expect(vm.errors[0]).to.equal(originalError);
      expect(vm.fieldErrors.length).to.equal(originalError);
    });
  });
});
