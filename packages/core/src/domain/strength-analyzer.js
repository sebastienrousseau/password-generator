// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure domain logic for password strength analysis with zxcvbn-style scoring.
 * Provides pattern detection, dictionary checks, and weakness analysis.
 *
 * @module strength-analyzer
 */

/**
 * Common patterns that weaken passwords
 */
export const WEAKNESS_PATTERNS = {
  sequence:
    /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/gi,
  reverseSequence:
    /(?:zyx|yxw|xwv|wvu|vut|uts|tsr|srq|rqp|qpo|pon|onm|nml|mlk|lkj|kji|jih|ihg|hgf|gfe|fed|edc|dcb|cba|987|876|765|654|543|432|321|210)/gi,
  qwertyRow:
    /(?:qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|zxcv|xcvb|cvbn|vbnm)/gi,
  qwertyCol: /(?:qaz|wsx|edc|rfv|tgb|yhn|ujm|ik)/gi,
  repeated: /(.)\1{2,}/g,
  alternating: /(.)(.)(\1\2){2,}/g,
  leetSpeak: /[4@]s|[3€]e|[1!]i|[0o]|[5$]s|7t/gi,
};

/**
 * Strength scoring constants
 */
export const STRENGTH_CONSTANTS = {
  VERY_WEAK: 0,
  WEAK: 1,
  FAIR: 2,
  GOOD: 3,
  STRONG: 4,
  ENTROPY_THRESHOLDS: [20, 40, 60, 80],
  PATTERN_PENALTIES: {
    sequence: 0.9,
    reverse_sequence: 0.9,
    keyboard_row: 0.85,
    keyboard_column: 0.85,
    repetition: 0.8,
    alternating: 0.7,
    leet_speak: 0.5,
  },
  DICTIONARY_PENALTIES: {
    common_passwords: 1.0,
    english_words: 0.7,
    reversed_words: 0.8,
  },
};

/**
 * Common weak passwords (subset for performance)
 */
export const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "123456",
  "123456789",
  "qwerty",
  "abc123",
  "Password1",
  "welcome",
  "admin",
  "letmein",
  "monkey",
  "dragon",
  "master",
  "hello",
  "freedom",
  "whatever",
  "qazwsx",
  "trustno1",
  "jordan",
  "iloveyou",
  "princess",
  "starwars",
  "shadow",
  "superman",
  "sunshine",
  "michael",
  "computer",
  "football",
  "pepper",
  "mustang",
  "charlie",
]);

/**
 * Common dictionary words (subset for demonstration)
 */
export const COMMON_DICTIONARY = new Set([
  "the",
  "and",
  "for",
  "are",
  "but",
  "not",
  "you",
  "all",
  "can",
  "had",
  "her",
  "was",
  "one",
  "our",
  "out",
  "day",
  "get",
  "has",
  "him",
  "his",
  "how",
  "man",
  "new",
  "now",
  "old",
  "see",
  "two",
  "way",
  "who",
  "boy",
  "did",
  "its",
  "let",
  "put",
  "say",
  "she",
  "too",
  "use",
  "love",
  "time",
  "very",
  "when",
  "come",
  "here",
  "just",
  "like",
  "long",
  "make",
  "many",
  "over",
  "such",
  "take",
  "than",
  "them",
  "well",
  "were",
  "what",
  "year",
  "your",
  "work",
  "life",
  "only",
  "think",
  "first",
  "after",
  "back",
  "other",
  "good",
  "want",
  "give",
]);

/**
 * Detects weakness patterns in a password
 * @param {string} password - Password to analyze
 * @returns {Array<Object>} Array of detected patterns
 */
export const detectWeaknessPatterns = (password) => {
  const patterns = [];

  // Check for sequences
  let matches = password.match(WEAKNESS_PATTERNS.sequence);
  if (matches) {
    patterns.push({
      pattern: "sequence",
      matches: matches,
      score: STRENGTH_CONSTANTS.PATTERN_PENALTIES.sequence,
      description: "Contains alphabetic or numeric sequences",
    });
  }

  matches = password.match(WEAKNESS_PATTERNS.reverseSequence);
  if (matches) {
    patterns.push({
      pattern: "reverse_sequence",
      matches: matches,
      score: STRENGTH_CONSTANTS.PATTERN_PENALTIES.reverse_sequence,
      description: "Contains reverse sequences",
    });
  }

  // Check for keyboard patterns
  matches = password.match(WEAKNESS_PATTERNS.qwertyRow);
  if (matches) {
    patterns.push({
      pattern: "keyboard_row",
      matches: matches,
      score: STRENGTH_CONSTANTS.PATTERN_PENALTIES.keyboard_row,
      description: "Contains keyboard row patterns",
    });
  }

  matches = password.match(WEAKNESS_PATTERNS.qwertyCol);
  if (matches) {
    patterns.push({
      pattern: "keyboard_column",
      matches: matches,
      score: STRENGTH_CONSTANTS.PATTERN_PENALTIES.keyboard_column,
      description: "Contains keyboard column patterns",
    });
  }

  // Check for repetition
  matches = password.match(WEAKNESS_PATTERNS.repeated);
  if (matches) {
    patterns.push({
      pattern: "repetition",
      matches: matches,
      score: STRENGTH_CONSTANTS.PATTERN_PENALTIES.repetition,
      description: "Contains character repetition",
    });
  }

  matches = password.match(WEAKNESS_PATTERNS.alternating);
  if (matches) {
    patterns.push({
      pattern: "alternating",
      matches: matches,
      score: STRENGTH_CONSTANTS.PATTERN_PENALTIES.alternating,
      description: "Contains alternating patterns",
    });
  }

  // Check for leet speak
  matches = password.match(WEAKNESS_PATTERNS.leetSpeak);
  if (matches) {
    patterns.push({
      pattern: "leet_speak",
      matches: matches,
      score: STRENGTH_CONSTANTS.PATTERN_PENALTIES.leet_speak,
      description: "Uses common character substitutions",
    });
  }

  return patterns;
};

/**
 * Checks password against dictionary attacks
 * @param {string} password - Password to check
 * @returns {Array<Object>} Array of dictionary matches
 */
export const checkDictionaryWeakness = (password) => {
  const matches = [];
  const lowerPassword = password.toLowerCase();

  // Check against common passwords
  if (COMMON_PASSWORDS.has(lowerPassword)) {
    matches.push({
      dictionary: "common_passwords",
      word: password,
      score: STRENGTH_CONSTANTS.DICTIONARY_PENALTIES.common_passwords,
      description: "Found in common passwords list",
    });
  }

  // Check for dictionary words
  const words = lowerPassword.split(/[^a-z]/);
  for (const word of words) {
    if (word.length > 3 && COMMON_DICTIONARY.has(word)) {
      matches.push({
        dictionary: "english_words",
        word: word,
        score: STRENGTH_CONSTANTS.DICTIONARY_PENALTIES.english_words,
        description: `Contains dictionary word: ${word}`,
      });
    }
  }

  // Check for reversed dictionary words
  for (const word of words) {
    const reversed = word.split("").reverse().join("");
    if (reversed.length > 3 && COMMON_DICTIONARY.has(reversed)) {
      matches.push({
        dictionary: "reversed_words",
        word: word,
        score: STRENGTH_CONSTANTS.DICTIONARY_PENALTIES.reversed_words,
        description: `Contains reversed dictionary word: ${reversed}`,
      });
    }
  }

  return matches;
};

/**
 * Analyzes password composition and calculates entropy
 * @param {string} password - Password to analyze
 * @returns {Object} Composition analysis
 */
export const analyzePasswordComposition = (password) => {
  const analysis = {
    length: password.length,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSymbols: /[^a-zA-Z0-9]/.test(password),
    uniqueChars: new Set(password).size,
  };

  // Calculate character set size
  let charsetSize = 0;
  if (analysis.hasLowercase) charsetSize += 26;
  if (analysis.hasUppercase) charsetSize += 26;
  if (analysis.hasNumbers) charsetSize += 10;
  if (analysis.hasSymbols) charsetSize += 32; // Approximate

  analysis.charsetSize = charsetSize;
  analysis.entropy = charsetSize > 0 ? Math.log2(charsetSize) * password.length : 0;

  return analysis;
};

/**
 * Calculates password strength score based on entropy, patterns, and dictionary
 * @param {Object} composition - Password composition analysis
 * @param {Array} patterns - Detected weakness patterns
 * @param {Array} dictionaries - Dictionary matches
 * @returns {number} Strength score (0-4)
 */
export const calculateStrengthScore = (composition, patterns, dictionaries) => {
  // Base score from entropy
  let score = STRENGTH_CONSTANTS.VERY_WEAK;
  for (let i = 0; i < STRENGTH_CONSTANTS.ENTROPY_THRESHOLDS.length; i++) {
    if (composition.entropy >= STRENGTH_CONSTANTS.ENTROPY_THRESHOLDS[i]) {
      score = i + 1;
    } else {
      break;
    }
  }

  // Heavy penalties for dictionary matches
  if (dictionaries.some((d) => d.dictionary === "common_passwords")) {
    return STRENGTH_CONSTANTS.VERY_WEAK; // Override to weakest
  } else if (dictionaries.length > 0) {
    score = Math.max(STRENGTH_CONSTANTS.VERY_WEAK, score - 2);
  }

  // Pattern penalties
  const patternPenalty = patterns.reduce((sum, p) => sum + (1 - p.score), 0);
  score = Math.max(STRENGTH_CONSTANTS.VERY_WEAK, score - Math.floor(patternPenalty / 2));

  // Ensure score is within bounds
  return Math.max(STRENGTH_CONSTANTS.VERY_WEAK, Math.min(STRENGTH_CONSTANTS.STRONG, score));
};

/**
 * Calculates effective entropy reduced by patterns and dictionary matches
 * @param {Object} composition - Password composition analysis
 * @param {Array} patterns - Detected weakness patterns
 * @param {Array} dictionaries - Dictionary matches
 * @returns {number} Effective entropy in bits
 */
export const calculateEffectiveEntropy = (composition, patterns, dictionaries) => {
  // Start with base entropy
  let effectiveEntropy = composition.entropy;

  // Heavy reduction for common passwords
  if (dictionaries.some((d) => d.dictionary === "common_passwords")) {
    return 1; // Extremely weak
  }

  // Apply reduction based on patterns and dictionary matches
  const patternReduction = patterns.reduce((sum, p) => sum + (1 - p.score), 0) * 0.2;
  const dictionaryReduction = dictionaries.length * 0.1;
  const totalReduction = Math.min(0.8, patternReduction + dictionaryReduction);

  return effectiveEntropy * (1 - totalReduction);
};

/**
 * Generates strength feedback and recommendations
 * @param {number} score - Password strength score (0-4)
 * @param {Array} patterns - Detected weakness patterns
 * @param {Array} dictionaries - Dictionary matches
 * @param {Object} composition - Password composition analysis
 * @returns {Object} Feedback with suggestions and recommendations
 */
export const generateStrengthFeedback = (score, patterns, dictionaries, composition) => {
  const feedback = {
    suggestions: [],
    warning: null,
    recommendations: [],
  };

  // Length recommendations
  if (composition.length < 8) {
    feedback.suggestions.push("Use at least 8 characters");
  } else if (composition.length < 12) {
    feedback.suggestions.push("Consider using 12 or more characters for better security");
  }

  // Character set recommendations
  if (!composition.hasLowercase) {
    feedback.suggestions.push("Add lowercase letters");
  }
  if (!composition.hasUppercase) {
    feedback.suggestions.push("Add uppercase letters");
  }
  if (!composition.hasNumbers) {
    feedback.suggestions.push("Add numbers");
  }
  if (!composition.hasSymbols) {
    feedback.suggestions.push("Add symbols");
  }

  // Pattern-specific feedback
  if (patterns.some((p) => p.pattern === "sequence" || p.pattern === "reverse_sequence")) {
    feedback.suggestions.push("Avoid sequences (e.g., abc, 123)");
  }

  if (patterns.some((p) => p.pattern.includes("keyboard"))) {
    feedback.suggestions.push("Avoid keyboard patterns (e.g., qwerty, asdf)");
  }

  if (patterns.some((p) => p.pattern === "repetition")) {
    feedback.suggestions.push("Avoid repeated characters (e.g., aaa, 111)");
  }

  if (patterns.some((p) => p.pattern === "leet_speak")) {
    feedback.suggestions.push("Predictable substitutions like @ for a are easy to guess");
  }

  // Dictionary-specific feedback
  if (dictionaries.some((d) => d.dictionary === "common_passwords")) {
    feedback.warning = "This is a very common password";
    feedback.suggestions.push("Avoid common passwords");
  }

  if (dictionaries.some((d) => d.dictionary === "english_words")) {
    feedback.suggestions.push("Avoid dictionary words");
  }

  // Overall recommendations
  if (score <= STRENGTH_CONSTANTS.WEAK) {
    feedback.recommendations.push("Consider using a password manager");
    feedback.recommendations.push("Use a passphrase with multiple random words");
  } else if (score <= STRENGTH_CONSTANTS.FAIR) {
    feedback.recommendations.push("Consider adding more complexity");
    feedback.recommendations.push("Avoid predictable patterns");
  }

  return feedback;
};

/**
 * Performs comprehensive password strength analysis
 * @param {string} password - Password to analyze
 * @returns {Object} Complete strength analysis with score, feedback, and recommendations
 */
export const analyzePasswordStrength = (password) => {
  if (!password || typeof password !== "string") {
    return {
      score: STRENGTH_CONSTANTS.VERY_WEAK,
      entropy: 0,
      feedback: {
        warning: "Password is required",
        suggestions: ["Enter a password"],
        recommendations: [],
      },
      patterns: [],
      dictionaries: [],
      composition: null,
    };
  }

  // Perform analyses
  const patterns = detectWeaknessPatterns(password);
  const dictionaries = checkDictionaryWeakness(password);
  const composition = analyzePasswordComposition(password);

  // Calculate scores
  const score = calculateStrengthScore(composition, patterns, dictionaries);
  const effectiveEntropy = calculateEffectiveEntropy(composition, patterns, dictionaries);

  // Generate feedback
  const feedback = generateStrengthFeedback(score, patterns, dictionaries, composition);

  return {
    score,
    entropy: Math.round(effectiveEntropy * 100) / 100,
    feedback,
    patterns,
    dictionaries,
    composition,
    details: {
      baseEntropy: composition.entropy,
      effectiveEntropy,
      reductionFactors: {
        patterns: patterns.length,
        dictionaries: dictionaries.length,
        commonPassword: dictionaries.some((d) => d.dictionary === "common_passwords"),
      },
    },
  };
};

/**
 * Gets human-readable strength label
 * @param {number} score - Password score (0-4)
 * @returns {string} Strength label
 */
export const getStrengthLabel = (score) => {
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return labels[score] || "Unknown";
};

/**
 * Gets strength color for UI display
 * @param {number} score - Password score (0-4)
 * @returns {string} CSS color value
 */
export const getStrengthColor = (score) => {
  const colors = [
    "#d73502", // Very Weak - Red
    "#f56500", // Weak - Orange-Red
    "#f7a800", // Fair - Orange
    "#8bc34a", // Good - Light Green
    "#4caf50", // Strong - Green
  ];
  return colors[score] || "#666";
};
