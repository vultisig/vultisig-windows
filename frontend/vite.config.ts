import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stdLibBrowser from 'vite-plugin-node-stdlib-browser';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    stdLibBrowser(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(
            __dirname,
            'node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm'
          ),
          dest: '',
        },
        {
          src: path.resolve(__dirname, 'node_modules/7z-wasm/7zz.wasm'),
          dest: '7z-wasm',
        },
      ],
    }),
  ],
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
