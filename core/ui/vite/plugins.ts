import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import vultisigSdk from '@vultisig/sdk/vite'
import type { Plugin, PluginOption, UserConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

type GetCommonPluginsInput = {
  nodePolyfills?: PluginOption
  vultisigSdk?: PluginOption
}

// vite-plugin-top-level-await reads `build.minify` from the user config before
// Vite applies its defaults, and re-prints every chunk it touches unminified
// when the value is missing, so the value is set explicitly. It is esbuild, not
// Vite 8's default Oxc: Oxc writes strings as template literals, and the SWC
// printer that re-prints them (@swc/core 1.15.11) turns `\x00` followed by a
// digit into `\0` plus that digit, a syntax error. polkadot's sr25519 has that
// exact string, so the whole service worker failed to parse.
const defaultBuildMinify = (): Plugin => ({
  name: 'vultisig:default-build-minify',
  config: (config: UserConfig) =>
    config.build?.minify === undefined
      ? { build: { minify: 'esbuild' as const } }
      : undefined,
})

/**
 * Wraps a bundle's top-level `await` in an async function. The extension's
 * background service worker needs it: a service worker module may not use
 * top-level `await`, and `wasm()` emits it for WASM instantiation (#4400).
 */
export const topLevelAwaitPlugins = (): PluginOption[] => [
  defaultBuildMinify(),
  topLevelAwait(),
]

/**
 * The plugin set for the desktop app and the extension's pages. Pages load as
 * module scripts, which run top-level `await` natively, so unlike the
 * background service worker they don't take `topLevelAwaitPlugins`.
 */
export const getCommonPlugins = ({
  nodePolyfills: nodePolyfillsPlugin = nodePolyfills({ exclude: ['fs'] }),
  vultisigSdk: vultisigSdkPlugin = vultisigSdk(),
}: GetCommonPluginsInput = {}): PluginOption[] => [
  // Configures `optimizeDeps.exclude` for the wasm-bindgen glue packages so
  // `new URL('*.wasm', import.meta.url)` inside them resolves next to the real
  // .wasm payload rather than against `.vite/deps/`. Owned by the SDK so we
  // get updates for free when new wasm packages are added.
  vultisigSdkPlugin,
  react(),
  babel({ presets: [reactCompilerPreset()] }),
  nodePolyfillsPlugin,
  wasm(),
]
