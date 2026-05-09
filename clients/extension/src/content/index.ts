import { runBackgroundEventsContentAgent } from '@core/inpage-provider/background/events/content'
import { runBridgeContentAgent } from '@lib/extension/bridge/content'

// `inpage.js` is loaded as a separate `world: "MAIN"` content script (see
// manifest.json) so Chrome injects it at document_start, before any page
// script runs. Dynamically appending a <script src="inpage.js"> from here
// raced dApp bundles that read `window.keplr` in their first React effect
// (e.g. cosmos-kit auto-reconnect on refresh), causing them to clear their
// persisted wallet state when our injection arrived a tick too late.
try {
  runBridgeContentAgent()
  runBackgroundEventsContentAgent()
} catch (error) {
  console.error('Error setting up extension communications:', error)
}
