// import globals from 'globals';
// import pluginJs from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  globalIgnores([
    'packages/**/webpack.config.js',
    'packages/**/lib/**/*',
    'webpack.config.js',
  ]),
  {
    files: [
      'packages/**/src/**/*.{ts,tsx}'
    ],
    rules: {
      semi: 'warn',
      'react/no-unescaped-entities': 'off',
      'quotes': [2, 'single', { 'avoidEscape': true }],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    }
  }
]);
