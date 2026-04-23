// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import jsxA11Y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactCompiler from 'eslint-plugin-react-compiler'
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
      '**/storybook-static',
      'lib/dkls',
      'lib/schnorr',
      'lib/mldsa',
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
      import: importPlugin,
      '@typescript-eslint': typescriptEslint,
      'jsx-a11y': jsxA11Y,
      'react-hooks': fixupPluginRules(reactHooks),
      'simple-import-sort': simpleImportSort,
      'unused-imports': fixupPluginRules(unusedImportsPlugin),
      storybook,
      'react-compiler': reactCompiler,
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
      'react-compiler/react-compiler': 'error',
      'import/no-relative-packages': 'error',
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
  // MPC engine chunk isolation — see vultisig/vultisig-windows#3777.
  // The extension service worker and inpage chunks must not pull @vultisig/core-mpc
  // (or related MPC packages) into their bundles unless they also import
  // '@core/ui/mpc/bootstrapMpcEngine' at the entrypoint. Today neither chunk calls
  // getMpcEngine(); this rule prevents a future refactor from silently shipping
  // "MPC engine not configured" at runtime or bloating the SW/inpage bundle with
  // DKLS/Schnorr WASM. Protobuf types under @vultisig/core-mpc/types/** are allowed
  // (no engine calls, used by the inpage cosmos provider).
  {
    files: [
      'clients/extension/src/background/**/*.{ts,tsx}',
      'clients/extension/src/inpage/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@vultisig/core-mpc(?!/types($|/)).*$',
              message:
                'This chunk must not import runtime code from @vultisig/core-mpc (only @vultisig/core-mpc/types/** is allowed). If MPC is truly needed here, import "@core/ui/mpc/bootstrapMpcEngine" at the top of the entry file and update the eslint override plus the chunk header comment. See vultisig/vultisig-windows#3777.',
            },
            {
              group: [
                '@vultisig/mpc-types',
                '@vultisig/mpc-wasm',
                '@vultisig/lib-dkls',
                '@vultisig/lib-schnorr',
                '@vultisig/lib-mldsa',
              ],
              message:
                'This chunk must not import MPC engine packages. If MPC is truly needed here, import "@core/ui/mpc/bootstrapMpcEngine" at the top of the entry file and update the eslint override plus the chunk header comment. See vultisig/vultisig-windows#3777.',
            },
          ],
        },
      ],
    },
  },
  ...storybook.configs['flat/recommended'],
]
