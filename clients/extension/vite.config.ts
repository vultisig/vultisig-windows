import { mergeConfig } from 'vite'

import baseConfig from './vite.config.base'
import appConfig from './vite.config.app'
import contentConfig from './vite.config.content'
import inpageConfig from './vite.config.inpage'
import relayConfig from './vite.config.relay'

const chunk = process.env.CHUNK

const configs = {
  app: appConfig,
  content: contentConfig,
  inpage: inpageConfig,
  relay: relayConfig,
}

// Merge configs properly
const config = chunk ? configs[chunk] : appConfig
const additionalConfig = {
  build: {
    // Ensure we use proper config for wasm
    assetsInlineLimit: 0, // Don't inline assets to avoid issues with wasm
  },
  optimizeDeps: {
    // Make sure to include WASM-related packages in the optimization exclude list
    exclude: [
      '@trustwallet/wallet-core',
      'tiny-secp256k1',
      'zxing-wasm',
    ],
  },
}

export default mergeConfig(mergeConfig(baseConfig, config), additionalConfig)
