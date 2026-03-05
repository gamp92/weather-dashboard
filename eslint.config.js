// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";

export default tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // ── No if/else ──────────────────────────────────────────────
      "no-else-return": ["error", { allowElseIf: false }],

      // ── Function length: max 10 lines ────────────────────────────
      "max-lines-per-function": [
        "error",
        { max: 10, skipBlankLines: true, skipComments: true },
      ],

      // ── File length: max 400 lines ───────────────────────────────
      "max-lines": [
        "error",
        { max: 400, skipBlankLines: true, skipComments: true },
      ],

      // ── Pure / predictable functions ─────────────────────────────
      "no-param-reassign": "error",

      // ── Complexity & nesting ─────────────────────────────────────
      complexity: ["error", { max: 5 }],
      "max-depth": ["error", { max: 2 }],
      "max-nested-callbacks": ["error", { max: 2 }],

      // ── Single Responsibility hints ──────────────────────────────
      "max-params": ["error", { max: 4 }],

      // ── TypeScript strict ────────────────────────────────────────
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/no-floating-promises": "error",

      // ── Angular specific ─────────────────────────────────────────
      "@angular-eslint/prefer-on-push-component-change-detection": "error",
      "@angular-eslint/component-max-inline-declarations": [
        "error",
        { template: 5, styles: 5, animations: 5 },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended],
    rules: {
      // ── HTML file length: max 100 lines ──────────────────────────
      "max-lines": ["error", { max: 100, skipBlankLines: true }],
    },
  }
);
