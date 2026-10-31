import { attempt, withFallback } from '@vultisig/lib-utils/attempt'

import {
  createSidePanelPopupRequest,
  SidePanelPopupCommand,
} from '../../sidePanel/request'
import { PopupSurface } from './popupSurface'

// The panel connects before it answers the claim, so its port is normally in
// by then. The wait only covers the two arriving out of order.
const portWaitMs = 3000

type OpenInSidePanelInput = {
  windowId: number
  url: string
}

// Chromium forks such as Vivaldi never report their side panel here, so they
// keep the popup window. Firefox has no side panel API at all.
const isAnySidePanelOpen = async () => {
  if (!chrome.sidePanel) return false

  const sidePanels = await withFallback(
    attempt(() => chrome.runtime.getContexts({ contextTypes: ['SIDE_PANEL'] })),
    []
  )

  return sidePanels.length > 0
}

// Every side panel hears the request, and only the one in `windowId` claims
// it, since that is the window the panel itself reports. Resolves the port
// the claiming panel connected, or `undefined` when no panel claimed it.
const claimSidePanel = ({ windowId, url }: OpenInSidePanelInput) =>
  new Promise<chrome.runtime.Port | undefined>(resolve => {
    const portName = `side-panel-popup:${crypto.randomUUID()}`
    let isSettled = false
    let portWait: ReturnType<typeof setTimeout> | undefined

    const handleConnect = (port: chrome.runtime.Port) => {
      if (port.name === portName) settle(port)
    }

    const settle = (port?: chrome.runtime.Port) => {
      if (isSettled) return
      isSettled = true
      clearTimeout(portWait)
      chrome.runtime.onConnect.removeListener(handleConnect)
      resolve(port)
    }

    chrome.runtime.onConnect.addListener(handleConnect)

    attempt(() =>
      chrome.runtime.sendMessage(
        createSidePanelPopupRequest({ windowId, url, portName })
      )
    ).then(result => {
      if (isSettled) return

      if ('data' in result && result.data === true) {
        portWait = setTimeout(settle, portWaitMs)
      } else {
        settle()
      }
    })
  })

/**
 * Shows a dApp request in the side panel open in `windowId`, or resolves
 * `undefined` when no panel there takes it. Closing the panel, or leaving the
 * request there without answering it, aborts the request.
 */
export const openInSidePanel = async (
  input: OpenInSidePanelInput
): Promise<PopupSurface | undefined> => {
  if (!(await isAnySidePanelOpen())) return undefined

  const port = await claimSidePanel(input)
  if (!port) return undefined

  const controller = new AbortController()
  let isConnected = true

  const handleDisconnect = () => {
    isConnected = false
    controller.abort()
  }
  port.onDisconnect.addListener(handleDisconnect)

  const send = (command: SidePanelPopupCommand) => {
    if (isConnected) port.postMessage(command)
  }

  // Dropping the port without `close` leaves an answered request's last
  // screen up in the panel, as a popup window that is not closed stays open.
  const release = () => {
    if (!isConnected) return
    isConnected = false
    port.onDisconnect.removeListener(handleDisconnect)
    port.disconnect()
  }

  send('show')

  return {
    abortSignal: controller.signal,
    close: () => {
      send('close')
      release()
    },
    release,
  }
}
