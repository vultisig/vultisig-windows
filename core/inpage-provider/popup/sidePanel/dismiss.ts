import { productName } from '@vultisig/core-config'

const sidePanelPopupDismissSourceId =
  `${productName}-popup--side-panel-dismiss` as const

type SidePanelPopupDismissMessage = {
  sourceId: typeof sidePanelPopupDismissSourceId
}

/**
 * Whether this popup page is shown inside the side panel rather than in a
 * popup window of its own. The side panel hosts it in a frame over the
 * wallet, so `window.close()` there would do nothing.
 */
export const isPopupInSidePanel = () => window.parent !== window

/**
 * Asks the side panel hosting this popup page to take it off screen and go
 * back to the wallet. A request that is still unanswered at that point is
 * rejected by the background, as closing the popup window would.
 */
export const dismissSidePanelPopup = () => {
  const message: SidePanelPopupDismissMessage = {
    sourceId: sidePanelPopupDismissSourceId,
  }

  // The popup page is web accessible, so only an extension page may hear it.
  window.parent.postMessage(message, window.location.origin)
}

/** Whether a frame message is the hosted popup page asking to be dismissed. */
export const isSidePanelPopupDismissMessage = (
  message: unknown
): message is SidePanelPopupDismissMessage =>
  typeof message === 'object' &&
  message !== null &&
  'sourceId' in message &&
  message.sourceId === sidePanelPopupDismissSourceId
