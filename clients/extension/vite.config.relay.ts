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
        relay: path.resolve(__dirname, manifest.relay),
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
      },
    },
  },
})
