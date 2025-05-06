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
        inpage: path.resolve(__dirname, manifest.inpage),
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
      },
    },
  },
})
