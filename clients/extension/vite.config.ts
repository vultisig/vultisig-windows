import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv, PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

import { getCommonPlugins } from '../../core/ui/vite/plugins'
import { getStaticCopyTargets } from '../../core/ui/vite/staticCopy'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export default async () => {
  const env = loadEnv('production', rootDir, '')
  const chunk = process.env.CHUNK
  const isDev = !!process.env.VITE_DEV_RELOAD

  // TODO: prod — switch back to production URLs
  // __RELAY_URL__: JSON.stringify(env.RELAY_URL || ''),
  // __FAST_VAULT_URL__: JSON.stringify(env.FAST_VAULT_URL || ''),
  // __AGENT_BACKEND_URL__: JSON.stringify(env.AGENT_BACKEND_URL || 'https://agent.vultisig.com'),
  // __VULTISIG_VERIFIER_URL__: JSON.stringify(env.VULTISIG_VERIFIER_URL || 'https://verifier.vultisig.com'),
  const envDefines = {
    __RELAY_URL__: JSON.stringify('http://localhost:9091'),
    __FAST_VAULT_URL__: JSON.stringify('http://localhost:8081/vault'),
    __AGENT_BACKEND_URL__: JSON.stringify('http://localhost:8081'),
    __VULTISIG_VERIFIER_URL__: JSON.stringify('http://localhost:8081'),
  }

  const devBuildOptions = isDev
    ? { minify: false as const, reportCompressedSize: false }
    : {}

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
      define: envDefines,
      plugins,
      build: {
        copyPublicDir: false,
        emptyOutDir: false,
        manifest: false,
        ...devBuildOptions,
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
      define: envDefines,
      plugins: [
        ...getCommonPlugins(),
        viteStaticCopy({
          targets: getStaticCopyTargets(),
        }),
      ],
      build: {
        emptyOutDir: false,
        manifest: false,
        ...devBuildOptions,
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
      worker: {
        plugins: () => [wasm(), topLevelAwait()],
      },
      optimizeDeps: {
        exclude: ['fromt-wasm', 'frozt-wasm'],
      },
      resolve: {
        dedupe: ['fromt-wasm', 'frozt-wasm'],
      },
    })
  }
}
