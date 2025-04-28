import path from 'path'
import { defineConfig } from 'vite'

import { manifest } from './package.json'

export default defineConfig({
  build: {
    emptyOutDir: true,
    manifest: false,
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, manifest.background),
        connect: path.resolve(__dirname, manifest.connect),
        import: path.resolve(__dirname, manifest.import),
        popup: path.resolve(__dirname, manifest.popup),
        transaction: path.resolve(__dirname, manifest.transaction),
        vaults: path.resolve(__dirname, manifest.vaults),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
})
