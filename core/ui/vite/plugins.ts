import react from '@vitejs/plugin-react'
import { PluginOption } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

export const getCommonPlugins = (): PluginOption[] => [
  react({
    babel: {
      plugins: [['babel-plugin-react-compiler', {}]],
    },
  }),
  nodePolyfills({ exclude: ['fs'] }),
  wasm(),
  topLevelAwait(),
]
