import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default () => {
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
      ],
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
