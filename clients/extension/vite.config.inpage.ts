import path from 'path'
import { defineConfig } from 'vite'

import { manifest } from './package.json'

export default defineConfig({
  build: {
    emptyOutDir: false,
    manifest: false,
    outDir: 'dist',
    assetsDir: '',
    copyPublicDir: false,
    rollupOptions: {
      input: {
        inpage: path.resolve(__dirname, manifest.inpage),
      },
      output: {
        format: 'iife',
        entryFileNames: '[name].js',
      },
    },
  },
})
