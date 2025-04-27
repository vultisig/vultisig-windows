import { defineConfig, mergeConfig } from 'vite'

import appConfig from './vite.config.app'
import baseConfig from './vite.config.base'
import contentConfig from './vite.config.content'
import inpageConfig from './vite.config.inpage'
import relayConfig from './vite.config.relay'

export default defineConfig(() => {
  const chunk = process.env.CHUNK

  switch (chunk) {
    case 'content':
      return mergeConfig(baseConfig, contentConfig)
    case 'inpage':
      return mergeConfig(baseConfig, inpageConfig)
    case 'relay':
      return mergeConfig(baseConfig, relayConfig)
    default:
      return mergeConfig(baseConfig, appConfig)
  }
})
