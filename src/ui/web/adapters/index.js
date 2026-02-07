// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Browser adapter exports for Web UI.
 *
 * These adapters implement the port interfaces from packages/core
 * using browser-native APIs.
 */

export { BrowserCryptoRandom } from './BrowserCryptoRandom.js';
export { BrowserStorage } from './BrowserStorage.js';
export { BrowserClock } from './BrowserClock.js';
