// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import * as tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [js.configs.recommended, ...tseslint.configs.recommended, {
  files: ['**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  settings: {
    react: {
      version: 'detect'
    },
  },
  plugins: {
    'react': await import('eslint-plugin-react'),
    'react-hooks': await import('eslint-plugin-react-hooks'),
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
      destructuredArrayIgnorePattern: '^_'
    }],
    'no-console': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
}, {
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      project: ['./tsconfig.json'],
    },
  },
}, ...storybook.configs["flat/recommended"], ...storybook.configs["flat/recommended"]]; 