import vultisigSdk from '@vultisig/sdk/vite'
import path from 'path'
import { defineConfig, loadEnv, PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'
import tsconfigPaths from 'vite-tsconfig-paths'

import { getFeatureFlagDefines } from '../../core/ui/vite/featureFlagDefines'
import { getCommonPlugins } from '../../core/ui/vite/plugins'
import { getStaticCopyTargets } from '../../core/ui/vite/staticCopy'
import {
  getExtensionBrandConfig,
  resolveExtensionProductBrand,
} from './src/brand/extensionBrandConfig'
import { extensionBrandVitePlugin } from './src/brand/extensionBrandVitePlugin'

const rootDir = path.resolve(__dirname, '../..')
const extensionNodePolyfills = (isFirefoxBuild = false) =>
  nodePolyfills({
    exclude: ['fs'],
    ...(isFirefoxBuild ? { globals: { process: 'build' as const } } : {}),
  })
const extensionVultisigSdk = () => vultisigSdk({ browserGlobals: false })

/** One physical copy of MPC entry + types across chunks (vultisig-windows#3831 / #3777). */
const vultisigMpcDedupe: readonly string[] = [
  '@vultisig/sdk',
  '@vultisig/mpc-types',
  '@vultisig/mpc-wasm',
]

const getFirefoxManualChunk = (buildName: string, id: string) => {
  const normalized = id.replace(/\\/g, '/')
  const nodeModulesIndex = normalized.lastIndexOf('/node_modules/')
  if (nodeModulesIndex >= 0) {
    const packagePath = normalized.slice(nodeModulesIndex + 14)
    const parts = packagePath.split('/')
    const packageName = parts[0]?.startsWith('@')
      ? `${parts[0]}-${parts[1]}`
      : parts[0]

    return packageName
      ? `vendor-${buildName}-${packageName.replace(/[^a-zA-Z0-9_-]/g, '-')}`
      : `vendor-${buildName}`
  }

  if (normalized.includes('/clients/extension/src/inpage/providers/')) {
    const providerPath = normalized.split('/src/inpage/providers/')[1]
    const providerName = providerPath?.split('/')[0]?.replace(/\.[^.]+$/, '')
    return providerName
      ? `inpage-provider-${buildName}-${providerName}`
      : undefined
  }

  return undefined
}

const getChunkInput = (chunk: string, isFirefoxBuild: boolean) =>
  chunk === 'background' && isFirefoxBuild
    ? 'src/background/firefox.ts'
    : `src/${chunk}/index.ts`

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
    __VULTISIG_STATION_KYBER_SOURCE__: JSON.stringify(
      env.VULTISIG_STATION_KYBER_SOURCE ||
        process.env.VULTISIG_STATION_KYBER_SOURCE ||
        env.VITE_VULTISIG_STATION_KYBER_SOURCE ||
        ''
    ),
  }

  const chunk = process.env.CHUNK
  const isDev = !!process.env.VITE_DEV_RELOAD
  const isFirefoxBuild = process.env.VULTISIG_EXTENSION_TARGET === 'firefox'
  const productBrand = resolveExtensionProductBrand(
    process.env.VULTISIG_EXTENSION_BRAND
  )
  const extensionBrandConfig = getExtensionBrandConfig(productBrand)
  const defines = {
    ...featureFlagDefines,
    ...envDefines,
    __IS_FIREFOX_EXTENSION_BUILD__: JSON.stringify(isFirefoxBuild),
    __VULTISIG_PRODUCT_BRAND__: JSON.stringify(productBrand),
  }

  const devBuildOptions = isDev
    ? { minify: false as const, reportCompressedSize: false }
    : {}

  if (chunk) {
    let format: 'cjs' | 'es' | 'iife' | 'umd' | undefined = undefined
    let plugins: PluginOption[] = []

    switch (chunk) {
      case 'background':
        // Required, NOT redundant: `wasm()` emits top-level `await` for WASM
        // instantiation, and without `topLevelAwait()` the background service
        // worker fails to finish evaluating at runtime — the SW never boots, so
        // every `callBackground` from inpage/content hangs forever (dApp connect,
        // getAccount, keysign — all dead) while inpage-local logic still works.
        // `type: "module"` + `target: esnext` is not sufficient on its own; keep
        // this plugin. See the regression from dropping it (#4400).
        plugins = [
          extensionNodePolyfills(isFirefoxBuild),
          wasm(),
          topLevelAwait(),
        ]
        break
      case 'inpage':
        format = isFirefoxBuild ? undefined : 'iife'
        plugins = [
          nodePolyfills({
            exclude: ['fs'],
            ...(isFirefoxBuild
              ? { globals: { process: 'build' as const } }
              : {}),
            protocolImports: true,
          }),
        ]
        break
      default:
        break
    }

    return {
      define: defines,
      resolve: { dedupe: [...vultisigMpcDedupe] },
      plugins: [
        extensionVultisigSdk(),
        tsconfigPaths({ root: rootDir }),
        extensionBrandVitePlugin({
          config: extensionBrandConfig,
          extensionDir: __dirname,
        }),
        ...plugins,
      ],
      build: {
        // Keep the SDK/WASM top-level-await wrapper output modern; the plugin's
        // downlevel pass cannot transform the current dependency graph.
        target: 'esnext',
        copyPublicDir: false,
        emptyOutDir: false,
        manifest: false,
        minify: 'esbuild' as const,
        ...devBuildOptions,
        rollupOptions: {
          input: {
            [chunk]: path.resolve(
              __dirname,
              getChunkInput(chunk, isFirefoxBuild)
            ),
          },
          onwarn: () => {},
          output: {
            assetFileNames: 'assets/[name].[ext]',
            chunkFileNames: 'assets/[name].js',
            entryFileNames: '[name].js',
            format,
            manualChunks: isFirefoxBuild
              ? (id: string) => getFirefoxManualChunk(chunk, id)
              : undefined,
          },
        },
      },
    }
  } else {
    return {
      define: defines,
      resolve: { dedupe: [...vultisigMpcDedupe] },
      plugins: [
        tsconfigPaths({ root: rootDir }),
        ...getCommonPlugins({
          nodePolyfills: extensionNodePolyfills(isFirefoxBuild),
          vultisigSdk: extensionVultisigSdk(),
        }),
        extensionBrandVitePlugin({
          config: extensionBrandConfig,
          extensionDir: __dirname,
        }),
        viteStaticCopy({
          targets: getStaticCopyTargets(),
        }),
      ],
      build: {
        // Keep the SDK/WASM top-level-await wrapper output modern; the plugin's
        // downlevel pass cannot transform the current dependency graph.
        target: 'esnext',
        emptyOutDir: false,
        manifest: false,
        minify: 'esbuild' as const,
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
            manualChunks: isFirefoxBuild
              ? (id: string) => getFirefoxManualChunk('app', id)
              : undefined,
          },
        },
      },
    }
  }
})
