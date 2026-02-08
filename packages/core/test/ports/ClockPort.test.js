// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import {
  ClockPort,
  CLOCK_REQUIRED_METHODS,
  CLOCK_OPTIONAL_METHODS,
  FixedClock,
} from '../../src/ports/ClockPort.js';

describe('Ports: ClockPort', () => {
  describe('ClockPort base class', () => {
    let port;

    beforeEach(() => {
      port = new ClockPort();
    });

    it('should be a class', () => {
      expect(ClockPort).to.be.a('function');
      expect(port).to.be.instanceOf(ClockPort);
    });

    describe('now', () => {
      it('should throw Error indicating method must be implemented', () => {
        expect(() => port.now()).to.throw(Error, 'must be implemented');
      });
    });

    describe('performanceNow', () => {
      it('should throw Error indicating method must be implemented', () => {
        expect(() => port.performanceNow()).to.throw(Error, 'must be implemented');
      });
    });

    describe('toISOString', () => {
      it('should throw Error indicating method must be implemented', () => {
        expect(() => port.toISOString()).to.throw(Error, 'must be implemented');
      });
    });
  });

  describe('CLOCK_REQUIRED_METHODS', () => {
    it('should be an array', () => {
      expect(CLOCK_REQUIRED_METHODS).to.be.an('array');
    });

    it('should contain now', () => {
      expect(CLOCK_REQUIRED_METHODS).to.include('now');
    });

    it('should contain performanceNow', () => {
      expect(CLOCK_REQUIRED_METHODS).to.include('performanceNow');
    });

    it('should have exactly 2 required methods', () => {
      expect(CLOCK_REQUIRED_METHODS).to.have.lengthOf(2);
    });
  });

  describe('CLOCK_OPTIONAL_METHODS', () => {
    it('should be an array', () => {
      expect(CLOCK_OPTIONAL_METHODS).to.be.an('array');
    });

    it('should contain toISOString', () => {
      expect(CLOCK_OPTIONAL_METHODS).to.include('toISOString');
    });

    it('should have exactly 1 optional method', () => {
      expect(CLOCK_OPTIONAL_METHODS).to.have.lengthOf(1);
    });
  });

  describe('FixedClock', () => {
    describe('constructor', () => {
      it('should be a class', () => {
        expect(FixedClock).to.be.a('function');
      });

      it('should extend ClockPort', () => {
        const clock = new FixedClock();
        expect(clock).to.be.instanceOf(ClockPort);
      });

      it('should accept initial timestamp', () => {
        const timestamp = 1609459200000; // 2021-01-01
        const clock = new FixedClock(timestamp);
        expect(clock.now()).to.equal(timestamp);
      });

      it('should use current time as default', () => {
        const before = Date.now();
        const clock = new FixedClock();
        const after = Date.now();
        expect(clock.now()).to.be.at.least(before);
        expect(clock.now()).to.be.at.most(after);
      });

      it('should initialize performanceStart to 0', () => {
        const clock = new FixedClock();
        expect(clock.performanceStart).to.equal(0);
      });
    });

    describe('now', () => {
      it('should return the fixed timestamp', () => {
        const timestamp = 1609459200000;
        const clock = new FixedClock(timestamp);
        expect(clock.now()).to.equal(timestamp);
      });

      it('should return same value on multiple calls', () => {
        const clock = new FixedClock(1000);
        expect(clock.now()).to.equal(1000);
        expect(clock.now()).to.equal(1000);
        expect(clock.now()).to.equal(1000);
      });
    });

    describe('performanceNow', () => {
      it('should return 0 by default', () => {
        const clock = new FixedClock();
        expect(clock.performanceNow()).to.equal(0);
      });

      it('should return performanceStart value', () => {
        const clock = new FixedClock();
        clock.performanceStart = 100;
        expect(clock.performanceNow()).to.equal(100);
      });
    });

    describe('toISOString', () => {
      it('should return ISO string for timestamp', () => {
        const timestamp = 1609459200000; // 2021-01-01T00:00:00.000Z
        const clock = new FixedClock(timestamp);
        expect(clock.toISOString()).to.equal('2021-01-01T00:00:00.000Z');
      });

      it('should handle different timestamps', () => {
        const clock = new FixedClock(0);
        expect(clock.toISOString()).to.equal('1970-01-01T00:00:00.000Z');
      });
    });

    describe('setTimestamp', () => {
      it('should update the timestamp', () => {
        const clock = new FixedClock(1000);
        clock.setTimestamp(2000);
        expect(clock.now()).to.equal(2000);
      });

      it('should affect toISOString', () => {
        const clock = new FixedClock(0);
        clock.setTimestamp(1609459200000);
        expect(clock.toISOString()).to.equal('2021-01-01T00:00:00.000Z');
      });
    });

    describe('advance', () => {
      it('should advance timestamp by given milliseconds', () => {
        const clock = new FixedClock(1000);
        clock.advance(500);
        expect(clock.now()).to.equal(1500);
      });

      it('should advance performanceStart by same amount', () => {
        const clock = new FixedClock(1000);
        clock.advance(500);
        expect(clock.performanceNow()).to.equal(500);
      });

      it('should support multiple advances', () => {
        const clock = new FixedClock(0);
        clock.advance(100);
        clock.advance(200);
        clock.advance(300);
        expect(clock.now()).to.equal(600);
        expect(clock.performanceNow()).to.equal(600);
      });

      it('should support negative values (time travel)', () => {
        const clock = new FixedClock(1000);
        clock.advance(-500);
        expect(clock.now()).to.equal(500);
      });
    });

    describe('deterministic behavior', () => {
      it('should be fully deterministic for testing', () => {
        const clock1 = new FixedClock(12345);
        const clock2 = new FixedClock(12345);

        expect(clock1.now()).to.equal(clock2.now());
        expect(clock1.performanceNow()).to.equal(clock2.performanceNow());
        expect(clock1.toISOString()).to.equal(clock2.toISOString());

        clock1.advance(100);
        clock2.advance(100);

        expect(clock1.now()).to.equal(clock2.now());
      });
    });
  });
});
