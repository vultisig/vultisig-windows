import { runBackgroundEventsAgent } from '@core/inpage-provider/background/events/background'
import { runInpageProviderBridgeBackgroundAgent } from '@core/inpage-provider/bridge/background'

import { getIsSidePanelEnabled } from '../storage/isSidePanelEnabled'
import { registerFreshInstallStorageClear } from './registerFreshInstallStorageClear'

registerFreshInstallStorageClear()

/**
 * Bootstraps the extension background: locks down built-in prototypes (non-Firefox),
 * starts the inpage-provider bridge and background event agents, applies the persisted
 * side panel behavior on Chromium, and wires the dev WebSocket reload when enabled.
 */
export const initExtensionBackground = () => {
  if (!__IS_FIREFOX_EXTENSION_BUILD__) {
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

  if (!__IS_FIREFOX_EXTENSION_BUILD__ && chrome.sidePanel) {
    getIsSidePanelEnabled()
      .then(enabled =>
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: enabled })
      )
      .catch(console.error)
  }

  if (import.meta.env.VITE_DEV_RELOAD) {
    const reloadPort = import.meta.env.VITE_EXTENSION_RELOAD_PORT || '18732'
    const connect = () => {
      const ws = new WebSocket(`ws://127.0.0.1:${reloadPort}`)
      ws.onmessage = () => chrome.runtime.reload()
      ws.onclose = () => setTimeout(connect, 1000)
    }
    connect()
  }
}
