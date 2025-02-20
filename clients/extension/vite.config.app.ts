import path from 'path'
import { defineConfig } from 'vite'

import { manifest } from './package.json'

export default defineConfig({
  build: {
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        accounts: path.resolve(__dirname, manifest.accounts),
        background: path.resolve(__dirname, manifest.background),
        import: path.resolve(__dirname, manifest.import),
        popup: path.resolve(__dirname, manifest.popup),
        transaction: path.resolve(__dirname, manifest.transaction),
        vault: path.resolve(__dirname, manifest.vault),
        vaults: path.resolve(__dirname, manifest.vaults),
      },
    },
  },
})
