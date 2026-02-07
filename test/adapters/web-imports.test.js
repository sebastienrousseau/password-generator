// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it, before } from 'mocha';

// Set up Web Crypto API mock for Node.js
if (typeof global.crypto === 'undefined') {
  const { webcrypto } = await import('crypto');
  global.crypto = webcrypto;
}

// Set up btoa for Node.js
if (typeof global.btoa === 'undefined') {
  global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}

/**
 * Tests for Web adapter imports and webcrypto-random module
 */
describe('Web Adapters', () => {
  describe('webcrypto-random.js', () => {
    let webCryptoRandom;

    before(async () => {
      webCryptoRandom = await import('../../src/adapters/web/webcrypto-random.js');
    });

    describe('randomBytes', () => {
      it('should generate Uint8Array of specified size', () => {
        const bytes = webCryptoRandom.randomBytes(16);
        expect(bytes).to.be.instanceOf(Uint8Array);
        expect(bytes.length).to.equal(16);
      });

      it('should generate different bytes each time', () => {
        const bytes1 = webCryptoRandom.randomBytes(32);
        const bytes2 = webCryptoRandom.randomBytes(32);
        // Very unlikely to be equal
        expect(bytes1).to.not.deep.equal(bytes2);
      });

      it('should throw RangeError for invalid size', () => {
        expect(() => webCryptoRandom.randomBytes(0)).to.throw(RangeError);
        expect(() => webCryptoRandom.randomBytes(-1)).to.throw(RangeError);
        expect(() => webCryptoRandom.randomBytes(1.5)).to.throw(RangeError);
      });
    });

    describe('randomInt', () => {
      it('should generate integer in range [0, max)', () => {
        for (let i = 0; i < 50; i++) {
          const val = webCryptoRandom.randomInt(10);
          expect(val).to.be.at.least(0);
          expect(val).to.be.below(10);
        }
      });

      it('should return 0 for max=1', () => {
        for (let i = 0; i < 10; i++) {
          expect(webCryptoRandom.randomInt(1)).to.equal(0);
        }
      });

      it('should throw RangeError for invalid max', () => {
        expect(() => webCryptoRandom.randomInt(0)).to.throw(RangeError);
        expect(() => webCryptoRandom.randomInt(-5)).to.throw(RangeError);
      });
    });

    describe('bytesToBase64', () => {
      it('should convert bytes to base64', () => {
        const bytes = new Uint8Array([72, 101, 108, 108, 111]);
        expect(webCryptoRandom.bytesToBase64(bytes)).to.equal('SGVsbG8=');
      });

      it('should handle empty array', () => {
        expect(webCryptoRandom.bytesToBase64(new Uint8Array([]))).to.equal('');
      });

      it('should handle single byte with padding', () => {
        expect(webCryptoRandom.bytesToBase64(new Uint8Array([65]))).to.equal('QQ==');
      });

      it('should handle two bytes with padding', () => {
        expect(webCryptoRandom.bytesToBase64(new Uint8Array([65, 66]))).to.equal('QUI=');
      });

      // Note: The btoa fallback (lines 87-106) cannot be tested in Node.js
      // because btoa is always available via the global setup and the module
      // checks btoa availability at call time, not import time.
    });

    describe('WebCryptoRandom object', () => {
      it('should export as named and default export', () => {
        expect(webCryptoRandom.WebCryptoRandom).to.exist;
        expect(webCryptoRandom.default).to.exist;
        expect(webCryptoRandom.WebCryptoRandom).to.equal(webCryptoRandom.default);
      });

      it('should have all methods', () => {
        expect(webCryptoRandom.WebCryptoRandom.randomBytes).to.be.a('function');
        expect(webCryptoRandom.WebCryptoRandom.randomInt).to.be.a('function');
        expect(webCryptoRandom.WebCryptoRandom.bytesToBase64).to.be.a('function');
      });
    });
  });

  describe('adapters/web/index.js re-exports', () => {
    let webAdapters;

    before(async () => {
      webAdapters = await import('../../src/adapters/web/index.js');
    });

    it('should export WebCryptoRandom', () => {
      expect(webAdapters.WebCryptoRandom).to.exist;
    });

    it('should export WebConsoleLogger', () => {
      expect(webAdapters.WebConsoleLogger).to.exist;
    });

    it('should export WebLocalStorage', () => {
      expect(webAdapters.WebLocalStorage).to.exist;
    });
  });
});
