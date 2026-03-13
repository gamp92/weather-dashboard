// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";

export default tseslint.config(
  {
    // ── Source files: full typed linting ────────────────────────────
    files: ["src/**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.app.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // ── No if/else ───────────────────────────────────────────────
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
      "@typescript-eslint/no-extraneous-class": ["error", { allowWithDecorator: true }],

      // ── Angular specific ─────────────────────────────────────────
      "@angular-eslint/prefer-on-push-component-change-detection": "error",
      "@angular-eslint/component-max-inline-declarations": [
        "error",
        { template: 5, styles: 5, animations: 5 },
      ],
    },
  },
  {
    // ── Test + config files: lighter rules, spec tsconfig ───────────
    files: ["testing/**/*.ts", "jest.config.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.spec.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // ── HTML templates ───────────────────────────────────────────────
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended],
    rules: {
      "max-lines": ["error", { max: 100, skipBlankLines: true }],
    },
  }
);
