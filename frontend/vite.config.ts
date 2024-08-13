import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stdLibBrowser from 'vite-plugin-node-stdlib-browser';
import wasm from 'vite-plugin-wasm';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), stdLibBrowser(), wasm()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  publicDir: 'public',
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
      'fs/promises': 'node-stdlib-browser/mock/empty',
    },
  },
  optimizeDeps: {
    include: ['crypto-browserify', 'stream-browserify', 'buffer'],
  },
});
