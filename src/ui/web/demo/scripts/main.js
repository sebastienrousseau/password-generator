// Copyright 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Password Generator Demo - Main Entry Point
 *
 * This demo uses the WebUIController from the thin adapter layer,
 * which delegates all business logic to packages/core.
 */

import { initTheme } from './theme.js';
import { createWebUIController } from '../../controllers/WebUIController.js';
import { FormState } from '../../state/FormState.js';

// Preset configurations
const PRESETS = {
  quick: { type: 'strong', length: 14, iteration: 4, separator: '-' },
  secure: { type: 'strong', length: 24, iteration: 6, separator: '-' },
  memorable: { type: 'memorable', length: 4, iteration: 4, separator: '-' },
};

// State
let controller;
let currentPassword = null;
let isPasswordVisible = true;

// DOM Elements
const elements = {
  form: null,
  typeInputs: null,
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
  copyBtn: null,
  toggleVisibilityBtn: null,
  visibilityText: null,
  regenerateBtn: null,
  presetBtns: null,
  toast: null,
};

/**
 * Initializes DOM element references.
 */
function initElements() {
  elements.form = document.getElementById('password-form');
  elements.typeInputs = document.querySelectorAll('input[name="type"]');
  elements.lengthInput = document.getElementById('length');
  elements.lengthGroup = document.getElementById('length-group');
  elements.iterationInput = document.getElementById('iteration');
  elements.iterationLabel = document.getElementById('iteration-label-text');
  elements.separatorInput = document.getElementById('separator');
  elements.generateBtn = document.getElementById('generate-btn');
  elements.generateText = document.getElementById('generate-text');
  elements.generateLoading = document.getElementById('generate-loading');
  elements.passwordValue = document.getElementById('password-value');
  elements.passwordActions = document.getElementById('password-actions');
  elements.strengthIndicator = document.getElementById('strength-indicator');
  elements.strengthLabel = document.getElementById('strength-label');
  elements.strengthBits = document.getElementById('strength-bits');
  elements.copyBtn = document.getElementById('copy-btn');
  elements.toggleVisibilityBtn = document.getElementById('toggle-visibility-btn');
  elements.visibilityText = document.getElementById('visibility-text');
  elements.regenerateBtn = document.getElementById('regenerate-btn');
  elements.presetBtns = document.querySelectorAll('.preset-btn');
  elements.toast = document.getElementById('toast');
}

/**
 * Gets the current form state.
 * @returns {FormState} The current form state.
 */
function getFormState() {
  const selectedType = document.querySelector('input[name="type"]:checked');

  return new FormState({
    type: selectedType?.value || 'strong',
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
  const isMemorableType = type === 'memorable';

  // Show/hide length field for memorable type
  elements.lengthGroup.classList.toggle('hidden', isMemorableType);

  // Update iteration label
  elements.iterationLabel.textContent = isMemorableType ? 'Words' : 'Chunks';

  // Update hints
  const iterationHint = document.getElementById('iteration-hint');
  if (iterationHint) {
    iterationHint.textContent = isMemorableType
      ? 'Number of words to generate'
      : 'Number of segments to generate';
  }
}

/**
 * Applies a preset configuration.
 * @param {string} presetName - The preset name.
 */
function applyPreset(presetName) {
  const preset = PRESETS[presetName];
  if (!preset) return;

  // Update form values
  const typeInput = document.querySelector(`input[name="type"][value="${preset.type}"]`);
  if (typeInput) typeInput.checked = true;

  elements.lengthInput.value = preset.length;
  elements.iterationInput.value = preset.iteration;
  elements.separatorInput.value = preset.separator;

  // Update UI
  updateUIForType(preset.type);

  // Update preset button states
  elements.presetBtns.forEach(btn => {
    btn.classList.toggle('preset-btn--active', btn.dataset.preset === presetName);
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
  elements.passwordActions.classList.add('hidden');
  elements.strengthIndicator.classList.add('hidden');
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

  // Show actions
  elements.passwordActions.classList.remove('hidden');

  // Update strength indicator
  updateStrengthIndicator(result);

  // Announce to screen readers
  announceToScreenReader(`Password generated: ${result.strengthIndicator.label} strength with ${Math.round(result.entropyBits)} bits of entropy`);
}

/**
 * Updates the password display based on visibility.
 */
function updatePasswordDisplay() {
  if (!currentPassword) return;

  if (isPasswordVisible) {
    elements.passwordValue.innerHTML = `<span class="select-all font-mono">${escapeHtml(currentPassword)}</span>`;
    elements.visibilityText.textContent = 'Hide';
  } else {
    const masked = currentPassword.slice(0, 3) + '•'.repeat(Math.max(0, currentPassword.length - 6)) + currentPassword.slice(-3);
    elements.passwordValue.innerHTML = `<span class="font-mono">${escapeHtml(masked)}</span>`;
    elements.visibilityText.textContent = 'Show';
  }
}

/**
 * Updates the strength indicator.
 * @param {Object} result - The generation result.
 */
function updateStrengthIndicator(result) {
  const { strengthIndicator, entropyBits } = result;

  elements.strengthIndicator.classList.remove('hidden');
  elements.strengthIndicator.className = `strength strength--${strengthIndicator.level}`;

  // Update dots
  const dots = elements.strengthIndicator.querySelectorAll('.strength__dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('strength__dot--filled', index < strengthIndicator.dots);
  });

  // Update labels
  elements.strengthLabel.textContent = `${strengthIndicator.label}`;
  elements.strengthBits.textContent = `${Math.round(entropyBits)}-bit`;
}

/**
 * Announces a message to screen readers.
 * @param {string} message - The message to announce.
 */
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
}

/**
 * Copies the password to clipboard.
 */
async function copyToClipboard() {
  if (!currentPassword) return;

  try {
    await navigator.clipboard.writeText(currentPassword);
    showToast('Copied to clipboard!', 'success');
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
    } catch {
      showToast('Failed to copy. Please copy manually.', 'error');
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

  // Type change
  elements.typeInputs.forEach(input => {
    input.addEventListener('change', () => {
      updateUIForType(input.value);
      // Clear active preset
      elements.presetBtns.forEach(btn => btn.classList.remove('preset-btn--active'));
    });
  });

  // Preset buttons
  elements.presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyPreset(btn.dataset.preset);
    });
  });

  // Copy button
  elements.copyBtn.addEventListener('click', copyToClipboard);

  // Toggle visibility
  elements.toggleVisibilityBtn.addEventListener('click', () => {
    isPasswordVisible = !isPasswordVisible;
    updatePasswordDisplay();
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
