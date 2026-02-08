# Documentation Style Guide

This guide defines writing standards for the Password Generator project documentation. Follow these principles to maintain clarity, consistency, and professionalism across all written content.

## Core Principles

### 1. Active Voice Exclusively

Write every sentence in active voice. The subject performs the action.

| Active (Correct) | Passive (Incorrect) |
|------------------|---------------------|
| The generator creates passwords | Passwords are created by the generator |
| Port interfaces handle I/O operations | I/O operations are handled by port interfaces |
| Argon2id hashes the password | The password is hashed by Argon2id |

### 2. Imperative and Present Tense

Write instructions in imperative mood. Describe behavior in present tense. Never use future tense.

| Present/Imperative (Correct) | Future (Incorrect) |
|------------------------------|-------------------|
| Run the test suite | You will run the test suite |
| The function returns a string | The function will return a string |
| Install dependencies first | Dependencies will need to be installed |
| Configure the adapter | The adapter will be configured |

### 3. No Hedging Language

Eliminate words that weaken statements: might, could, should, can, may, possibly, generally, typically, usually, often.

| Direct (Correct) | Hedging (Incorrect) |
|------------------|---------------------|
| Generate secure passwords | You can generate secure passwords |
| Store passwords using Argon2id | Passwords should be stored using Argon2id |
| This approach improves performance | This approach might improve performance |
| Use environment variables for secrets | You may want to use environment variables |
| The adapter throws an error | The adapter could throw an error |

### 4. Strong Verbs Over Weak Helpers

Replace weak verbs (is, are, has, have, make, provide, do, get) with precise action verbs.

| Strong (Correct) | Weak (Incorrect) |
|------------------|------------------|
| Port interfaces abstract I/O | All I/O is abstracted through port interfaces |
| The service generates passwords | The service provides password generation |
| This module exports utilities | This module has several utilities |
| Entropy calculation determines strength | Entropy calculation is used for strength |
| The validator rejects invalid input | The validator does input validation |

---

## Weak Verb Replacement Table

| Weak Construction | Strong Alternative |
|-------------------|-------------------|
| is able to | — (use verb directly) |
| is responsible for | handles, manages, controls |
| is used to | — (use verb directly) |
| has the ability to | — (use verb directly) |
| makes it possible to | enables, allows |
| provides support for | supports |
| provides a way to | enables, allows |
| does validation | validates |
| does processing | processes |
| gets the value | retrieves, fetches, reads |
| has a dependency on | depends on, requires |
| is a wrapper for | wraps |
| makes a call to | calls, invokes |
| performs a check | checks, verifies |
| there is/are | — (restructure sentence) |
| it is important to | — (state directly) |
| in order to | to |
| due to the fact that | because |
| at this point in time | now |
| in the event that | if |
| prior to | before |
| subsequent to | after |
| a number of | several, many, specific number |
| the majority of | most |

---

## Writing Examples

### Function Documentation

**Correct:**

```javascript
/**
 * Generate a cryptographically secure password.
 *
 * @param {number} length - Password length in characters
 * @returns {string} Generated password
 * @throws {ValidationError} Length below minimum threshold
 */
function generatePassword(length) { }
```

**Incorrect:**

```javascript
/**
 * This function can be used to generate a password that will be
 * cryptographically secure.
 *
 * @param {number} length - The length that the password should have
 * @returns {string} A password will be returned
 * @throws {ValidationError} May be thrown if length is invalid
 */
function generatePassword(length) { }
```

### README Sections

**Correct:**

```markdown
## Installation

Install the package:

npm install @anthropic/password-generator

Import the generator:

import { PasswordService } from '@anthropic/password-generator';

## Features

- Generate passwords with configurable entropy
- Calculate password strength in real time
- Store configurations in local storage
```

**Incorrect:**

```markdown
## Installation

You will need to install the package by running:

npm install @anthropic/password-generator

Then you can import the generator:

import { PasswordService } from '@anthropic/password-generator';

## Features

- You can generate passwords with configurable entropy
- Password strength can be calculated in real time
- There is support for storing configurations in local storage
```

### Error Messages

**Correct:**

```javascript
throw new ValidationError('Specify a password length of at least 8 characters');
throw new ConfigError('Set the CRYPTO_SEED environment variable');
```

**Incorrect:**

```javascript
throw new ValidationError('Password length should be at least 8 characters');
throw new ConfigError('You need to set the CRYPTO_SEED environment variable');
```

### Architecture Documentation

**Correct:**

```markdown
## Port Interfaces

Port interfaces abstract external dependencies from core business logic.
The `RandomGeneratorPort` defines methods for cryptographic random generation.
Adapters implement these ports for specific environments (Node.js, browser).

Inject adapters at application startup:

const service = new PasswordService({ randomGenerator: new NodeCryptoRandom() });
```

**Incorrect:**

```markdown
## Port Interfaces

All external dependencies are abstracted through port interfaces.
The `RandomGeneratorPort` is used to define methods that can be used for
cryptographic random generation. These ports will be implemented by adapters
for specific environments (Node.js, browser).

Adapters should be injected at application startup:

const service = new PasswordService({ randomGenerator: new NodeCryptoRandom() });
```

---

## Formatting Standards

### Headings

- Use sentence case for headings
- Keep headings concise (under 6 words)
- Start with a verb for action-oriented sections

### Code Examples

- Include runnable code snippets
- Show both usage and expected output
- Precede code blocks with a brief introduction ending in a colon

### Lists

- Start each item with a verb (for instructions) or noun (for features)
- Maintain parallel structure across items
- Limit lists to 7 items; group longer lists into categories

### Links

- Use descriptive link text (never "click here" or "this link")
- Link to specific sections when referencing other documentation

---

## PR Documentation Review Checklist

Copy this checklist into documentation PRs:

```markdown
### Documentation Review

- [ ] **Active voice**: Every sentence uses active voice
- [ ] **Present/imperative tense**: No future tense ("will", "would")
- [ ] **No hedging**: Removed "might", "could", "should", "can", "may"
- [ ] **Strong verbs**: Replaced "is", "has", "make", "provide", "get"
- [ ] **No "you"**: Removed second person unless addressing the reader directly in tutorials
- [ ] **No "there is/are"**: Restructured existential constructions
- [ ] **Concise**: Removed filler words ("very", "really", "actually", "basically")
- [ ] **Parallel structure**: List items follow consistent grammatical patterns
- [ ] **Code examples**: All examples run without modification
- [ ] **Links work**: Verified all internal and external links
```

---

## Quick Reference Card

### Always Use

- Active voice
- Present tense
- Imperative mood for instructions
- Specific action verbs
- Direct statements

### Never Use

- Passive voice
- Future tense
- Hedging words (might, could, should, can, may)
- Weak verbs (is, has, make, provide)
- Filler phrases (in order to, due to the fact that)
- Second person in reference docs (save for tutorials)

### Before Publishing

1. Read aloud — awkward phrasing becomes obvious
2. Search for banned words — use find/replace
3. Check every "is" and "are" — most convert to stronger verbs
4. Verify code examples — run them
5. Review against checklist — check every box

---

## Resources

- [Apple Style Guide](https://support.apple.com/guide/applestyleguide/welcome/web)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/)
