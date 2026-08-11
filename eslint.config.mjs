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

const unicodeDashPattern = /\S[\u2011\u2013\u2014]\S/u
const noUnicodeDashLiterals = {
  rules: {
    'no-unicode-dash-literals': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          forbidden:
            'Use an ASCII hyphen inside identifier-like source text; Unicode dashes can break identity matching.',
        },
      },
      create(context) {
        const reportIfNeeded = (node, value) => {
          if (unicodeDashPattern.test(value)) {
            context.report({ node, messageId: 'forbidden' })
          }
        }

        return {
          Literal(node) {
            if (typeof node.value === 'string') reportIfNeeded(node, node.value)
          },
          TemplateElement(node) {
            reportIfNeeded(node, node.value.cooked ?? node.value.raw)
          },
          JSXText(node) {
            reportIfNeeded(node, node.value)
          },
        }
      },
    },
  },
}

// A corner radius binds to a surface in more shapes than a `border-radius`
// declaration, and the #4550 migration found all four of them in the tree:
// the plain literal, a named constant one hop from use, a radius spelled as a
// dimension, and a radius handed to a component as a prop. A regex over
// `border-radius:` alone would have missed three.
//
// What this rule cannot do is check that the *right* step was picked. Whether a
// surface takes `xl` or something smaller depends on whether it is a container,
// sits inside one, or is not a surface at all - only ever visible at the call
// site. It stops new literals; it does not stop drift. See vultisig/
// vultisig-windows#4639.
const radiusValuePattern = /border-radius\s*:\s*([^;}]*)/g
const hardcodedLengthPattern = /(?<![\w.$])\d*\.?\d+\s*(px|%|r?em|pt|vh|vw)/i
const radiusConstantPattern = /(border)?radius(px)?$/i
// Exact names only: `tipRadius` on floating-ui's Arrow is an arrowhead, not a
// surface corner, and has no business on the scale.
const radiusPropNames = new Set(['radius', 'borderRadius'])

const noHardcodedBorderRadius = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      literal:
        'Hardcoded corner radius `{{value}}`. Use a step from `borderRadius` in @lib/ui/css/borderRadius, or `borderRadiusPx` when a surface rounds its corners individually. If this is deliberately off the scale, disable the rule on the line above with a reason.',
      constant:
        'Corner radius `{{value}}` held in a constant. Read it from `borderRadiusPx` instead, so the scale stays the single source.',
      prop: 'Corner radius `{{value}}` passed as a value. Use `borderRadiusPx` so the call site names a step rather than a number.',
    },
  },
  create(context) {
    // Report against the enclosing statement: a disable comment cannot live
    // inside a template literal, so it has to attach above the declaration.
    const enclosingStatement = node => {
      let current = node
      while (
        current.parent &&
        !/Statement|Declaration/.test(current.parent.type)
      ) {
        current = current.parent
      }
      return current.parent ?? node
    }

    return {
      TemplateElement(node) {
        const text = node.value.cooked ?? node.value.raw
        for (const match of text.matchAll(radiusValuePattern)) {
          const value = match[1].trim()
          if (!value || !hardcodedLengthPattern.test(value)) continue
          context.report({
            node: enclosingStatement(node),
            messageId: 'literal',
            data: { value },
          })
        }
      },
      VariableDeclarator(node) {
        if (
          node.id.type !== 'Identifier' ||
          !radiusConstantPattern.test(node.id.name) ||
          node.init?.type !== 'Literal' ||
          typeof node.init.value !== 'number'
        ) {
          return
        }
        context.report({
          node,
          messageId: 'constant',
          data: { value: String(node.init.value) },
        })
      },
      'Property, JSXAttribute'(node) {
        const name =
          node.type === 'JSXAttribute'
            ? node.name.name
            : node.key.type === 'Identifier'
              ? node.key.name
              : node.key.value
        if (typeof name !== 'string' || !radiusPropNames.has(name)) return
        const value =
          node.type === 'JSXAttribute'
            ? node.value?.type === 'Literal'
              ? node.value.value
              : node.value?.expression?.value
            : node.value?.value
        if (value === undefined || value === null) return
        if (
          typeof value === 'number'
            ? value === 0
            : !hardcodedLengthPattern.test(String(value))
        ) {
          return
        }
        context.report({
          node,
          messageId: 'prop',
          data: { value: String(value) },
        })
      },
    }
  },
}

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
      local: {
        rules: {
          ...noUnicodeDashLiterals.rules,
          'no-hardcoded-border-radius': noHardcodedBorderRadius,
        },
      },
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
      'local/no-unicode-dash-literals': 'error',
      'local/no-hardcoded-border-radius': 'error',
    },
  }, // Override for declaration files where interfaces are required for module augmentation
  {
    files: ['core/ui/i18n/locales/**/*.{ts,tsx}'],
    rules: {
      'local/no-unicode-dash-literals': 'off',
    },
  },
  // The token module defines the scale, so it is the one place a raw radius
  // belongs. `round` is the deprecated spelling it replaces.
  {
    files: ['lib/ui/css/borderRadius.tsx', 'lib/ui/css/round.tsx'],
    rules: {
      'local/no-hardcoded-border-radius': 'off',
    },
  },
  // Stories and specs illustrate or assert values rather than ship surfaces,
  // and the e2e fixture builds a mock third-party dapp page whose radii are not
  // ours to standardise.
  {
    files: [
      '**/*.stories.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      'clients/extension/tests/**/*.{ts,tsx}',
    ],
    rules: {
      'local/no-hardcoded-border-radius': 'off',
    },
  },
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
