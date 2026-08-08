import sonarjs from 'eslint-plugin-sonarjs'

import baseConfig from '../eslint.config.mjs'

export default [
  ...baseConfig,
  {
    plugins: {
      sonarjs,
    },
    rules: {
      'sonarjs/cognitive-complexity': ['error', 75],
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-redundant-boolean': 'error',
    },
  },
]
