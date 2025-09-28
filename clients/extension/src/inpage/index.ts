import { runBackgroundEventsInpageAgent } from '@core/inpage-provider/background/events/inpage'
import { runBridgeInpageAgent } from '@lib/extension/bridge/inpage'
import { setupAutoKeepalive } from '@lib/extension/bridge/keepalive'

import { shouldInjectProvider } from './utils/injectHelpers'
import { injectToWindow } from './utils/windowInjector'

if (shouldInjectProvider()) {
  runBridgeInpageAgent()

  runBackgroundEventsInpageAgent()

  // Initialize keepalive to prevent service worker sleep
  setupAutoKeepalive()

  injectToWindow()
}
