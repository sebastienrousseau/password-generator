// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

export interface OnboardingConfig {
  type: string;
  length?: number;
  iteration: number;
  separator: string;
}

export interface OnboardingResult {
  config: OnboardingConfig;
  clipboard: boolean;
  preset: string | null;
}

/**
 * Main onboarding flow function
 */
export declare function runOnboarding(): Promise<OnboardingResult>;

/**
 * Check if this is likely a first run
 */
export declare function isFirstRun(args: string[]): boolean;

/**
 * Interactive onboarding flow class
 */
export declare class OnboardingFlow {
  constructor();

  start(onCompleteCallback: (config: OnboardingConfig) => void): void;
  cleanup(): void;
  getCurrentOptions(): string[];
  navigateUp(): void;
  navigateDown(): void;
  confirmSelection(): void;
  showExamples(): void;
  showLearnMore(): void;
  completeOnboarding(): void;
  exitOnboarding(): void;
  getProgressIndicator(): string;
  clearScreen(): void;
  renderCurrentStep(): void;
}

/**
 * Start the interactive onboarding flow
 */
export declare function startOnboarding(onComplete: (config: OnboardingConfig) => void): void;