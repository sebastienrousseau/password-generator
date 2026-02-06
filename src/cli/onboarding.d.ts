// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

export interface OnboardingConfig {
  type: string;
  length?: number;
  iteration: number;
  separator: string;
}

export declare class OnboardingFlow {
  constructor();

  start(onCompleteCallback: (config: OnboardingConfig) => void): void;
}

export declare function startOnboarding(onComplete: (config: OnboardingConfig) => void): void;