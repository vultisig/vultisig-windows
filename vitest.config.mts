import path from 'path'
import { fileURLToPath } from 'url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

import { sdkResolvePlugin } from './core/ui/vite/sdkResolvePlugin'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [sdkResolvePlugin(), tsconfigPaths({ root: rootDir })],
  test: {
    globals: true,
    environment: 'node',
    env: { TZ: 'UTC' },
    include: [
      'core/**/*.{test,spec}.{js,ts,tsx}',
      'lib/**/*.{test,spec}.{js,ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/**',
      'clients/**',
    ],
  },
})
