import { runBackgroundEventsAgent } from '@core/inpage-provider/background/events/background'
import { runInpageProviderBridgeBackgroundAgent } from '@core/inpage-provider/bridge/background'

import { getIsSidePanelEnabled } from '../storage/isSidePanelEnabled'

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
  const applySidePanelBehavior = (enabled: boolean) =>
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: enabled })
      .catch(console.error)

  const openSidePanel = async () => {
    const [currentWindow] = await chrome.windows.getAll({
      windowTypes: ['normal'],
    })
    if (currentWindow?.id != null) {
      await chrome.sidePanel.open({ windowId: currentWindow.id })
    }
  }

  const closeSidePanel = async () => {
    await chrome.sidePanel.setOptions({ enabled: false })
    await chrome.sidePanel.setOptions({
      enabled: true,
      path: 'index.html',
    })
  }

  getIsSidePanelEnabled().then(applySidePanelBehavior)

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return
    if (!('isSidePanelEnabled' in changes)) return

    const { newValue } = changes.isSidePanelEnabled as { newValue?: boolean }
    const enabled = newValue ?? false
    applySidePanelBehavior(enabled)

    if ('open' in chrome.sidePanel && 'setOptions' in chrome.sidePanel) {
      if (enabled) {
        openSidePanel().catch(console.error)
      } else {
        closeSidePanel().catch(console.error)
      }
    }
  })
}
if (import.meta.env.VITE_DEV_RELOAD) {
  const connect = () => {
    const ws = new WebSocket('ws://localhost:18732')
    ws.onmessage = () => chrome.runtime.reload()
    ws.onclose = () => setTimeout(connect, 1000)
  }
  connect()
}
