import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

/**
 * One flat config for the whole workspace.
 *
 * Each app's `lint` script runs `eslint src/` from its own directory; ESLint
 * walks up the tree to this file, so the rules are written once. The rules
 * below are the house style the code already follows — they are here to keep it
 * that way, not to start an argument with it.
 */
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/dist-*/**',
      '**/build/**',
      '**/coverage/**',
      '**/node_modules/**',
      'apps/api/uploads/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // One way to declare a function in this codebase: a const arrow.
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'object-shorthand': ['error', 'always'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-react',
              message: 'This app uses Tabler icons only — import from @tabler/icons-react.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      // A stray log in the browser console is a bug report nobody filed. A
      // warning or an error is a trace left on purpose, so those may stay.
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  {
    files: ['apps/api/**/*.ts', 'packages/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'error' },
  },

  {
    // Scripts, tests and build configs run in Node and are allowed to print.
    files: [
      'apps/api/scripts/**/*.ts',
      'apps/api/test/**/*.ts',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.config.ts',
      '**/*.config.mjs',
    ],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'no-console': 'off',
      // Test payloads are parsed JSON; spelling out every shape would be
      // testing the types rather than the API.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);
