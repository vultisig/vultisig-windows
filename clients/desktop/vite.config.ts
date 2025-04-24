import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, normalizePath } from 'vite'
import circleDependency from 'vite-plugin-circular-dependency'
import stdLibBrowser from 'vite-plugin-node-stdlib-browser'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

import * as buildInfo from './build.json'

export default defineConfig(async () => {
  const { viteStaticCopy } = await import('vite-plugin-static-copy')

  return {
    define: {
      __APP_VERSION__: JSON.stringify(buildInfo.version),
      __APP_BUILD__: JSON.stringify(buildInfo.build),
    },
    plugins: [
      react(),
      stdLibBrowser(),
      wasm(),
      topLevelAwait(),
      viteStaticCopy({
        targets: [
          {
            src: normalizePath(
              path.resolve(
                __dirname,
                '../../node_modules/@trustwallet/wallet-core/dist/lib/wallet-core.wasm'
              )
            ),
            dest: '',
          },
          {
            src: normalizePath(
              path.resolve(__dirname, '../../node_modules/7z-wasm/7zz.wasm')
            ),
            dest: '7z-wasm',
          },
        ],
      }),
      circleDependency({
        // Exclude node_modules from the check to focus on your code
        exclude: /node_modules/,
        // Do not fail the build on error, so we can see all circular dependencies
        circleImportThrowErr: false,
        // This function is called when a circular dependency is detected
        formatOutModulePath(path) {
          const str = 'Circular dependency detected:'
          return str + path
        },
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
  }
})
