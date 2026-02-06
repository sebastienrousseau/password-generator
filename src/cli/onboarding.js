// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

// Bridge module for backward compatibility
// Re-exports functions from the unified onboarding module

export {
  startOnboarding,
  runOnboarding,
  isFirstRun,
  OnboardingFlow
} from "../onboarding.js";
