// Must be first: Chrome requires push / notificationclick / pushsubscriptionchange
// listeners during initial synchronous service worker evaluation.
import '../notifications/pushServiceWorkerBindings'

import { registerFreshInstallStorageClear } from './registerFreshInstallStorageClear'

registerFreshInstallStorageClear()

// MPC note — see vultisig/vultisig-windows#3777.
// This service-worker chunk intentionally does NOT import @core/ui/mpc/bootstrapMpcEngine.
// The background worker does not call getMpcEngine() today; bootstrapping here
// would pull DKLS/Schnorr JS + WASM into the SW bundle for no reason. If you
// add MPC code paths to this chunk (e.g. a signing helper), import
// '@core/ui/mpc/bootstrapMpcEngine' at the top of this file BEFORE any other
// @vultisig/* import. The SW is a separate JS realm from the popup, so the
// shim must run once per realm.
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
