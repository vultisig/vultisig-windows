import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({ exclude: ['fs'] }),
    wasm(),
    topLevelAwait(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "~variables" as *;`,
        api: 'modern-compiler',
      },
    },
  },
  resolve: {
    alias: {
      '~variables': path.resolve(__dirname, 'src/styles/_variables'),
    },
  },
  server: { port: 3000 },
})
