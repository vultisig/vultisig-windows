import { isSidePanelPopupDismissMessage } from '@core/inpage-provider/popup/sidePanel/dismiss'
import {
  isSidePanelPopupCommand,
  isSidePanelPopupRequest,
} from '@core/inpage-provider/popup/sidePanel/request'
import { currentProductBrandConfig } from '@core/ui/product/brand'
import { getColor } from '@lib/ui/theme/getters'
import { attempt } from '@vultisig/lib-utils/attempt'
import { match } from '@vultisig/lib-utils/match'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

const Frame = styled.iframe`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: ${getColor('background')};
  /* Above the wallet's modals, which sit at 1000. */
  z-index: 1001;
`

// Outside the action popup, the side panel is the only wallet page that is
// not in a tab.
const getSidePanelWindowId = async () => {
  const [tab, currentWindow] = await Promise.all([
    chrome.tabs.getCurrent(),
    chrome.windows.getCurrent(),
  ])

  return tab ? undefined : currentWindow.id
}

/**
 * Shows the dApp requests the background routes to this side panel in a frame
 * over the wallet, so answering or leaving one returns to the wallet as the
 * user left it. Claims only requests from the panel's own browser window, and
 * none at all outside the side panel. Mount it only outside the action popup.
 */
export const SidePanelPopupHost = () => {
  const [url, setUrl] = useState<string | null>(null)
  const portRef = useRef<chrome.runtime.Port | null>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!chrome.sidePanel) return

    let windowId: number | undefined
    attempt(getSidePanelWindowId).then(result => {
      if ('data' in result) windowId = result.data
    })

    // Dropping the port tells the background the request left the screen,
    // which rejects it if the user had not answered it yet.
    const dismiss = () => {
      portRef.current?.disconnect()
      portRef.current = null
      setUrl(null)
    }

    const handleRequest = (
      message: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (isClaimed: boolean) => void
    ) => {
      if (!isSidePanelPopupRequest(message)) return
      // Content scripts can message extension pages too, but only the
      // background routes requests here.
      if (sender.tab || message.windowId !== windowId) return

      portRef.current?.disconnect()
      const port = chrome.runtime.connect({ name: message.portName })
      portRef.current = port

      port.onMessage.addListener((command: unknown) => {
        if (!isSidePanelPopupCommand(command) || portRef.current !== port) {
          return
        }

        match(command, {
          show: () => setUrl(message.url),
          close: dismiss,
        })
      })
      // The background lets go of an answered request without closing it,
      // which leaves its last screen up until the user leaves it.
      port.onDisconnect.addListener(() => {
        if (portRef.current === port) portRef.current = null
      })

      sendResponse(true)
    }

    const handleFrameMessage = ({ data, origin, source }: MessageEvent) => {
      if (origin !== window.location.origin) return
      if (source !== frameRef.current?.contentWindow) return
      if (isSidePanelPopupDismissMessage(data)) dismiss()
    }

    chrome.runtime.onMessage.addListener(handleRequest)
    window.addEventListener('message', handleFrameMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleRequest)
      window.removeEventListener('message', handleFrameMessage)
      portRef.current?.disconnect()
      portRef.current = null
    }
  }, [])

  if (!url) return null

  // Portaled so the wallet's own modals, which also render into the body,
  // stay underneath.
  return createPortal(
    <Frame
      key={url}
      ref={frameRef}
      src={url}
      title={currentProductBrandConfig.name}
    />,
    document.body
  )
}
