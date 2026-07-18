import react from '@vitejs/plugin-react'
import vultisigSdk from '@vultisig/sdk/vite'
import type { Plugin, PluginOption, UserConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

type GetCommonPluginsInput = {
  nodePolyfills?: PluginOption
  vultisigSdk?: PluginOption
}

const defaultBuildMinify = (): Plugin => ({
  name: 'vultisig:default-build-minify',
  config: (config: UserConfig) =>
    config.build?.minify === undefined
      ? { build: { minify: 'esbuild' as const } }
      : undefined,
})

export const topLevelAwaitPlugins = (): PluginOption[] => [
  defaultBuildMinify(),
  topLevelAwait(),
]

export const getCommonPlugins = ({
  nodePolyfills: nodePolyfillsPlugin = nodePolyfills({ exclude: ['fs'] }),
  vultisigSdk: vultisigSdkPlugin = vultisigSdk(),
}: GetCommonPluginsInput = {}): PluginOption[] => [
  // Configures `optimizeDeps.exclude` for the wasm-bindgen glue packages so
  // `new URL('*.wasm', import.meta.url)` inside them resolves next to the real
  // .wasm payload rather than against `.vite/deps/`. Owned by the SDK so we
  // get updates for free when new wasm packages are added.
  vultisigSdkPlugin,
  react({
    babel: {
      plugins: [['babel-plugin-react-compiler', {}]],
    },
  }),
  nodePolyfillsPlugin,
  wasm(),
  ...topLevelAwaitPlugins(),
]
