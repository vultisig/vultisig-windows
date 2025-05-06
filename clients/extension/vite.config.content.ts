import path from 'path'
import { defineConfig } from 'vite'

import { manifest } from './package.json'

export default defineConfig({
  build: {
    assetsDir: '',
    copyPublicDir: false,
    emptyOutDir: false,
    manifest: false,
    outDir: 'dist',
    rollupOptions: {
      input: {
        content: path.resolve(__dirname, manifest.content),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
})
