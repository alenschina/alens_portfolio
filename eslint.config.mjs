import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  importPlugin.flatConfigs.recommended,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores:
    "coverage/**",
    "node_modules/**",
    "public/uploads/**",
    "prisma/migrations/**",
  ]),
  {
    plugins: {
      import: importPlugin
    },
    rules: {
      // TypeScript specific
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-const": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // React specific
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-uses-react": "off", // React 17+ automatic
      "react/jsx-uses-vars": "error",
      "react/display-name": "error",
      "react/prop-types": "off", // Using TypeScript for prop validation

      // General code quality
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-return-assign": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "object-shorthand": "error",
      "quote-props": ["error", "as-needed"],

      // Best practices
      "eqeqeq": ["error", "always", { "null": "ignore" }],
      "curly": ["error", "all"],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-useless-escape": "error",

      // Import organization
      "import/order": ["error", {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }],

      // Naming conventions
      "camelcase": ["error", { "properties": "never", "ignoreDestructuring": false }],
    }
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      // Relax rules for test files
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    }
  }
]);

export default eslintConfig;
