import { runBackgroundEventsContentAgent } from '@core/inpage-provider/background/events/content'
import { runBridgeContentAgent } from '@lib/extension/bridge/content'

// On Chrome, `inpage.js` is loaded as a separate `world: "MAIN"` content
// script (see manifest.json) so the browser injects it at document_start,
// before any page script runs. Dynamically appending a <script
// src="inpage.js"> from here raced dApp bundles that read `window.keplr`
// in their first React effect (e.g. cosmos-kit auto-reconnect on refresh),
// causing them to clear their persisted wallet state when our injection
// arrived a tick too late.
//
// Firefox still needs the dynamic path: its `inpage.js` is emitted as
// code-split ES modules, which Firefox cannot load via a manifest
// content_script (content_scripts run as classic scripts). The Firefox
// manifest post-processor strips the inpage content_script entry so only
// this injection runs there.
const insertInpageScript = () => {
  if (document.getElementById('inpage')) {
    return
  }
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('inpage.js')
  script.id = 'inpage'
  script.type = 'module'
  script.onload = () => script.remove()
  script.onerror = error => {
    console.error('Failed to load inpage script:', error)
  }
  ;(document.head || document.documentElement).appendChild(script)
}

try {
  runBridgeContentAgent()
  runBackgroundEventsContentAgent()

  if (__IS_FIREFOX_EXTENSION_BUILD__) {
    insertInpageScript()
  }
} catch (error) {
  console.error('Error setting up extension communications:', error)
}
