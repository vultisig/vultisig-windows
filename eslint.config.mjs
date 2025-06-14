// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import jsxA11Y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import storybook from 'eslint-plugin-storybook'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'
import globals from 'globals'

const filePath = fileURLToPath(import.meta.url)
const baseDirectory = path.dirname(filePath)

const compat = new FlatCompat({
  baseDirectory,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/wailsjs',
      '**/*_pb.ts',
      'lib/dkls',
      'lib/schnorr',
    ],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ),
  {
    plugins: {
      react,
      '@typescript-eslint': typescriptEslint,
      'jsx-a11y': jsxA11Y,
      'react-hooks': fixupPluginRules(reactHooks),
      'simple-import-sort': simpleImportSort,
      'unused-imports': fixupPluginRules(unusedImportsPlugin),
      storybook,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'react/react-in-jsx-scope': 'off',
      'jsx-a11y/no-autofocus': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': [
        'off',
        { allowEmptyObject: true },
      ],

      'unused-imports/no-unused-imports': 'error',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],

      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],

      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'snake_case'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  }, // Override for declaration files where interfaces are required for module augmentation
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },
  ...storybook.configs['flat/recommended'],
]
