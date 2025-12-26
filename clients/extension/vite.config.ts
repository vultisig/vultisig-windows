import path from 'path'
import { defineConfig, PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

import { getCommonPlugins } from '../../core/ui/vite/plugins'
import { getStaticCopyTargets } from '../../core/ui/vite/staticCopy'

export default async () => {
  const chunk = process.env.CHUNK

  if (chunk) {
    let format: 'cjs' | 'es' | 'iife' | 'umd' | undefined = undefined
    let plugins: PluginOption[] = []

    switch (chunk) {
      case 'background':
        plugins = [nodePolyfills({ exclude: ['fs'] }), wasm(), topLevelAwait()]
        break
      case 'inpage':
        format = 'iife'
        plugins = [
          nodePolyfills({
            exclude: ['fs'],
            protocolImports: true,
          }),
        ]
        break
      default:
        break
    }

    return defineConfig({
      plugins,
      build: {
        copyPublicDir: false,
        emptyOutDir: false,
        manifest: false,
        rollupOptions: {
          input: {
            [chunk]: path.resolve(__dirname, `src/${chunk}/index.ts`),
          },
          onwarn: () => {},
          output: {
            assetFileNames: 'assets/[name].[ext]',
            chunkFileNames: 'assets/[name].js',
            entryFileNames: '[name].js',
            format,
          },
        },
      },
    })
  } else {
    return defineConfig({
      plugins: [
        ...getCommonPlugins(),
        viteStaticCopy({
          targets: getStaticCopyTargets(),
        }),
      ],
      build: {
        emptyOutDir: false,
        manifest: false,
        rollupOptions: {
          input: {
            index: path.resolve(__dirname, 'index.html'),
            popup: path.resolve(__dirname, 'popup.html'),
          },
          onwarn: () => {},
          output: {
            assetFileNames: 'assets/[name].[ext]',
            chunkFileNames: 'assets/[name].js',
            entryFileNames: '[name].js',
          },
        },
      },
    })
  }
}
