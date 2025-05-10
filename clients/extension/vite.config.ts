import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

export default async () => {
  const { viteStaticCopy } = await import('vite-plugin-static-copy')
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
    const plugins: PluginOption[] = [
      react(),
      nodePolyfills({ exclude: ['fs'] }),
      wasm(),
      topLevelAwait(),
    ]

    // Add static copy plugin when not in chunk mode
    if (!chunk) {
      plugins.push(
        viteStaticCopy({
          targets: [
            {
              src: '../../core/ui/public/**/*',
              dest: 'core',
              rename: (fileName, fileExtension, fullPath) => {
                const relativePath = path.relative(
                  path.resolve(__dirname, '../../core/ui/public'),
                  fullPath
                )
                return relativePath
              },
            },
          ],
        })
      )
    }

    return defineConfig({
      plugins,
      build: {
        emptyOutDir: true,
        manifest: false,
      },
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
  }
}
