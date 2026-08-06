// Flat config, replacing .eslintrc.json and .eslintignore.
//
// ESLint 9 no longer reads eslintrc files, and passing one via --config
// makes it try to `import` the JSON as a config module, which fails with
// ERR_IMPORT_ATTRIBUTE_MISSING. The rule set below is a direct
// translation of the previous .eslintrc.json.

import babelParser from "@babel/eslint-parser";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
  {
    // Replaces .eslintignore, which ESLint 9 also ignores.
    ignores: [
      "build/**",
      "coverage/**",
      "src/docs/**",
      "dist/**",
      "test/**",
      "node_modules/**",
      // Both carry `"root": true` under eslintrc, so the cascade
      // stopped there and the root rules never applied to them.
      // Flat config has no cascade, so that exclusion is explicit
      // here; they are linted by `lint:core` / `lint:web`.
      "packages/core/**",
      "src/ui/web/**",
    ],
  },
  importPlugin.flatConfigs.recommended,
  {
    files: ["*.js", "src/**/*.js"],
    languageOptions: {
      // `env: { es6: true, node: true }` has no flat-config equivalent;
      // the globals it supplied come from the `globals` package instead.
      ecmaVersion: 2020,
      sourceType: "module",
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
      },
      globals: {
        ...globals.es2020,
        ...globals.node,
        _: true,
      },
    },
    rules: {
      // chalk 6 dropped its `main` field in favour of conditional
      // `exports`. eslint-plugin-import's node resolver reads `main`
      // and not `exports`, so it reports a package that resolves
      // perfectly well at runtime as unresolvable. Same `ignore`
      // idiom the web config already uses for `^react$`.
      "import/no-unresolved": [2, { ignore: ["^chalk$"] }],
      camelcase: [1, { properties: "always" }],
      "comma-dangle": 0,
      "comma-spacing": [1, { before: false, after: true }],
      curly: 2,
      "dot-location": [2, "property"],
      "eol-last": 2,
      eqeqeq: 2,
      indent: [2, 2, { SwitchCase: 1 }],
      "key-spacing": [2, { beforeColon: false, afterColon: true }],
      "keyword-spacing": 2,
      "linebreak-style": 0,
      "no-console": 0,
      "no-irregular-whitespace": 2,
      "no-multi-str": 2,
      "no-multiple-empty-lines": [2, { max: 2 }],
      "no-spaced-func": 2,
      "no-trailing-spaces": 2,
      "no-unexpected-multiline": 2,
      "no-unused-vars": 2,
      "no-use-before-define": [2, "nofunc"],
      "operator-linebreak": [2, "after"],
      quotes: [2, "double"],
      semi: [2, "always"],
      "space-before-blocks": [2, "always"],
      "space-before-function-paren": "off",
      "space-infix-ops": 0,
      strict: [2, "global"],
      "wrap-iife": [2, "inside"],
    },
  },
];
