import react from '@vitejs/plugin-react'
import vultisigSdk from '@vultisig/sdk/vite'
import { PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import topLevelAwait from 'vite-plugin-top-level-await'
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
  wasm(),
  // Required, NOT redundant: `wasm()` emits top-level `await` for WASM
  // instantiation. Without `topLevelAwait()` the module worker / webview that
  // loads this bundle can fail to finish evaluating at runtime and never boot —
  // in the extension's background service worker that manifested as every
  // `callBackground` hanging forever. `type: "module"` + `esnext` is not
  // sufficient on its own; keep this. See the regression from dropping it (#4400).
  topLevelAwait(),
]
