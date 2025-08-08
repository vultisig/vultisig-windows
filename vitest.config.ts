import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,ts,tsx}'],
    testTimeout: 60_000,
    pool: 'threads',
    poolOptions: { threads: { singleThread: true } },
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'core'),
      '@lib': path.resolve(__dirname, 'lib'),
    },
  },
})
