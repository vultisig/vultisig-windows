import react from '@vitejs/plugin-react'
import vultisigSdk from '@vultisig/sdk/vite'
import { PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

export const getCommonPlugins = (): PluginOption[] => [
  // Configures `optimizeDeps.exclude` for the wasm-bindgen glue packages so
  // `new URL('*.wasm', import.meta.url)` inside them resolves next to the real
  // .wasm payload rather than against `.vite/deps/`. Owned by the SDK so we
  // get updates for free when new wasm packages are added.
  vultisigSdk(),
  react({
    babel: {
      plugins: [['babel-plugin-react-compiler', {}]],
    },
  }),
  nodePolyfills({ exclude: ['fs'] }),
  wasm(),
  topLevelAwait(),
]
