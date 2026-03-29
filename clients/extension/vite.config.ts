import path from 'path'
import { defineConfig, loadEnv, PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

import { getFeatureFlagDefines } from '../../core/ui/vite/featureFlagDefines'
import { getCommonPlugins } from '../../core/ui/vite/plugins'
import { getStaticCopyTargets } from '../../core/ui/vite/staticCopy'

const rootDir = path.resolve(__dirname, '../..')

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, rootDir)
  const featureFlagDefines = getFeatureFlagDefines(env)
  const envDefines = {
    __AGENT_BACKEND_URL__: JSON.stringify(
      env.AGENT_BACKEND_URL || 'https://agent.vultisig.com'
    ),
    __VULTISIG_VERIFIER_URL__: JSON.stringify(
      env.VULTISIG_VERIFIER_URL || 'https://verifier.vultisig.com'
    ),
  }

  const chunk = process.env.CHUNK
  const isDev = !!process.env.VITE_DEV_RELOAD

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

    return {
      define: { ...featureFlagDefines, ...envDefines },
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
    }
  } else {
    return {
      define: { ...featureFlagDefines, ...envDefines },
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
    }
  }
})
