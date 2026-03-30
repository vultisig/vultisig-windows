import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Deterministic calendar-day grouping in `groupByDate` tests (and other date assertions).
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
