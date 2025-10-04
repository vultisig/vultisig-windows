import { runBackgroundEventsInpageAgent } from '@core/inpage-provider/background/events/inpage'
import { runBridgeInpageAgent } from '@lib/extension/bridge/inpage'

import { shouldInjectProvider } from './utils/injectHelpers'
import { injectToWindow } from './utils/windowInjector'

if (shouldInjectProvider()) {
  runBridgeInpageAgent()

  runBackgroundEventsInpageAgent()

  injectToWindow()
}
