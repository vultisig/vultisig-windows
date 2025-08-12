import { runBridgeInpageAgent } from '@core/inpage-provider/bridge/inpage'

import { messengers } from './messenger'
import { shouldInjectProvider } from './utils/injectHelpers'
import { injectToWindow } from './utils/windowInjector'

const keepAlive = () => {
  setInterval(() => {
    messengers.background.send('ping', {})
  }, 10000)
}

if (shouldInjectProvider()) {
  runBridgeInpageAgent()

  injectToWindow()
  keepAlive()
}
