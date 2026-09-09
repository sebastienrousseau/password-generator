// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it, before } from 'mocha';

// Set up Web Crypto API mock for Node.js
if (typeof global.crypto === 'undefined') {
  const { webcrypto } = await import('crypto');
  global.crypto = webcrypto;
}

// Set up localStorage mock for Node.js
if (typeof global.localStorage === 'undefined') {
  const storage = new Map();
  global.localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
  };
}

/**
 * Tests for src/ui/web/index.js - main web UI re-exports
 */
describe('Web UI Index Module', () => {
  let webUI;

  before(async () => {
    webUI = await import('../../../src/ui/web/index.js');
  });

  describe('Adapter exports', () => {
    it('should export BrowserCryptoRandom', () => {
      expect(webUI.BrowserCryptoRandom).to.be.a('function');
    });

    it('should export BrowserStorage', () => {
      expect(webUI.BrowserStorage).to.be.a('function');
    });

    it('should export BrowserClock', () => {
      expect(webUI.BrowserClock).to.be.a('function');
    });
  });

  describe('State exports', () => {
    it('should export FormState', () => {
      expect(webUI.FormState).to.be.a('function');
    });

    it('should export StateToCoreMapper', () => {
      expect(webUI.StateToCoreMapper).to.be.a('function');
    });
  });

  describe('View Model exports', () => {
    it('should export PasswordViewModel', () => {
      expect(webUI.PasswordViewModel).to.be.a('function');
    });

    it('should export ValidationViewModel', () => {
      expect(webUI.ValidationViewModel).to.be.a('function');
    });

    it('should export EntropyViewModel', () => {
      expect(webUI.EntropyViewModel).to.be.a('function');
    });
  });

  describe('Controller exports', () => {
    it('should export WebUIController', () => {
      expect(webUI.WebUIController).to.be.a('function');
    });

    it('should export createWebUIController factory', () => {
      expect(webUI.createWebUIController).to.be.a('function');
    });
  });

  describe('Hook exports', () => {
    it('should export usePasswordGenerator hook', () => {
      // The hook requires React to execute, but we verify it's exported
      expect(webUI.usePasswordGenerator).to.be.a('function');
    });
  });

  describe('Integration', () => {
    it('should create working controller and generate password', async () => {
      const controller = webUI.createWebUIController();
      const formState = new webUI.FormState({
        type: 'strong',
        length: '16',
        iteration: '1',
        separator: '-',
      });

      const result = await controller.generate(formState);

      expect(result.password).to.be.a('string');
      expect(result.password.length).to.be.greaterThan(0);
    });

    it('should validate form state', () => {
      const controller = webUI.createWebUIController();
      const formState = new webUI.FormState({
        type: 'strong',
        length: '16',
        iteration: '1',
      });

      const validation = controller.validate(formState);

      expect(validation.isValid).to.be.true;
    });

    it('should calculate entropy', () => {
      const controller = webUI.createWebUIController();
      const formState = new webUI.FormState({
        type: 'strong',
        length: '16',
      });

      const entropy = controller.calculateEntropy(formState);

      expect(entropy.totalBits).to.be.a('number');
      expect(entropy.totalBits).to.be.greaterThan(0);
    });
  });
});
