// Must be first: Chrome requires push / notificationclick / pushsubscriptionchange
// listeners during initial synchronous service worker evaluation.
import '../notifications/pushServiceWorkerBindings'

// Do NOT import '@core/ui/mpc/bootstrapMpcEngine' here. The SW never calls
// getMpcEngine() (see #3761); importing it drags @vultisig/mpc-wasm in and
// vite-plugin-top-level-await wraps the whole chunk in an async IIFE, so the
// bridge onMessage listener registers too late and every dApp call hangs.
import { runBackgroundEventsAgent } from '@core/inpage-provider/background/events/background'
import { runInpageProviderBridgeBackgroundAgent } from '@core/inpage-provider/bridge/background'

import { initPushExtensionRuntime } from '../notifications/handlePushEvents'
import { getIsSidePanelEnabled } from '../storage/isSidePanelEnabled'

initPushExtensionRuntime()

if (!navigator.userAgent.toLowerCase().includes('firefox')) {
  ;[
    Object,
    Object.prototype,
    Function,
    Function.prototype,
    Array,
    Array.prototype,
    String,
    String.prototype,
    Number,
    Number.prototype,
    Boolean,
    Boolean.prototype,
  ].forEach(Object.freeze)
}

runInpageProviderBridgeBackgroundAgent()

runBackgroundEventsAgent()

if (chrome.sidePanel) {
  getIsSidePanelEnabled().then(enabled =>
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: enabled })
      .catch(console.error)
  )
}
if (import.meta.env.VITE_DEV_RELOAD) {
  const connect = () => {
    const ws = new WebSocket('ws://localhost:18732')
    ws.onmessage = () => chrome.runtime.reload()
    ws.onclose = () => setTimeout(connect, 1000)
  }
  connect()
}
