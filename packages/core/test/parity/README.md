# Cross-Interface Parity Testing Strategy

## Overview

This directory contains the **Cross-Interface Parity Test Strategy** for the Password Generator project. The strategy ensures that all interface adapters (CLI, Web, and future Mobile) produce **identical outputs for identical core inputs**.

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │          Parity Contract            │
                    │                                     │
                    │  Same Config + Same Random Sequence │
                    │         = Same Output               │
                    └─────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
             ┌───────────┐    ┌───────────┐    ┌───────────┐
             │    CLI    │    │    Web    │    │  Mobile   │
             │  Adapter  │    │  Adapter  │    │  Adapter  │
             └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
                   │                │                │
                   └────────────────┼────────────────┘
                                    ▼
                    ┌─────────────────────────────────────┐
                    │           Core Service              │
                    │     (packages/core/src/service.js)  │
                    │                                     │
                    │  • generate(config)                 │
                    │  • validateConfig(config)           │
                    │  • calculateEntropy(config)         │
                    └─────────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────────┐
                    │       MockRandomGenerator           │
                    │  (Deterministic for parity tests)   │
                    └─────────────────────────────────────┘
```

## Parity Contract Definition

### 1. Generation Parity
**Same config + Same random sequence = Same password**

All adapters must produce byte-for-byte identical passwords when given:
- Identical configuration objects
- Identical random number sequences (via MockRandomGenerator)

### 2. Validation Parity
**Same config = Same validation result**

All adapters must return:
- Same `isValid` boolean
- Same error messages (if invalid)
- No adapter-specific validation logic

### 3. Entropy Parity
**Same config = Same entropy calculation**

All adapters must return:
- Identical `totalBits` values
- Identical `securityLevel` classifications
- Identical `recommendation` strings

## File Structure

```
packages/core/test/parity/
├── MockRandomGenerator.js    # Deterministic random generator
├── fixtures.js               # Shared test cases and expected outputs
├── parity-contract.test.js   # Core service contract tests
└── README.md                 # This documentation

test/parity/
├── cli-parity.test.js        # CLI adapter parity tests
├── web-parity.test.js        # Web adapter parity tests
└── index.test.js             # Cross-adapter comparison tests
```

## MockRandomGenerator

The `MockRandomGenerator` provides deterministic randomness for parity testing.

### Usage Modes

1. **Seeded Mode** - Uses Linear Congruential Generator (LCG) with configurable seed
   ```javascript
   const mock = MockRandomGenerator.withSeed(42);
   ```

2. **Sequence Mode** - Cycles through a predefined sequence
   ```javascript
   const mock = MockRandomGenerator.withSequence([0, 1, 2, 3, 4]);
   ```

3. **Incrementing Mode** - Generates 0, 1, 2, 3, ... sequence
   ```javascript
   const mock = MockRandomGenerator.incrementing(0, 1000);
   ```

### Standard Parity Seeds

```javascript
import { PARITY_SEEDS } from './MockRandomGenerator.js';

PARITY_SEEDS.PRIMARY     // 42 - Primary seed for most tests
PARITY_SEEDS.SECONDARY   // 7777 - Secondary seed for comparison
PARITY_SEEDS.EDGE_CASE   // 65536 - Edge case testing
PARITY_SEEDS.STRESS      // 123456789 - Stress testing
```

## Test Fixtures

### Generation Test Cases
```javascript
import { GENERATION_PARITY_CASES } from './fixtures.js';

// Example case:
{
  id: "strong-multi-chunk",
  description: "Strong password with multiple chunks",
  config: {
    type: "strong",
    length: 16,
    iteration: 4,
    separator: "-"
  },
  seed: PARITY_SEEDS.PRIMARY,
  expectedLength: 67,
  expectedChunks: 4,
  chunkLength: 16
}
```

### Validation Test Cases
```javascript
import { VALIDATION_PARITY_CASES } from './fixtures.js';

// Example case:
{
  id: "invalid-zero-length",
  description: "Zero length should fail",
  config: { type: "strong", length: 0, iteration: 1 },
  expected: {
    isValid: false,
    errorContains: "Length"
  }
}
```

### Entropy Test Cases
```javascript
import { ENTROPY_PARITY_CASES } from './fixtures.js';

// Example case:
{
  id: "entropy-strong-16x4",
  description: "Entropy for 16 chars, 4 iterations",
  config: { type: "strong", length: 16, iteration: 4 },
  expected: {
    totalBits: 384,
    securityLevelContains: "EXCELLENT"
  }
}
```

## Running Parity Tests

### Run All Parity Tests
```bash
npm test -- --grep "Parity"
```

### Run Core Contract Tests Only
```bash
npm test -- packages/core/test/parity/
```

### Run Adapter Parity Tests
```bash
npm test -- test/parity/
```

## Quality Gates

### CI/CD Requirements

1. **100% Parity Test Pass Rate**
   - All parity tests must pass on every PR
   - No exceptions for "minor" differences

2. **New Adapter Checklist**
   - [ ] Implement adapter parity test suite
   - [ ] Pass all `GENERATION_PARITY_CASES`
   - [ ] Pass all `VALIDATION_PARITY_CASES`
   - [ ] Pass all `ENTROPY_PARITY_CASES`
   - [ ] Cross-adapter comparison test passes

3. **Breaking Change Protocol**
   - If parity tests fail after core changes:
     1. Determine if change is intentional
     2. Update ALL fixtures with new expected values
     3. Update ALL adapter tests
     4. Document the breaking change

### Pre-commit Hooks
```bash
# Recommended pre-commit hook
npm test -- --grep "Parity Contract"
```

## Adding a New Adapter

When creating a new adapter (e.g., Mobile), follow these steps:

### 1. Create Adapter Parity Test File
```javascript
// test/parity/mobile-parity.test.js
import { PARITY_TEST_SUITE } from '../../packages/core/test/parity/fixtures.js';
import { MockRandomGenerator } from '../../packages/core/test/parity/MockRandomGenerator.js';

describe("Mobile Adapter Parity", () => {
  // Import and test your mobile adapter here
});
```

### 2. Implement All Test Cases
```javascript
PARITY_TEST_SUITE.generation.forEach(testCase => {
  it(`[${testCase.id}] ${testCase.description}`, async () => {
    // Test mobile adapter produces identical output
  });
});
```

### 3. Add Cross-Adapter Comparison
```javascript
// test/parity/index.test.js
import { generateComparisonCases } from '../../packages/core/test/parity/fixtures.js';

const mobileVsCliCases = generateComparisonCases('mobile', 'cli');
const mobileVsWebCases = generateComparisonCases('mobile', 'web');
```

### 4. Update CI Configuration
```yaml
# Add to CI pipeline
- name: Mobile Parity Tests
  run: npm test -- test/parity/mobile-parity.test.js
```

## Troubleshooting

### Parity Test Failures

**Symptom**: Adapter produces different output than expected

**Common Causes**:
1. Using real random generator instead of MockRandomGenerator
2. Different order of operations in adapter
3. Type coercion differences (string vs number)
4. Platform-specific behavior leaking into adapter

**Resolution**:
1. Verify adapter uses injected MockRandomGenerator
2. Check adapter only does data transformation, no business logic
3. Ensure adapter delegates to core service for all operations

### Non-Deterministic Failures

**Symptom**: Tests pass sometimes, fail other times

**Common Causes**:
1. MockRandomGenerator not reset between tests
2. Shared state between test cases
3. Async timing issues

**Resolution**:
1. Call `mockRandom.reset()` in `beforeEach`
2. Create fresh service instance per test
3. Ensure proper async/await handling

## Best Practices

1. **Never add adapter-specific logic to core**
   - Core should be platform-agnostic
   - Adapters only transform data and delegate

2. **Always use MockRandomGenerator for parity tests**
   - Real random generators cannot be made deterministic
   - MockRandomGenerator ensures reproducibility

3. **Keep test cases atomic**
   - Each test case should be independent
   - No dependencies between test cases

4. **Document expected values**
   - Include comments explaining why values are expected
   - Reference entropy calculations for clarity

5. **Version control test fixtures**
   - Treat fixtures as part of the API contract
   - Changes to fixtures require PR review

## References

- [Hexagonal Architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))
- [Port and Adapter Pattern](https://alistair.cockburn.us/hexagonal-architecture/)
- [Entropy Calculations](../../../packages/core/src/domain/entropy-calculator.js)
