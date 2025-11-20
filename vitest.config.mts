import { defineConfig } from 'vitest/config'

export default defineConfig({
  build: {
    minify: false,
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{js,ts,tsx}'],
  },
})
