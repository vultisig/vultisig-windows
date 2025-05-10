import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

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
      case 'relay':
        format = 'iife'
        break
      default:
        break
    }

    return defineConfig({
      plugins,
      build: {
        assetsDir: '',
        copyPublicDir: false,
        emptyOutDir: false,
        manifest: false,
        outDir: 'dist',
        rollupOptions: {
          input: {
            [chunk]: path.resolve(__dirname, `src/${chunk}/index.ts`),
          },
          output: {
            entryFileNames: '[name].js',
            format,
          },
        },
      },
    })
  } else {
    return defineConfig({
      plugins: [
        react(),
        nodePolyfills({ exclude: ['fs'] }),
        wasm(),
        topLevelAwait(),
        viteStaticCopy({
          targets: [
            {
              src: '../../core/ui/public/**/*',
              dest: 'core',
              rename: (_fileName, _fileExtension, fullPath) => {
                const relativePath = path.relative(
                  path.resolve(__dirname, '../../core/ui/public'),
                  fullPath
                )
                return relativePath
              },
            },
          ],
        }),
      ],
      build: {
        emptyOutDir: false,
        manifest: false,
      },
      server: { port: 3000 },
    })
  }
}
