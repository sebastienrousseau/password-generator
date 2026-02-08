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

// DOM Elements
const elements = {
  form: null,
  typeSelect: null,
  lengthInput: null,
  lengthGroup: null,
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
  copyBtn: null,
  toggleVisibilityBtn: null,
  visibilityText: null,
  regenerateBtn: null,
  toast: null,
  srAnnouncements: null,
};

/**
 * Initializes DOM element references.
 */
function initElements() {
  elements.form = document.getElementById('password-form');
  elements.typeSelect = document.getElementById('type');
  elements.lengthInput = document.getElementById('length');
  elements.lengthGroup = document.getElementById('length-group');
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
  elements.copyBtn = document.getElementById('copy-btn');
  elements.toggleVisibilityBtn = document.getElementById('toggle-visibility-btn');
  elements.visibilityText = document.getElementById('visibility-text');
  elements.regenerateBtn = document.getElementById('regenerate-btn');
  elements.toast = document.getElementById('toast');
  elements.srAnnouncements = document.getElementById('sr-announcements');
}

/**
 * Gets the current form state.
 * @returns {FormState} The current form state.
 */
function getFormState() {
  return new FormState({
    type: elements.typeSelect?.value || 'strong',
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
  // Pronounceable uses syllables with length parameter
  const isPronounceableType = type === 'pronounceable';

  // Show/hide length field
  // Hide for word-based types (memorable, diceware) and quantum
  elements.lengthGroup.classList.toggle('hidden', isWordBasedType || isQuantumType);

  // Hide chunks and separator for quantum (single high-entropy string)
  const iterationGroup = elements.iterationInput.closest('.form-group--inline');
  const separatorGroup = elements.separatorInput.closest('.form-group--inline');
  if (iterationGroup) {
    iterationGroup.classList.toggle('hidden', isQuantumType);
  }
  if (separatorGroup) {
    separatorGroup.classList.toggle('hidden', isQuantumType);
  }

  // Update iteration label based on type
  if (isWordBasedType) {
    elements.iterationLabel.textContent = 'Words';
  } else if (isPronounceableType) {
    elements.iterationLabel.textContent = 'Syllables';
  } else {
    elements.iterationLabel.textContent = 'Chunks';
  }

  // Update hints
  const iterationHint = document.getElementById('iteration-hint');
  if (iterationHint) {
    if (isWordBasedType) {
      iterationHint.textContent = 'Number of words to generate';
    } else if (isPronounceableType) {
      iterationHint.textContent = 'Number of syllable groups';
    } else {
      iterationHint.textContent = 'Number of segments to generate';
    }
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

  // Update form values
  if (elements.typeSelect) {
    elements.typeSelect.value = preset.type;
  }

  if (preset.length) {
    elements.lengthInput.value = preset.length;
  }
  elements.iterationInput.value = preset.iteration;
  elements.separatorInput.value = preset.separator;

  // Update UI
  updateUIForType(preset.type);
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

  // Announce to screen readers
  announceToScreenReader(
    `Password generated: ${result.strengthIndicator.label} strength with ${Math.round(
      result.entropyBits
    )} bits of entropy`
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
 * Copies the password to clipboard.
 */
async function copyToClipboard() {
  if (!currentPassword) {
    return;
  }

  try {
    await navigator.clipboard.writeText(currentPassword);
    showToast('Copied to clipboard!', 'success');
    announceToScreenReader('Password copied to clipboard');
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
      showToast('Copied to clipboard!', 'success');
      announceToScreenReader('Password copied to clipboard');
    } catch {
      showToast('Failed to copy. Please copy manually.', 'error');
      announceToScreenReader('Failed to copy password. Please copy manually.');
    }

    document.body.removeChild(textarea);
  }
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

  // Type change (dropdown)
  if (elements.typeSelect) {
    elements.typeSelect.addEventListener('change', () => {
      updateUIForType(elements.typeSelect.value);
    });
  }

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
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generatePassword();
    }

    // Ctrl/Cmd + C when password is focused to copy
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && currentPassword) {
      const selection = window.getSelection();
      if (selection && selection.toString() === '') {
        // No text selected, copy password
        e.preventDefault();
        copyToClipboard();
      }
    }
  });
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

  // Apply default preset
  applyPreset('quick');

  // Generate initial password
  await generatePassword();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
