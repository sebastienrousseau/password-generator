// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Password Strength Analyzer - zxcvbn-style password analysis
 *
 * Provides comprehensive password strength scoring beyond simple entropy,
 * including pattern detection, dictionary checks, and weakness analysis.
 *
 * @module password-strength-analyzer
 */

/**
 * Common patterns that weaken passwords
 */
const COMMON_PATTERNS = {
  // Sequential patterns
  sequence:
    /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/gi,
  reverseSequence:
    /(?:zyx|yxw|xwv|wvu|vut|uts|tsr|srq|rqp|qpo|pon|onm|nml|mlk|lkj|kji|jih|ihg|hgf|gfe|fed|edc|dcb|cba|987|876|765|654|543|432|321|210)/gi,
  // Keyboard patterns
  qwertyRow:
    /(?:qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|zxcv|xcvb|cvbn|vbnm)/gi,
  qwertyCol: /(?:qaz|wsx|edc|rfv|tgb|yhn|ujm|ik)/gi,
  // Repetition patterns
  repeated: /(.)\1{2,}/g,
  alternating: /(.)(.)(\1\2){2,}/g,
  // Common substitutions
  leetSpeak: /[4@][sS]|[3€][eE]|[1!][iI]|[0Oo]|[5$][sS]|7[tT]/g,
};

/**
 * Common weak passwords and patterns
 */
const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'Password1',
  'welcome',
  'admin',
  'letmein',
  'monkey',
  'dragon',
  'master',
  'hello',
  'freedom',
  'whatever',
  'qazwsx',
  'trustno1',
  'jordan',
  'iloveyou',
  'princess',
  'starwars',
  'shadow',
  'superman',
  'sunshine',
  'michael',
  'computer',
  'football',
  'pepper',
  'mustang',
  'charlie',
]);

/**
 * Common dictionary words (subset for demonstration)
 */
const COMMON_DICTIONARY = new Set([
  'the',
  'and',
  'for',
  'are',
  'but',
  'not',
  'you',
  'all',
  'can',
  'had',
  'her',
  'was',
  'one',
  'our',
  'out',
  'day',
  'get',
  'has',
  'him',
  'his',
  'how',
  'man',
  'new',
  'now',
  'old',
  'see',
  'two',
  'way',
  'who',
  'boy',
  'did',
  'its',
  'let',
  'put',
  'say',
  'she',
  'too',
  'use',
  'love',
  'time',
  'very',
  'when',
  'come',
  'here',
  'just',
  'like',
  'long',
  'make',
  'many',
  'over',
  'such',
  'take',
  'than',
  'them',
  'well',
  'were',
  'what',
  'year',
  'your',
  'work',
  'life',
  'only',
  'think',
  'first',
  'after',
  'back',
  'other',
  'good',
  'want',
  'give',
]);

/**
 * Analyzes a password for common patterns
 * @param {string} password - Password to analyze
 * @returns {Array<Object>} Array of detected patterns
 */
function detectPatterns(password) {
  const patterns = [];

  // Check for sequences
  let matches = password.match(COMMON_PATTERNS.sequence);
  if (matches) {
    patterns.push({
      pattern: 'sequence',
      matches: matches,
      score: 0.1,
      description: 'Contains alphabetic or numeric sequences',
    });
  }

  matches = password.match(COMMON_PATTERNS.reverseSequence);
  if (matches) {
    patterns.push({
      pattern: 'reverse_sequence',
      matches: matches,
      score: 0.1,
      description: 'Contains reverse sequences',
    });
  }

  // Check for keyboard patterns
  matches = password.match(COMMON_PATTERNS.qwertyRow);
  if (matches) {
    patterns.push({
      pattern: 'keyboard_row',
      matches: matches,
      score: 0.15,
      description: 'Contains keyboard row patterns',
    });
  }

  matches = password.match(COMMON_PATTERNS.qwertyCol);
  if (matches) {
    patterns.push({
      pattern: 'keyboard_column',
      matches: matches,
      score: 0.15,
      description: 'Contains keyboard column patterns',
    });
  }

  // Check for repetition
  matches = password.match(COMMON_PATTERNS.repeated);
  if (matches) {
    patterns.push({
      pattern: 'repetition',
      matches: matches,
      score: 0.2,
      description: 'Contains character repetition',
    });
  }

  matches = password.match(COMMON_PATTERNS.alternating);
  if (matches) {
    patterns.push({
      pattern: 'alternating',
      matches: matches,
      score: 0.3,
      description: 'Contains alternating patterns',
    });
  }

  // Check for leet speak
  matches = password.match(COMMON_PATTERNS.leetSpeak);
  if (matches) {
    patterns.push({
      pattern: 'leet_speak',
      matches: matches,
      score: 0.5,
      description: 'Uses common character substitutions',
    });
  }

  return patterns;
}

/**
 * Checks password against common password dictionaries
 * @param {string} password - Password to check
 * @returns {Array<Object>} Array of dictionary matches
 */
function checkDictionaries(password) {
  const matches = [];
  const lowerPassword = password.toLowerCase();

  // Check against common passwords
  if (COMMON_PASSWORDS.has(lowerPassword)) {
    matches.push({
      dictionary: 'common_passwords',
      word: password,
      score: 0.0,
      description: 'Found in common passwords list',
    });
  }

  // Check for dictionary words (both split words and embedded words)
  const words = lowerPassword.split(/[^a-z]/);
  const foundWords = new Set();

  for (const word of words) {
    if (word.length > 3 && COMMON_DICTIONARY.has(word)) {
      foundWords.add(word);
    }
  }

  // Also check for embedded dictionary words (e.g., 'lovetime' contains 'love' and 'time')
  for (const dictWord of COMMON_DICTIONARY) {
    if (dictWord.length >= 4 && lowerPassword.includes(dictWord)) {
      foundWords.add(dictWord);
    }
  }

  for (const word of foundWords) {
    matches.push({
      dictionary: 'english_words',
      word: word,
      score: 0.3,
      description: `Contains dictionary word: ${word}`,
    });
  }

  // Check for reversed dictionary words
  for (const word of words) {
    const reversed = word.split('').reverse().join('');
    if (reversed.length > 3 && COMMON_DICTIONARY.has(reversed)) {
      matches.push({
        dictionary: 'reversed_words',
        word: word,
        score: 0.2,
        description: `Contains reversed dictionary word: ${reversed}`,
      });
    }
  }

  return matches;
}

/**
 * Analyzes password composition and character sets
 * @param {string} password - Password to analyze
 * @returns {Object} Composition analysis
 */
function analyzeComposition(password) {
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
  if (analysis.hasLowercase) {
    charsetSize += 26;
  }
  if (analysis.hasUppercase) {
    charsetSize += 26;
  }
  if (analysis.hasNumbers) {
    charsetSize += 10;
  }
  if (analysis.hasSymbols) {
    charsetSize += 32;
  } // Approximate

  analysis.charsetSize = charsetSize;
  analysis.entropy = Math.log2(charsetSize) * password.length;

  return analysis;
}

/**
 * Calculates crack time estimate based on entropy and patterns
 * @param {number} entropy - Effective entropy
 * @returns {Object} Crack time estimates
 */
function calculateCrackTime(entropy) {
  // Guesses per second for different attack scenarios
  const guessesPerSecond = {
    onlineThrottled: 100, // Online attack with rate limiting
    onlineUnthrottled: 10000, // Online attack without rate limiting
    offlineSlow: 1e7, // Offline attack with slow hashing (10 million)
    offlineFast: 1e11, // Offline attack with fast hashing (100 billion)
  };

  const totalGuesses = Math.pow(2, entropy - 1); // Average case

  const estimates = {};
  for (const [scenario, rate] of Object.entries(guessesPerSecond)) {
    const seconds = totalGuesses / rate;
    estimates[scenario] = formatTime(seconds);
  }

  return estimates;
}

// Time constants (in seconds)
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_YEAR = 3.1536e7; // 31,536,000 seconds per year
const SECONDS_PER_CENTURY = 3.1536e9; // 3,153,600,000 seconds per century

/**
 * Formats time duration in human-readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time
 */
function formatTime(seconds) {
  if (seconds < SECONDS_PER_MINUTE) {
    return `${Math.round(seconds)} seconds`;
  }
  if (seconds < SECONDS_PER_HOUR) {
    return `${Math.round(seconds / SECONDS_PER_MINUTE)} minutes`;
  }
  if (seconds < SECONDS_PER_DAY) {
    return `${Math.round(seconds / SECONDS_PER_HOUR)} hours`;
  }
  if (seconds < SECONDS_PER_YEAR) {
    return `${Math.round(seconds / SECONDS_PER_DAY)} days`;
  }
  if (seconds < SECONDS_PER_CENTURY) {
    return `${Math.round(seconds / SECONDS_PER_YEAR)} years`;
  }
  return 'centuries';
}

/**
 * Generates feedback and recommendations for password improvement
 * @param {number} score - Password score (0-4)
 * @param {Array} patterns - Detected patterns
 * @param {Array} dictionaries - Dictionary matches
 * @param {Object} composition - Composition analysis
 * @returns {Object} Feedback and recommendations
 */
function generateFeedback(score, patterns, dictionaries, composition) {
  const feedback = {
    suggestions: [],
    warning: null,
    recommendations: [],
  };

  // Length recommendations
  if (composition.length < 8) {
    feedback.suggestions.push('Use at least 8 characters');
  } else if (composition.length < 12) {
    feedback.suggestions.push('Consider using 12 or more characters for better security');
  }

  // Character set recommendations
  if (!composition.hasLowercase) {
    feedback.suggestions.push('Add lowercase letters');
  }
  if (!composition.hasUppercase) {
    feedback.suggestions.push('Add uppercase letters');
  }
  if (!composition.hasNumbers) {
    feedback.suggestions.push('Add numbers');
  }
  if (!composition.hasSymbols) {
    feedback.suggestions.push('Add symbols');
  }

  // Pattern-specific feedback
  if (patterns.some((p) => p.pattern === 'sequence' || p.pattern === 'reverse_sequence')) {
    feedback.suggestions.push('Avoid sequences (e.g., abc, 123)');
  }

  if (patterns.some((p) => p.pattern.includes('keyboard'))) {
    feedback.suggestions.push('Avoid keyboard patterns (e.g., qwerty, asdf)');
  }

  if (patterns.some((p) => p.pattern === 'repetition')) {
    feedback.suggestions.push('Avoid repeated characters (e.g., aaa, 111)');
  }

  if (patterns.some((p) => p.pattern === 'leet_speak')) {
    feedback.suggestions.push('Predictable substitutions like @ for a are easy to guess');
  }

  // Dictionary-specific feedback
  if (dictionaries.some((d) => d.dictionary === 'common_passwords')) {
    feedback.warning = 'This is a very common password';
    feedback.suggestions.push('Avoid common passwords');
  }

  if (dictionaries.some((d) => d.dictionary === 'english_words')) {
    feedback.suggestions.push('Avoid dictionary words');
  }

  // Overall recommendations
  if (score <= 1) {
    feedback.recommendations.push('Consider using a password manager');
    feedback.recommendations.push('Use a passphrase with multiple random words');
  } else if (score <= 2) {
    feedback.recommendations.push('Consider adding more complexity');
    feedback.recommendations.push('Avoid predictable patterns');
  }

  return feedback;
}

/**
 * Analyzes password strength with comprehensive scoring
 * @param {string} password - Password to analyze
 * @returns {Object} Complete strength analysis
 */
export function analyzePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return {
      score: 0,
      entropy: 0,
      crackTime: null,
      feedback: {
        warning: 'Password is required',
        suggestions: ['Enter a password'],
        recommendations: [],
      },
      patterns: [],
      dictionaries: [],
      composition: null,
    };
  }

  // Analyze different aspects of the password
  const patterns = detectPatterns(password);
  const dictionaries = checkDictionaries(password);
  const composition = analyzeComposition(password);

  // Calculate base score from entropy
  let baseScore = Math.min(4, Math.floor(composition.entropy / 20));

  // Reduce score based on weaknesses
  let finalScore = baseScore;

  // Heavy penalties for dictionary matches
  if (dictionaries.some((d) => d.dictionary === 'common_passwords')) {
    finalScore = 0;
  } else if (dictionaries.length > 0) {
    finalScore = Math.max(0, finalScore - 2);
  }

  // Moderate penalties for patterns (count individual matches, not just pattern types)
  const patternPenalty = patterns.reduce((sum, p) => {
    const matchCount = p.matches ? p.matches.length : 1;
    return sum + matchCount * (1 - p.score);
  }, 0);
  finalScore = Math.max(0, finalScore - Math.floor(patternPenalty / 2));

  // Ensure score is within bounds
  finalScore = Math.max(0, Math.min(4, finalScore));

  // Calculate effective entropy (reduced by patterns and dictionary matches)
  let effectiveEntropy = composition.entropy;
  if (dictionaries.some((d) => d.dictionary === 'common_passwords')) {
    effectiveEntropy = 1; // Extremely weak
  } else {
    const reductionFactor = Math.min(0.8, patternPenalty * 0.2 + dictionaries.length * 0.1);
    effectiveEntropy = effectiveEntropy * (1 - reductionFactor);
  }

  // Generate crack time estimates
  const crackTime = calculateCrackTime(effectiveEntropy);

  // Generate feedback
  const feedback = generateFeedback(finalScore, patterns, dictionaries, composition);

  return {
    score: finalScore,
    entropy: Math.round(effectiveEntropy * 100) / 100,
    crackTime,
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
        commonPassword: dictionaries.some((d) => d.dictionary === 'common_passwords'),
      },
    },
  };
}

/**
 * Gets a human-readable strength label
 * @param {number} score - Password score (0-4)
 * @returns {string} Strength label
 */
export function getStrengthLabel(score) {
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return labels[score] || 'Unknown';
}

/**
 * Gets strength color for UI display
 * @param {number} score - Password score (0-4)
 * @returns {string} CSS color value
 */
export function getStrengthColor(score) {
  const colors = [
    '#d73502', // Very Weak - Red
    '#f56500', // Weak - Orange-Red
    '#f7a800', // Fair - Orange
    '#8bc34a', // Good - Light Green
    '#4caf50', // Strong - Green
  ];
  return colors[score] || '#666';
}

/**
 * Quick password strength check (simplified version)
 * @param {string} password - Password to check
 * @returns {Object} Simplified strength result
 */
export function quickStrengthCheck(password) {
  const full = analyzePasswordStrength(password);
  return {
    score: full.score,
    label: getStrengthLabel(full.score),
    color: getStrengthColor(full.score),
    entropy: full.entropy,
    suggestions: full.feedback.suggestions.slice(0, 3), // Top 3 suggestions
  };
}
