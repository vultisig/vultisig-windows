import path from 'path'
import { defineConfig } from 'vite'

import { manifest } from './package.json'

export default defineConfig({
  build: {
    emptyOutDir: true,
    manifest: true,
    outDir: 'dist/content',
    assetsDir: '',
    copyPublicDir: false,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, manifest.content),
      },
    },
  },
})
