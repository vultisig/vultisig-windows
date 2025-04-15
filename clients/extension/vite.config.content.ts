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
        content: path.resolve(__dirname, manifest.content),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
})
