import path from 'path'
import { defineConfig } from 'vitest/config'

const root = path.resolve(__dirname, '../../../..')

export default defineConfig({
  resolve: {
    alias: {
      '@clients/extension/src': path.resolve(root, 'clients/extension/src'),
      '@core': path.resolve(root, 'core'),
      '@lib': path.resolve(root, 'lib'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [path.resolve(__dirname, 'setup.ts')],
    include: [path.resolve(__dirname, '**/*.test.ts'), path.resolve(__dirname, '**/*.test.tsx')],
    testTimeout: 30000,
  },
})
