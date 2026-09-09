// Flat config, replacing .eslintrc.json.
//
// ESLint 9 no longer reads eslintrc files. The rules below are a direct
// translation of the previous .eslintrc.json — the architectural
// boundary this enforces is unchanged.

import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
  importPlugin.flatConfigs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2022 },
    },
    rules: {
          "no-restricted-imports": [
                "error",
                {
                      "paths": [
                            {
                                  "name": "crypto",
                                  "message": "Node.js crypto is forbidden in web UI. Use BrowserCryptoRandom adapter."
                            },
                            {
                                  "name": "node:crypto",
                                  "message": "Node.js crypto is forbidden in web UI. Use BrowserCryptoRandom adapter."
                            },
                            {
                                  "name": "fs",
                                  "message": "Node.js fs is forbidden in web UI. Use BrowserStorage adapter."
                            },
                            {
                                  "name": "node:fs",
                                  "message": "Node.js fs is forbidden in web UI. Use BrowserStorage adapter."
                            },
                            {
                                  "name": "fs/promises",
                                  "message": "Node.js fs is forbidden in web UI. Use BrowserStorage adapter."
                            },
                            {
                                  "name": "node:fs/promises",
                                  "message": "Node.js fs is forbidden in web UI. Use BrowserStorage adapter."
                            },
                            {
                                  "name": "path",
                                  "message": "Node.js path is forbidden in web UI."
                            },
                            {
                                  "name": "node:path",
                                  "message": "Node.js path is forbidden in web UI."
                            }
                      ],
                      "patterns": [
                            {
                                  "group": [
                                        "**/packages/core/src/generators/*"
                                  ],
                                  "message": "Direct generator imports are forbidden. Use createService().generate() instead."
                            },
                            {
                                  "group": [
                                        "**/packages/core/src/domain/entropy-calculator*"
                                  ],
                                  "message": "Direct entropy imports are forbidden. Use createService().calculateEntropy() instead."
                            },
                            {
                                  "group": [
                                        "**/packages/core/src/domain/charset*"
                                  ],
                                  "message": "Direct charset imports are forbidden. Core domain internals should not be accessed directly."
                            }
                      ]
                }
          ],
          "no-restricted-syntax": [
                "error",
                {
                      "selector": "CallExpression[callee.name='calculateTotalEntropy']",
                      "message": "Entropy calculation must go through service.calculateEntropy()"
                },
                {
                      "selector": "CallExpression[callee.name='getSecurityLevel']",
                      "message": "Security level determination must go through service.calculateEntropy()"
                },
                {
                      "selector": "CallExpression[callee.name='validatePasswordTypeConfig']",
                      "message": "Validation must go through service.validateConfig()"
                },
                {
                      "selector": "CallExpression[callee.name='isValidPasswordType']",
                      "message": "Type validation must go through service.validateConfig()"
                }
          ]
    },
  },
  {
    // `overrides` has no flat-config equivalent; later entries win.
    files: ["**/*.test.js", "**/*.spec.js", "test/**/*.js"],
    rules: {
          "no-restricted-imports": "off",
          "no-restricted-syntax": "off"
    },
  },
  {
    files: ["hooks/**/*.js"],
    rules: {
      "import/no-unresolved": ["error", { ignore: ["^react$"] }],
    },
  },
];
