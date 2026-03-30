import { defineConfig } from 'vitest/config'

import { sdkResolvePlugin } from './core/ui/vite/sdkResolvePlugin'
import { tsconfigPathsNormal } from './core/ui/vite/tsconfigPathsNormal'

export default defineConfig({
  plugins: [sdkResolvePlugin(), tsconfigPathsNormal()],
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
