import vultisigSdk from '@vultisig/sdk/vite'
import path from 'path'
import { defineConfig, loadEnv, PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import wasm from 'vite-plugin-wasm'
import tsconfigPaths from 'vite-tsconfig-paths'

import { getFeatureFlagDefines } from '../../core/ui/vite/featureFlagDefines'
import {
  getCommonPlugins,
  topLevelAwaitPlugins,
} from '../../core/ui/vite/plugins'
import { getStaticCopyTargets } from '../../core/ui/vite/staticCopy'
import { getExtensionArtifactDirectoryName } from './src/brand/extensionArtifact'
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

// `define-data-property` declares itself side-effect-free, but its exported
// function performs the property writes used by `globalthis`. When the SDK
// pulls xstream into the app chunk, Rollup can otherwise remove those calls
// and the extension crashes before React mounts (`getPolyfill is not a
// function`). Keep only this module's body intact instead of disabling tree
// shaking for the whole extension.
const preserveDefineDataProperty = (): PluginOption => ({
  name: 'vultisig:preserve-define-data-property',
  enforce: 'pre',
  async resolveId(source, importer) {
    if (source !== 'define-data-property') return null

    const resolved = await this.resolve(source, importer, { skipSelf: true })

    return resolved
      ? { ...resolved, moduleSideEffects: 'no-treeshake' }
      : resolved
  },
})

// Modules that must not be evaluated before the popup's home paints. They are
// loaded through `loadMpcEngine` and `loadWalletCore`; a static import anywhere
// on the home path would put them back into a chunk that index.html
// modulepreloads, which the size budget alone cannot catch (#4937).
// Matched on each package's own `dist/`: the SDK's Vite plugin resolves node
// polyfill shims from the SDK's nested node_modules, and those are fine here.
const popupEntryGraphForbiddenModules = [
  '/node_modules/@vultisig/sdk/dist/',
  '/node_modules/@trustwallet/wallet-core/dist/',
]

const assertPopupEntryGraphModules = (): PluginOption => ({
  name: 'vultisig:assert-popup-entry-graph-modules',
  generateBundle(_, bundle) {
    const chunks = Object.values(bundle).filter(
      output => output.type === 'chunk'
    )
    const entry = chunks.find(chunk => chunk.isEntry && chunk.name === 'index')
    if (!entry) {
      this.error(
        'The popup entry chunk "index" was not emitted; the entry-graph check cannot run. Keep the `index` input in rollupOptions or update this check.'
      )
    }

    // Static import chain from the entry to each chunk, for the error message.
    const importedBy = new Map<string, string | null>([[entry.fileName, null]])
    const visit = (fileName: string) => {
      chunks
        .find(chunk => chunk.fileName === fileName)
        ?.imports.forEach(imported => {
          if (importedBy.has(imported)) return
          importedBy.set(imported, fileName)
          visit(imported)
        })
    }
    visit(entry.fileName)
    const staticGraph = new Set(importedBy.keys())
    const chainTo = (fileName: string): string => {
      const parent = importedBy.get(fileName)
      return parent ? `${chainTo(parent)} -> ${fileName}` : fileName
    }

    const offenders = chunks
      .filter(chunk => staticGraph.has(chunk.fileName))
      .flatMap(chunk =>
        Object.keys(chunk.modules)
          .filter(id =>
            popupEntryGraphForbiddenModules.some(forbidden =>
              id.replace(/\\/g, '/').includes(forbidden)
            )
          )
          .map(
            id =>
              `${chainTo(chunk.fileName)}: ${id.replace(/^.*node_modules\//, '')}`
          )
      )

    if (offenders.length > 0) {
      this.error(
        `The popup entry graph statically includes modules that must load after home paints (see loadMpcEngine / loadWalletCore):\n${offenders.slice(0, 10).join('\n')}${offenders.length > 10 ? `\n...and ${offenders.length - 10} more` : ''}`
      )
    }
  },
})

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
  const extensionArtifactDirectory =
    getExtensionArtifactDirectoryName(productBrand)
  const extensionOutDir = path.resolve(__dirname, extensionArtifactDirectory)
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
          ...topLevelAwaitPlugins(),
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
        preserveDefineDataProperty(),
        extensionVultisigSdk(),
        tsconfigPaths({ root: rootDir }),
        extensionBrandVitePlugin({
          config: extensionBrandConfig,
          distDir: extensionOutDir,
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
        outDir: extensionOutDir,
        manifest: false,
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
            // Every build writes into the same dist/assets. The app build owns the
            // bare chunk names; the service worker and inpage builds prefix theirs,
            // otherwise a chunk both graphs emit (the SDK entry, once the app loads
            // it on demand) is overwritten by whichever build runs last.
            chunkFileNames: `assets/${chunk}-[name].js`,
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
        preserveDefineDataProperty(),
        tsconfigPaths({ root: rootDir }),
        ...getCommonPlugins({
          nodePolyfills: extensionNodePolyfills(isFirefoxBuild),
          vultisigSdk: extensionVultisigSdk(),
        }),
        extensionBrandVitePlugin({
          config: extensionBrandConfig,
          distDir: extensionOutDir,
          extensionDir: __dirname,
        }),
        viteStaticCopy({
          targets: getStaticCopyTargets(),
        }),
        // The Firefox build keeps every module of a package in one vendor chunk,
        // so the transaction builders in @vultisig/core-mpc and core-chain, which
        // only lazy pages use, sit next to the modules home needs and drag
        // WalletCore in statically. Only the Chromium build can hold this line.
        ...(isFirefoxBuild ? [] : [assertPopupEntryGraphModules()]),
      ],
      build: {
        // Keep the SDK/WASM top-level-await wrapper output modern; the plugin's
        // downlevel pass cannot transform the current dependency graph.
        target: 'esnext',
        emptyOutDir: false,
        outDir: extensionOutDir,
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
            manualChunks: isFirefoxBuild
              ? (id: string) => getFirefoxManualChunk('app', id)
              : undefined,
          },
        },
      },
    }
  }
})
