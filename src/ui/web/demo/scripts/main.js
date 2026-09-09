// Copyright 2022-2026 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * JavaScript Password Generator (jspassgen) Demo - Main Entry Point
 *
 * This demo uses the WebUIController from the thin adapter layer,
 * which delegates all business logic to packages/core.
 */

import { initTheme } from './theme.js';
import { createWebUIController } from '../../controllers/WebUIController.js';
import { FormState } from '../../state/FormState.js';
import { PRESET_PROFILES } from '../../../../config.js';

// Use shared preset configurations from config.js
// Extended with additional presets for web UI
const PRESETS = {
  ...PRESET_PROFILES,
  'quantum-resistant': PRESET_PROFILES.quantum,
};

// State
let controller;
let currentPassword = null;
let isPasswordVisible = true;
let passwordHistory = [];
const MAX_HISTORY = 5;
const STORAGE_KEY_HISTORY = 'jspassgen_history';
const STORAGE_KEY_ONBOARDING = 'jspassgen_onboarding_seen';

// DOM Elements
const elements = {
  form: null,
  typeInput: null,
  typeButtons: null,
  lengthInput: null,
  lengthOutput: null,
  lengthGroup: null,
  advancedOptions: null,
  iterationInput: null,
  iterationLabel: null,
  separatorInput: null,
  generateBtn: null,
  generateText: null,
  generateLoading: null,
  passwordValue: null,
  passwordActions: null,
  strengthIndicator: null,
  strengthLabel: null,
  strengthBits: null,
  strengthDescription: null,
  crackTime: null,
  copyBtn: null,
  toggleVisibilityBtn: null,
  visibilityText: null,
  regenerateBtn: null,
  toast: null,
  srAnnouncements: null,
  onboardingBanner: null,
  historyList: null,
  historyCount: null,
};

/**
 * Initializes DOM element references.
 */
function initElements() {
  elements.form = document.getElementById('password-form');
  elements.typeInput = document.getElementById('type');
  elements.typeButtons = document.querySelectorAll('.segmented-control__btn');
  elements.lengthInput = document.getElementById('length');
  elements.lengthOutput = document.getElementById('length-output');
  elements.lengthGroup = document.getElementById('length-group');
  elements.advancedOptions = document.getElementById('advanced-options');
  elements.iterationInput = document.getElementById('iteration');
  elements.iterationLabel = document.getElementById('iteration-label');
  elements.separatorInput = document.getElementById('separator');
  elements.generateBtn = document.getElementById('generate-btn');
  elements.generateText = document.getElementById('generate-text');
  elements.generateLoading = document.getElementById('generate-loading');
  elements.passwordValue = document.getElementById('password-value');
  elements.passwordActions = document.getElementById('password-actions');
  elements.strengthIndicator = document.getElementById('strength-indicator');
  elements.strengthLabel = document.getElementById('strength-label');
  elements.strengthBits = document.getElementById('strength-bits');
  elements.strengthDescription = document.getElementById('strength-description');
  elements.crackTime = document.getElementById('crack-time');
  elements.copyBtn = document.getElementById('copy-btn');
  elements.toggleVisibilityBtn = document.getElementById('toggle-visibility-btn');
  elements.visibilityText = document.getElementById('visibility-text');
  elements.regenerateBtn = document.getElementById('regenerate-btn');
  elements.toast = document.getElementById('toast');
  elements.srAnnouncements = document.getElementById('sr-announcements');
  elements.onboardingBanner = document.getElementById('onboarding-banner');
  elements.historyList = document.getElementById('history-list');
  elements.historyCount = document.getElementById('history-count');
}

/**
 * Gets the current form state.
 * @returns {FormState} The current form state.
 */
function getFormState() {
  return new FormState({
    type: elements.typeInput?.value || 'strong',
    length: elements.lengthInput.value,
    iteration: elements.iterationInput.value,
    separator: elements.separatorInput.value,
  });
}

/**
 * Updates the UI based on password type selection.
 * @param {string} type - The selected password type.
 */
function updateUIForType(type) {
  // Word-based types use iteration for word count, not length
  const isWordBasedType = ['memorable', 'diceware'].includes(type);
  // Quantum generates a single high-entropy string with fixed parameters
  const isQuantumType = type === 'quantum-resistant';
  // Pronounceable uses CVVC syllables (4 chars each), only iteration matters
  const isPronounceableType = type === 'pronounceable';

  // Show/hide length slider
  // Hide for word-based types, quantum, and pronounceable (uses fixed 4-char syllables)
  elements.lengthGroup.classList.toggle('hidden', isWordBasedType || isQuantumType || isPronounceableType);

  // Hide advanced options for quantum (single high-entropy string)
  if (elements.advancedOptions) {
    elements.advancedOptions.classList.toggle('hidden', isQuantumType);
    // Close advanced options when switching types
    if (isQuantumType) {
      elements.advancedOptions.removeAttribute('open');
    }
  }

  // Update iteration label based on type
  if (isWordBasedType) {
    elements.iterationLabel.textContent = 'Words';
  } else if (isPronounceableType) {
    elements.iterationLabel.textContent = 'Syllables';
  } else {
    elements.iterationLabel.textContent = 'Chunks';
  }
}

/**
 * Applies a preset configuration.
 * @param {string} presetName - The preset name.
 */
function applyPreset(presetName) {
  const preset = PRESETS[presetName];
  if (!preset) {
    return;
  }

  // Update hidden type input
  if (elements.typeInput) {
    elements.typeInput.value = preset.type;
  }

  // Update button selection
  selectTypeButton(preset.type);

  if (preset.length) {
    elements.lengthInput.value = preset.length;
  }
  elements.iterationInput.value = preset.iteration;
  elements.separatorInput.value = preset.separator;

  // Update UI
  updateUIForType(preset.type);
}

/**
 * Selects a type button and updates ARIA states.
 * @param {string} type - The type to select.
 */
function selectTypeButton(type) {
  elements.typeButtons.forEach((btn) => {
    const isSelected = btn.dataset.type === type;
    btn.classList.toggle('segmented-control__btn--active', isSelected);
    btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
    btn.setAttribute('tabindex', isSelected ? '0' : '-1');
  });
}

/**
 * Shows a toast notification.
 * @param {string} message - The message to show.
 * @param {'success'|'error'} type - The toast type.
 */
function showToast(message, type = 'success') {
  elements.toast.textContent = message;
  elements.toast.className = `toast toast--${type} toast--visible`;

  setTimeout(() => {
    elements.toast.classList.remove('toast--visible');
  }, 2500);
}

/**
 * Sets the loading state.
 * @param {boolean} isLoading - Whether loading.
 */
function setLoading(isLoading) {
  elements.generateBtn.disabled = isLoading;
  elements.generateText.classList.toggle('hidden', isLoading);
  elements.generateLoading.classList.toggle('hidden', !isLoading);
}

/**
 * Displays an error.
 * @param {string} message - The error message.
 */
function showError(message) {
  elements.passwordValue.innerHTML = `<span class="text-error">${escapeHtml(message)}</span>`;
  // Keep password actions visible so user can regenerate
  // Only hide the copy/visibility actions, keep regenerate visible
  elements.copyBtn.disabled = true;
  elements.toggleVisibilityBtn.disabled = true;
  elements.strengthIndicator.classList.add('hidden');
  currentPassword = null;
}

/**
 * Escapes HTML characters.
 * @param {string} text - Text to escape.
 * @returns {string} Escaped text.
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Displays the generated password.
 * @param {Object} result - The generation result.
 */
function displayPassword(result) {
  currentPassword = result.password;
  isPasswordVisible = true;

  // Display password
  updatePasswordDisplay();

  // Show and enable actions
  elements.passwordActions.classList.remove('hidden');
  elements.copyBtn.disabled = false;
  elements.toggleVisibilityBtn.disabled = false;

  // Update strength indicator
  updateStrengthIndicator(result);

  // Add to password history
  addToHistory(result.password);

  // Announce to screen readers with actionable guidance
  const entropyBits = Math.round(result.entropyBits);
  const strengthLabel = result.strengthIndicator.label;
  const passwordLength = result.password.length;
  announceToScreenReader(
    `Password generated: ${passwordLength} characters, ${strengthLabel} strength, ${entropyBits} bits of entropy. ` +
    `Press Tab to copy or Ctrl+C to copy directly.`
  );
}

/**
 * Updates the password display based on visibility.
 */
function updatePasswordDisplay() {
  if (!currentPassword) {
    return;
  }

  if (isPasswordVisible) {
    elements.passwordValue.innerHTML = `<span class="select-all font-mono">${escapeHtml(
      currentPassword
    )}</span>`;
    elements.visibilityText.textContent = 'Hide';
    elements.toggleVisibilityBtn.setAttribute('aria-pressed', 'true');
    elements.toggleVisibilityBtn.setAttribute('aria-label', 'Hide password (currently visible)');
  } else {
    const masked =
      currentPassword.slice(0, 3) +
      '•'.repeat(Math.max(0, currentPassword.length - 6)) +
      currentPassword.slice(-3);
    elements.passwordValue.innerHTML = `<span class="font-mono">${escapeHtml(masked)}</span>`;
    elements.visibilityText.textContent = 'Show';
    elements.toggleVisibilityBtn.setAttribute('aria-pressed', 'false');
    elements.toggleVisibilityBtn.setAttribute('aria-label', 'Show password (currently hidden)');
  }
}

/**
 * Updates the strength indicator.
 * @param {Object} result - The generation result.
 */
function updateStrengthIndicator(result) {
  const { strengthIndicator, entropyBits } = result;
  const roundedBits = Math.round(entropyBits);

  elements.strengthIndicator.classList.remove('hidden');
  elements.strengthIndicator.className = `strength strength--${strengthIndicator.level}`;

  // Update ARIA attributes for the meter (WCAG 2.2 AAA)
  elements.strengthIndicator.setAttribute('aria-valuenow', strengthIndicator.dots);
  elements.strengthIndicator.setAttribute(
    'aria-valuetext',
    `${strengthIndicator.label} strength, ${roundedBits} bits of entropy`
  );

  // Update dots
  const dots = elements.strengthIndicator.querySelectorAll('.strength__dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('strength__dot--filled', index < strengthIndicator.dots);
  });

  // Update labels
  elements.strengthLabel.textContent = `${strengthIndicator.label}`;
  elements.strengthBits.textContent = `${roundedBits}-bit`;

  // Update screen reader description
  if (elements.strengthDescription) {
    elements.strengthDescription.textContent = `Password strength: ${strengthIndicator.label} with ${roundedBits} bits of entropy`;
  }

  // Update crack time estimate
  if (elements.crackTime) {
    const crackTime = calculateCrackTime(roundedBits);
    elements.crackTime.innerHTML = `<span aria-hidden="true">⏱️</span> Time to crack: <strong>${crackTime}</strong>`;
  }
}

/**
 * Announces a message to screen readers using the dedicated live region.
 * @param {string} message - The message to announce.
 */
function announceToScreenReader(message) {
  // Use the dedicated announcement region if available
  if (elements.srAnnouncements) {
    // Clear previous announcement
    elements.srAnnouncements.textContent = '';
    // Small delay to ensure screen readers detect the change
    setTimeout(() => {
      elements.srAnnouncements.textContent = message;
    }, 50);
  } else {
    // Fallback: create temporary announcement element
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => announcement.remove(), 1000);
  }
}

/**
 * Copies the password to clipboard with enhanced feedback.
 */
async function copyToClipboard() {
  if (!currentPassword) {
    return;
  }

  const copySuccess = () => {
    // Visual feedback on button
    elements.copyBtn.classList.add('btn--copied');
    const originalHTML = elements.copyBtn.innerHTML;
    elements.copyBtn.innerHTML = '<span aria-hidden="true">✓</span> Copied!';

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Toast and screen reader
    showToast('Password copied to clipboard', 'success');
    announceToScreenReader(
      'Password copied to clipboard. Press Tab to regenerate or Escape to dismiss.'
    );

    // Reset button after delay
    setTimeout(() => {
      elements.copyBtn.classList.remove('btn--copied');
      elements.copyBtn.innerHTML = originalHTML;
    }, 2000);
  };

  const copyFailed = () => {
    showToast('Failed to copy. Please select and copy manually.', 'error');
    announceToScreenReader(
      'Failed to copy password. Please select the password text and copy manually.'
    );
  };

  try {
    await navigator.clipboard.writeText(currentPassword);
    copySuccess();
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = currentPassword;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      copySuccess();
    } catch {
      copyFailed();
    }

    document.body.removeChild(textarea);
  }
}

/**
 * Shows keyboard shortcuts dialog.
 */
function showShortcutsDialog() {
  const dialog = document.getElementById('shortcuts-dialog');
  if (dialog && dialog.showModal) {
    dialog.showModal();
    announceToScreenReader('Keyboard shortcuts dialog opened. Press Escape to close.');
  }
}

/**
 * Closes keyboard shortcuts dialog.
 */
function closeShortcutsDialog() {
  const dialog = document.getElementById('shortcuts-dialog');
  if (dialog && dialog.close) {
    dialog.close();
  }
}

/**
 * Shows accessibility statement dialog.
 */
function showAccessibilityDialog() {
  const dialog = document.getElementById('accessibility-dialog');
  if (dialog && dialog.showModal) {
    dialog.showModal();
    announceToScreenReader('Accessibility statement dialog opened. Press Escape to close.');
  }
}

/**
 * Closes accessibility statement dialog.
 */
function closeAccessibilityDialog() {
  const dialog = document.getElementById('accessibility-dialog');
  if (dialog && dialog.close) {
    dialog.close();
  }
}

/**
 * Calculates estimated time to crack password.
 * @param {number} entropy - Entropy in bits.
 * @returns {string} Human-readable time estimate.
 */
function calculateCrackTime(entropy) {
  // Assume 10 billion guesses per second (modern GPU cluster)
  const guessesPerSecond = 10000000000;
  const totalCombinations = Math.pow(2, entropy);
  const secondsToCrack = totalCombinations / (2 * guessesPerSecond);

  if (secondsToCrack < 1) return 'instantly';
  if (secondsToCrack < 60) return `${Math.ceil(secondsToCrack)} seconds`;
  if (secondsToCrack < 3600) return `${Math.ceil(secondsToCrack / 60)} minutes`;
  if (secondsToCrack < 86400) return `${Math.ceil(secondsToCrack / 3600)} hours`;
  if (secondsToCrack < 31536000) return `${Math.ceil(secondsToCrack / 86400)} days`;
  const secondsPerYear = 31536000;
  if (secondsToCrack < secondsPerYear * 100) {
    return `${Math.ceil(secondsToCrack / secondsPerYear)} years`;
  }
  if (secondsToCrack < secondsPerYear * 1e6) {
    return `${Math.ceil(secondsToCrack / (secondsPerYear * 1e3))}k years`;
  }
  if (secondsToCrack < secondsPerYear * 1e9) {
    return `${Math.ceil(secondsToCrack / (secondsPerYear * 1e6))}M years`;
  }
  return 'billions of years';
}

/**
 * Shows onboarding banner for first-time users.
 */
function showOnboarding() {
  const hasSeenOnboarding = localStorage.getItem(STORAGE_KEY_ONBOARDING);
  if (!hasSeenOnboarding && elements.onboardingBanner) {
    elements.onboardingBanner.classList.remove('hidden');
  }
}

/**
 * Dismisses onboarding banner.
 */
function dismissOnboarding() {
  if (elements.onboardingBanner) {
    elements.onboardingBanner.classList.add('hidden');
    localStorage.setItem(STORAGE_KEY_ONBOARDING, 'true');
  }
}

/**
 * Loads password history from localStorage.
 */
function loadPasswordHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (stored) {
      passwordHistory = JSON.parse(stored);
      renderPasswordHistory();
    }
  } catch {
    passwordHistory = [];
  }
}

/**
 * Saves password history to localStorage.
 */
function savePasswordHistory() {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(passwordHistory));
  } catch {
    // localStorage may be full or disabled
  }
}

/**
 * Adds a password to history.
 * @param {string} password - The password to add.
 */
function addToHistory(password) {
  // Don't add duplicates
  if (passwordHistory.includes(password)) return;

  passwordHistory.unshift(password);
  if (passwordHistory.length > MAX_HISTORY) {
    passwordHistory.pop();
  }
  savePasswordHistory();
  renderPasswordHistory();
}

/**
 * Renders password history list.
 */
function renderPasswordHistory() {
  if (!elements.historyList || !elements.historyCount) return;

  elements.historyCount.textContent = `(${passwordHistory.length})`;

  if (passwordHistory.length === 0) {
    elements.historyList.innerHTML =
      '<li class="password-history__empty">No passwords generated yet</li>';
    return;
  }

  elements.historyList.innerHTML = passwordHistory
    .map((pwd, index) => {
      const masked = pwd.length > 20 ? pwd.slice(0, 10) + '...' + pwd.slice(-6) : pwd;
      return `
        <li class="password-history__item">
          <span class="password-history__password" title="${escapeHtml(pwd)}">${escapeHtml(masked)}</span>
          <button type="button" class="password-history__copy" data-index="${index}" aria-label="Copy this password">Copy</button>
        </li>
      `;
    })
    .join('');

  // Add click handlers to copy buttons
  elements.historyList.querySelectorAll('.password-history__copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const index = parseInt(btn.dataset.index, 10);
      const pwd = passwordHistory[index];
      if (pwd) {
        try {
          await navigator.clipboard.writeText(pwd);
          showToast('Copied from history', 'success');
          announceToScreenReader('Password copied from history');
        } catch {
          showToast('Failed to copy', 'error');
        }
      }
    });
  });
}

/**
 * Clears password history.
 */
function clearPasswordHistory() {
  passwordHistory = [];
  savePasswordHistory();
  renderPasswordHistory();
  announceToScreenReader('Password history cleared');
  showToast('History cleared', 'success');
}

/**
 * Generates a password.
 */
async function generatePassword() {
  setLoading(true);

  try {
    const formState = getFormState();
    const result = await controller.generate(formState);
    displayPassword(result);
  } catch (error) {
    showError(error.message);
    showToast(error.message, 'error');
  } finally {
    setLoading(false);
  }
}

/**
 * Sets up event listeners.
 */
function setupEventListeners() {
  // Form submit
  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await generatePassword();
  });

  // Type button click handlers
  elements.typeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      elements.typeInput.value = type;
      selectTypeButton(type);
      updateUIForType(type);
      announceToScreenReader(`Selected ${btn.textContent} password type`);
    });

    // Keyboard navigation (arrow keys)
    btn.addEventListener('keydown', (e) => {
      const buttons = Array.from(elements.typeButtons);
      const currentIndex = buttons.indexOf(btn);
      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % buttons.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        btn.click();
        return;
      }

      if (nextIndex !== currentIndex) {
        buttons[nextIndex].focus();
        buttons[nextIndex].click();
      }
    });
  });

  // Length slider value update with ARIA
  const updateSliderValue = () => {
    const value = elements.lengthInput.value;
    elements.lengthOutput.textContent = value;
    elements.lengthInput.setAttribute('aria-valuenow', value);
    elements.lengthInput.setAttribute('aria-valuetext', `${value} characters`);
  };

  elements.lengthInput.addEventListener('input', updateSliderValue);
  updateSliderValue(); // Initialize on load

  // Copy button
  elements.copyBtn.addEventListener('click', copyToClipboard);

  // Toggle visibility
  elements.toggleVisibilityBtn.addEventListener('click', () => {
    isPasswordVisible = !isPasswordVisible;
    updatePasswordDisplay();
    announceToScreenReader(
      isPasswordVisible ? 'Password is now visible' : 'Password is now hidden'
    );
  });

  // Regenerate
  elements.regenerateBtn.addEventListener('click', generatePassword);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in inputs
    const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generatePassword();
      announceToScreenReader('Generating new password');
    }

    // Ctrl/Cmd + C when password exists and no text selected
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && currentPassword) {
      const selection = window.getSelection();
      if (selection && selection.toString() === '') {
        e.preventDefault();
        copyToClipboard();
      }
    }

    // ? to show keyboard shortcuts (when not typing)
    if (e.key === '?' && !isTyping) {
      e.preventDefault();
      showShortcutsDialog();
    }
  });

  // Shortcuts dialog close button
  const closeShortcutsBtn = document.getElementById('close-shortcuts');
  if (closeShortcutsBtn) {
    closeShortcutsBtn.addEventListener('click', closeShortcutsDialog);
  }

  // Close dialog on backdrop click
  const shortcutsDialog = document.getElementById('shortcuts-dialog');
  if (shortcutsDialog) {
    shortcutsDialog.addEventListener('click', (e) => {
      if (e.target === shortcutsDialog) {
        closeShortcutsDialog();
      }
    });
  }

  // Accessibility dialog
  const accessibilityLink = document.getElementById('accessibility-link');
  if (accessibilityLink) {
    accessibilityLink.addEventListener('click', (e) => {
      e.preventDefault();
      showAccessibilityDialog();
    });
  }

  const closeAccessibilityBtn = document.getElementById('close-accessibility');
  if (closeAccessibilityBtn) {
    closeAccessibilityBtn.addEventListener('click', closeAccessibilityDialog);
  }

  const accessibilityDialog = document.getElementById('accessibility-dialog');
  if (accessibilityDialog) {
    accessibilityDialog.addEventListener('click', (e) => {
      if (e.target === accessibilityDialog) {
        closeAccessibilityDialog();
      }
    });
  }

  // Shortcuts link in footer
  const shortcutsLink = document.getElementById('shortcuts-link');
  if (shortcutsLink) {
    shortcutsLink.addEventListener('click', showShortcutsDialog);
  }

  // Onboarding dismiss
  const dismissOnboardingBtn = document.getElementById('dismiss-onboarding');
  if (dismissOnboardingBtn) {
    dismissOnboardingBtn.addEventListener('click', dismissOnboarding);
  }

  // Clear history
  const clearHistoryBtn = document.getElementById('clear-history');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', clearPasswordHistory);
  }
}

/**
 * Initializes the application.
 */
async function init() {
  // Initialize theme
  initTheme();

  // Initialize DOM references
  initElements();

  // Create controller
  controller = createWebUIController();

  // Set up event listeners
  setupEventListeners();

  // Apply default type (strong/random is pre-selected in HTML)
  updateUIForType('strong');

  // Load password history
  loadPasswordHistory();

  // Show onboarding for first-time users
  showOnboarding();

  // Generate initial password
  await generatePassword();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
