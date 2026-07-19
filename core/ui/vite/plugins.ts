import react from '@vitejs/plugin-react'
import vultisigSdk from '@vultisig/sdk/vite'
import { PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import wasm from 'vite-plugin-wasm'

type GetCommonPluginsInput = {
  nodePolyfills?: PluginOption
  vultisigSdk?: PluginOption
}

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
  // The SDK/WASM graph uses native top-level await. Every consumer builds with
  // `target: 'esnext'` and ships ES modules (module service worker / module
  // <script>), so the runtime evaluates TLA natively — no downlevel plugin needed.
  wasm(),
]
