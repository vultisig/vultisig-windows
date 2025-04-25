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
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: i => `__tla_${i}`
    }),
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
  build: {
    target: 'esnext',
  },
  server: { port: 3000 },
  optimizeDeps: {
    exclude: ['@trustwallet/wallet-core'],
  },
})
