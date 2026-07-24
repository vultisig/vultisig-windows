import path from 'path'
import { fileURLToPath } from 'url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const desktopDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(desktopDir, '../..')

// node-stdlib-browser's url proxy imports `punycode/` (directory spec). Node ESM and
// Vitest reject that; point the trailing-slash form at the package entry file.
const punycodeEntry = path.join(repoRoot, 'node_modules/punycode/punycode.js')

export default defineConfig({
  plugins: [tsconfigPaths({ root: repoRoot })],
  resolve: {
    alias: {
      'punycode/': `${punycodeEntry}`,
    },
  },
  test: {
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'scripts/**/*.{test,spec}.{js,mjs}',
    ],
  },
})
